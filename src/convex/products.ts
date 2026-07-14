import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

const VALID_UNITS = ["gm","kg","ml","litre","pcs","piece","plate","pack","box","jar","bottle"];

export const getAll = query({
  args: { businessType: v.optional(v.union(v.literal("kitchen"), v.literal("mart"))), categoryId: v.optional(v.id("categories")), includeInactive: v.optional(v.boolean()), search: v.optional(v.string()), limit: v.optional(v.number()), offset: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let products: Doc<"products">[];
    if (args.businessType) products = await ctx.db.query("products").withIndex("businessType", (q) => q.eq("businessType", args.businessType as "kitchen" | "mart")).collect();
    else products = await ctx.db.query("products").collect();
    if (!args.includeInactive) products = products.filter(p => p.isActive);
    if (args.categoryId) { products = products.filter(p => p.categoryId === args.categoryId); }
    if (args.search) { const q = args.search.toLowerCase(); products = products.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)); }
    products.sort((a, b) => a.displayOrder - b.displayOrder);
    const total = products.length;
    const off = args.offset || 0; const lim = args.limit || 50;
    return { products: products.slice(off, off + lim), total };
  },
});

export const getById = query({ args: { id: v.id("products") }, handler: async (ctx, args) => await ctx.db.get(args.id) });

export const create = mutation({
  args: { name: v.string(), slug: v.string(), description: v.optional(v.string()), images: v.array(v.string()), categoryId: v.id("categories"), businessType: v.union(v.literal("kitchen"), v.literal("mart")), mrp: v.number(), sellingPrice: v.number(), sku: v.optional(v.string()), stock: v.number(), lowStockAlert: v.optional(v.number()), displayOrder: v.optional(v.number()), isVeg: v.boolean(), isBestSeller: v.optional(v.boolean()), isNewArrival: v.optional(v.boolean()), isOutOfStock: v.optional(v.boolean()), weightValue: v.number(), weightUnit: v.string(), isActive: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    if (!VALID_UNITS.includes(args.weightUnit)) throw new Error("Invalid unit");
    const existing = await ctx.db.query("products").withIndex("slug", (q) => q.eq("slug", args.slug)).collect();
    if (existing.length > 0) throw new Error("Slug exists");
    const now = Date.now();
    const id = await ctx.db.insert("products", { name: args.name, slug: args.slug, description: args.description, images: args.images, categoryId: args.categoryId, businessType: args.businessType, mrp: args.mrp, sellingPrice: args.sellingPrice, discount: Math.round((1 - args.sellingPrice / args.mrp) * 100), sku: args.sku, stock: args.stock, lowStockAlert: args.lowStockAlert, displayOrder: args.displayOrder ?? 0, isVeg: args.isVeg, isBestSeller: args.isBestSeller, isNewArrival: args.isNewArrival, isOutOfStock: args.isOutOfStock, weightValue: args.weightValue, weightUnit: args.weightUnit, isActive: args.isActive ?? true, createdAt: now, updatedAt: now });
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: { id: v.id("products"), name: v.optional(v.string()), slug: v.optional(v.string()), description: v.optional(v.string()), images: v.optional(v.array(v.string())), categoryId: v.optional(v.id("categories")), businessType: v.optional(v.union(v.literal("kitchen"), v.literal("mart"))), mrp: v.optional(v.number()), sellingPrice: v.optional(v.number()), sku: v.optional(v.string()), stock: v.optional(v.number()), lowStockAlert: v.optional(v.number()), displayOrder: v.optional(v.number()), isVeg: v.optional(v.boolean()), isBestSeller: v.optional(v.boolean()), isNewArrival: v.optional(v.boolean()), isOutOfStock: v.optional(v.boolean()), weightValue: v.optional(v.number()), weightUnit: v.optional(v.string()), isActive: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updates)) { if (v !== undefined) data[k] = v; }
    data.updatedAt = Date.now();
    await ctx.db.patch(id, data as any);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({ args: { id: v.id("products") }, handler: async (ctx, args) => { await ctx.db.delete(args.id); return { success: true }; } });

export const toggleActive = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const p = await ctx.db.get(args.id);
    if (!p) return { success: false };
    await ctx.db.patch(args.id, { isActive: !p.isActive, updatedAt: Date.now() });
    return { success: true, isActive: !p.isActive };
  },
});
