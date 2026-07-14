import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getSummary = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const categories = await ctx.db.query("categories").collect();
    const unassigned = products.filter(p => !categories.some(c => c._id === p.categoryId));
    return {
      totalProducts: products.length, totalCategories: categories.length, unassignedToCategory: unassigned.length,
      kitchenProducts: products.filter(p => p.businessType === "kitchen").length,
      martProducts: products.filter(p => p.businessType === "mart").length,
      kitchenCategories: categories.filter(c => c.businessType === "kitchen" || c.businessType === "both").length,
      martCategories: categories.filter(c => c.businessType === "mart" || c.businessType === "both").length,
    };
  },
});

export const migrateProductsToCategory = mutation({
  args: { productIds: v.array(v.id("products")), targetCategoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const target = await ctx.db.get(args.targetCategoryId);
    if (!target) return { success: false, message: "Category not found" };
    let migrated = 0;
    for (const id of args.productIds) {
      const p = await ctx.db.get(id);
      if (p && p.categoryId !== args.targetCategoryId) { await ctx.db.patch(id, { categoryId: args.targetCategoryId, updatedAt: Date.now() }); migrated++; }
    }
    return { success: true, message: `Migrated ${migrated} products`, migrated };
  },
});

export const reassignBusinessType = mutation({
  args: { productIds: v.array(v.id("products")), newBusinessType: v.union(v.literal("kitchen"), v.literal("mart")) },
  handler: async (ctx, args) => {
    let reassigned = 0;
    for (const id of args.productIds) {
      const p = await ctx.db.get(id);
      if (p && p.businessType !== args.newBusinessType) { await ctx.db.patch(id, { businessType: args.newBusinessType, updatedAt: Date.now() }); reassigned++; }
    }
    return { success: true, message: `Reassigned ${reassigned} products`, reassigned };
  },
});

export const getOrphanedProducts = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const cats = new Set((await ctx.db.query("categories").collect()).map(c => c._id));
    return products.filter(p => !cats.has(p.categoryId)).map(p => ({ id: p._id, name: p.name, slug: p.slug }));
  },
});

export const deleteOrphanedProducts = mutation({
  args: { productIds: v.array(v.id("products")) },
  handler: async (ctx, args) => {
    for (const id of args.productIds) await ctx.db.delete(id);
    return { success: true, message: `Deleted ${args.productIds.length} orphaned products` };
  },
});
