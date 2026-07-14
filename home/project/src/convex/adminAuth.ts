import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "Admin@123";
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEY_LENGTH = 64;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

function generateSalt(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let salt = "";
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  for (let i = 0; i < 32; i++) salt += chars[array[i] % chars.length];
  return salt;
}

function generateRecoveryKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segments: string[] = [];
  for (let s = 0; s < 4; s++) {
    let segment = "";
    const array = new Uint8Array(4);
    crypto.getRandomValues(array);
    for (let i = 0; i < 4; i++) segment += chars[array[i] % chars.length];
    segments.push(segment);
  }
  return segments.join("-");
}

function generateSessionToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  const array = new Uint8Array(48);
  crypto.getRandomValues(array);
  for (let i = 0; i < 48; i++) token += chars[array[i] % chars.length];
  return token;
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: encoder.encode(salt), iterations: PBKDF2_ITERATIONS, hash: "SHA-512" },
    keyMaterial, PBKDF2_KEY_LENGTH * 8
  );
  return Array.from(new Uint8Array(derivedBits)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const initializeAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("adminAuth").withIndex("username", (q) => q.eq("username", DEFAULT_USERNAME)).first();
    if (existing) return { initialized: false, message: "Admin already exists" };
    const salt = generateSalt();
    const passwordHash = await hashPassword(DEFAULT_PASSWORD, salt);
    const recoveryKey = generateRecoveryKey();
    const recoveryKeyHash = await hashPassword(recoveryKey, salt);
    const now = Date.now();
    await ctx.db.insert("adminAuth", { username: DEFAULT_USERNAME, passwordHash, salt, recoveryKey, recoveryKeyHash, failedLoginAttempts: 0, createdAt: now, updatedAt: now });
    return { initialized: true, message: "Admin created", recoveryKey };
  },
});

export const verifyPassword = query({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    const admin = await ctx.db.query("adminAuth").withIndex("username", (q) => q.eq("username", DEFAULT_USERNAME)).first();
    if (!admin) return { valid: false, message: "Admin not found" };
    if (admin.lockedUntil && admin.lockedUntil > Date.now()) {
      const remaining = Math.ceil((admin.lockedUntil - Date.now()) / 1000);
      return { valid: false, message: `Locked. Try again in ${remaining}s`, locked: true, remainingSeconds: remaining };
    }
    const hash = await hashPassword(args.password, admin.salt);
    return { valid: hash === admin.passwordHash };
  },
});

export const login = mutation({
  args: { password: v.string(), ipAddress: v.optional(v.string()), userAgent: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const admin = await ctx.db.query("adminAuth").withIndex("username", (q) => q.eq("username", DEFAULT_USERNAME)).first();
    if (!admin) return { success: false, message: "Admin not found" };
    const now = Date.now();
    if (admin.lockedUntil && admin.lockedUntil > now) {
      return { success: false, message: `Locked. Try again in ${Math.ceil((admin.lockedUntil - now) / 1000)}s`, locked: true };
    }
    const hash = await hashPassword(args.password, admin.salt);
    if (hash !== admin.passwordHash) {
      const failed = (admin.failedLoginAttempts || 0) + 1;
      const update: Record<string, any> = { failedLoginAttempts: failed, updatedAt: now };
      if (failed >= MAX_FAILED_ATTEMPTS) update.lockedUntil = now + LOCKOUT_DURATION_MS;
      await ctx.db.patch(admin._id, update);
      await ctx.db.insert("adminAuditLogs", { adminId: admin._id, action: "login_failed", details: `Failed ${failed}/${MAX_FAILED_ATTEMPTS}`, ipAddress: args.ipAddress, createdAt: now });
      const remaining = MAX_FAILED_ATTEMPTS - failed;
      return { success: false, message: remaining > 0 ? `Invalid. ${remaining} attempts left` : "Locked 15min", attemptsRemaining: Math.max(0, remaining), locked: failed >= MAX_FAILED_ATTEMPTS };
    }
    const token = generateSessionToken();
    await ctx.db.patch(admin._id, { failedLoginAttempts: 0, lockedUntil: undefined, lastLoginAt: now, lastLoginIp: args.ipAddress, updatedAt: now });
    await ctx.db.insert("adminSessions", { adminId: admin._id, token, ipAddress: args.ipAddress, userAgent: args.userAgent, expiresAt: now + SESSION_DURATION_MS, createdAt: now });
    await ctx.db.insert("adminAuditLogs", { adminId: admin._id, action: "login", details: "Success", ipAddress: args.ipAddress, createdAt: now });
    return { success: true, token, adminId: admin._id, expiresAt: now + SESSION_DURATION_MS };
  },
});

