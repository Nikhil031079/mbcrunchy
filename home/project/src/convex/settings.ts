import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const DEFAULT_SETTINGS: Record<string, unknown> = {
  businessName: "MB Crunchy", businessTagline: "Fresh & Delicious",
  businessEmail: "hello@mbcrunchy.com", businessPhone: "", businessAddress: "",
  businessLogo: "", businessFavicon: "",
  primaryColor: "#E85D2C", secondaryColor: "#F5A623", accentColor: "#2ECC71",
  backgroundColor: "#FFF8F0", textColor: "#1A1A2E",
  whatsappNumber: "", instagramUrl: "", facebookUrl: "", youtubeUrl: "", twitterUrl: "",
  upiId: "", upiMerchantName: "MB Crunchy",
  deliveryEnabled: true, takeawayEnabled: true, deliveryRadius: 10,
  deliveryCharge: 30, freeDeliveryMinOrder: 200, estimatedDeliveryMinutes: 30, maxDeliveryDistance: 15,
  openingTime: "09:00", closingTime: "22:00",
  kitchenOpenDays: ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"],
  martOpenDays: ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"],
  taxRate: 5, taxName: "GST", packingCharge: 10,
  newOrderNotification: true, lowStockNotification: true, lowStockThreshold: 10,
};

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const s = await ctx.db.query("settings").withIndex("key", (q) => q.eq("key", args.key)).first();
    return s?.value ?? null;
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("settings").collect();
    const result: Record<string, unknown> = { ...DEFAULT_SETTINGS };
    for (const s of all) result[s.key] = s.value;
    return result;
  },
});

export const set = mutation({
  args: { key: v.string(), value: v.any() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("settings").withIndex("key", (q) => q.eq("key", args.key)).first();
    if (existing) await ctx.db.patch(existing._id, { value: args.value, updatedAt: Date.now() });
    else await ctx.db.insert("settings", { key: args.key, value: args.value, updatedAt: Date.now() });
  },
});

export const bulkUpdate = mutation({
  args: { settings: v.array(v.object({ key: v.string(), value: v.any() })) },
  handler: async (ctx, args) => {
    const now = Date.now();
    for (const { key, value } of args.settings) {
      const existing = await ctx.db.query("settings").withIndex("key", (q) => q.eq("key", key)).first();
      if (existing) await ctx.db.patch(existing._id, { value, updatedAt: now });
      else await ctx.db.insert("settings", { key, value, updatedAt: now });
    }
  },
});

export const getBranding = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("settings").collect();
    const keys = ["businessName","businessTagline","businessLogo","businessFavicon","primaryColor","secondaryColor","accentColor","backgroundColor","textColor","whatsappNumber","instagramUrl","facebookUrl","youtubeUrl","twitterUrl","upiId","upiMerchantName","businessPhone","businessEmail","businessAddress"];
    const r: Record<string, unknown> = {};
    for (const k of keys) { const s = all.find(x => x.key === k); r[k] = s?.value ?? DEFAULT_SETTINGS[k] ?? null; }
    return r;
  },
});

export const getDeliverySettings = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("settings").collect();
    const keys = ["deliveryEnabled","takeawayEnabled","deliveryRadius","deliveryCharge","freeDeliveryMinOrder","estimatedDeliveryMinutes","maxDeliveryDistance","openingTime","closingTime"];
    const r: Record<string, unknown> = {};
    for (const k of keys) { const s = all.find(x => x.key === k); r[k] = s?.value ?? DEFAULT_SETTINGS[k] ?? null; }
    return r;
  },
});