export const verifySession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db.query("adminSessions").withIndex("token", (q) => q.eq("token", args.token)).first();
    if (!session) return { valid: false, message: "Invalid session" };
    if (session.expiresAt < Date.now()) return { valid: false, message: "Expired" };
    return { valid: true, adminId: session.adminId };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db.query("adminSessions").withIndex("token", (q) => q.eq("token", args.token)).first();
    if (session) { await ctx.db.insert("adminAuditLogs", { adminId: session.adminId, action: "logout", createdAt: Date.now() }); await ctx.db.delete(session._id); }
  },
});

export const changePassword = mutation({
  args: { currentPassword: v.string(), newPassword: v.string(), token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db.query("adminSessions").withIndex("token", (q) => q.eq("token", args.token)).first();
    if (!session || session.expiresAt < Date.now()) return { success: false, message: "Invalid session" };
    const admin = await ctx.db.get(session.adminId);
    if (!admin) return { success: false, message: "Not found" };
    if (await hashPassword(args.currentPassword, admin.salt) !== admin.passwordHash) return { success: false, message: "Wrong password" };
    if (args.newPassword.length < 6) return { success: false, message: "Min 6 characters" };
    const newSalt = generateSalt();
    const newHash = await hashPassword(args.newPassword, newSalt);
    await ctx.db.patch(admin._id, { passwordHash: newHash, salt: newSalt, updatedAt: Date.now() });
    await ctx.db.insert("adminAuditLogs", { adminId: admin._id, action: "password_changed", createdAt: Date.now() });
    return { success: true, message: "Password changed" };
  },
});

export const getRecoveryKeyHint = query({
  args: {},
  handler: async (ctx) => {
    const admin = await ctx.db.query("adminAuth").withIndex("username", (q) => q.eq("username", DEFAULT_USERNAME)).first();
    if (!admin || !admin.recoveryKey) return { available: false };
    return { available: true, hint: admin.recoveryKey.substring(0, 5) + "****-****-****" + admin.recoveryKey.substring(19) };
  },
});

export const resetPasswordWithRecoveryKey = mutation({
  args: { recoveryKey: v.string(), newPassword: v.string() },
  handler: async (ctx, args) => {
    const admin = await ctx.db.query("adminAuth").withIndex("username", (q) => q.eq("username", DEFAULT_USERNAME)).first();
    if (!admin || !admin.recoveryKeyHash) return { success: false, message: "No recovery key set" };
    const keyHash = await hashPassword(args.recoveryKey.toUpperCase(), admin.salt);
    if (keyHash !== admin.recoveryKeyHash) return { success: false, message: "Invalid key" };
    if (args.newPassword.length < 6) return { success: false, message: "Min 6 characters" };
    const newSalt = generateSalt();
    const newHash = await hashPassword(args.newPassword, newSalt);
    await ctx.db.patch(admin._id, { passwordHash: newHash, salt: newSalt, failedLoginAttempts: 0, lockedUntil: undefined, updatedAt: Date.now() });
    await ctx.db.insert("adminAuditLogs", { adminId: admin._id, action: "password_reset", createdAt: Date.now() });
    return { success: true, message: "Password reset" };
  },
});

export const getAdminInfo = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db.query("adminSessions").withIndex("token", (q) => q.eq("token", args.token)).first();
    if (!session || session.expiresAt < Date.now()) return null;
    const admin = await ctx.db.get(session.adminId);
    if (!admin) return null;
    return { username: admin.username, lastLoginAt: admin.lastLoginAt, lastLoginIp: admin.lastLoginIp, createdAt: admin.createdAt };
  },
});

export const getAuditLogs = query({
  args: { token: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const logs = await ctx.db.query("adminAuditLogs").order("desc").take(args.limit || 50);
    return logs.map((l) => ({ action: l.action, details: l.details, ipAddress: l.ipAddress, createdAt: l.createdAt }));
  },
});

export const getActiveSessions = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const current = await ctx.db.query("adminSessions").withIndex("token", (q) => q.eq("token", args.token)).first();
    if (!current) return [];
    const sessions = await ctx.db.query("adminSessions").withIndex("adminId", (q) => q.eq("adminId", current.adminId)).collect();
    return sessions.filter((s) => s.expiresAt > Date.now()).map((s) => ({ id: s._id, ipAddress: s.ipAddress, userAgent: s.userAgent, createdAt: s.createdAt, expiresAt: s.expiresAt, isCurrent: s.token === args.token }));
  },
});

export const revokeSession = mutation({
  args: { token: v.string(), sessionIdToRevoke: v.id("adminSessions") },
  handler: async (ctx, args) => {
    const current = await ctx.db.query("adminSessions").withIndex("token", (q) => q.eq("token", args.token)).first();
    if (!current) return { success: false };
    const target = await ctx.db.get(args.sessionIdToRevoke);
    if (target?.adminId === current.adminId) { await ctx.db.delete(args.sessionIdToRevoke); return { success: true }; }
    return { success: false };
  },
});
