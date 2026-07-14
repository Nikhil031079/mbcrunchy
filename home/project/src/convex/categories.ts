import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const getAll = query({
  args: { businessType: v.optional(v.union(v.literal("kitchen"), v.literal("mart"))), includeInactive: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let cats;
    if (args.businessType) cats = await ctx.db.query("categories").withIndex("businessType", (q) => q.eq("businessType", args.businessType as "kitchen" | "mart")).collect();
    else cats = await ctx.db.query("categories").collect();
    if (!args.includeInactive) cats = cats.filter(c => c.isActive);
    cats.sort((a, b) => a.displayOrder - b.displayOrder);
    return cats;
  },
});

export const getTree = query({
  args: { businessType: v.optional(v.union(v.literal("kitchen"), v.literal("mart"))), includeInactive: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let cats;
    if (args.businessType) cats = await ctx.db.query("categories").withIndex("businessType", (q) => q.eq("businessType", args.businessType as "kitchen" | "mart")).collect();
    else cats = await ctx.db.query("categories").collect();
    if (!args.includeInactive) cats = cats.filter(c => c.isActive);
    cats.sort((a, b) => a.displayOrder - b.displayOrder);
    const tree: Array<Doc<"categories"> & { children: Doc<"categories">[] }> = [];
    const childMap = new Map<Id<"categories">, Doc<"categories">[]>();
    for (const c of cats) { if (c.parentId) { const ch = childMap.get(c.parentId) || []; ch.push(c); childMap.set(c.parentId, ch); } else tree.push({ ...c, children: [] }); }
    function attach(nodes: Array<Doc<"categories"> & { children: Doc<"categories">[] }>) { for (const n of nodes) { n.children = (childMap.get(n._id) || []).map(k => ({ ...k, children: [] })); attach(n.children as any); } }
    attach(tree);
    return tree;
  },
});

export const create = mutation({
  args: { name: v.string(), slug: v.string(), description: v.optional(v.string()), image: v.optional(v.string()), parentId: v.optional(v.id("categories")), businessType: v.union(v.literal("kitchen"), v.literal("mart"), v.literal("both")), displayOrder: v.optional(v.number()), isActive: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("categories").collect();
    const maxOrder = all.reduce((m, c) => Math.max(m, c.displayOrder), 0);
    const now = Date.now();
    const id = await ctx.db.insert("categories", { name: args.name, slug: args.slug, description: args.description, image: args.image, parentId: args.parentId, businessType: args.businessType, displayOrder: args.displayOrder ?? maxOrder + 1, isActive: args.isActive ?? true, createdAt: now, updatedAt: now });
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: { id: v.id("categories"), name: v.optional(v.string()), slug: v.optional(v.string()), description: v.optional(v.string()), image: v.optional(v.string()), parentId: v.optional(v.id("categories")), businessType: v.optional(v.union(v.literal("kitchen"), v.literal("mart"), v.literal("both"))), displayOrder: v.optional(v.number()), isActive: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updates)) { if (v !== undefined) data[k] = v; }
    data.updatedAt = Date.now();
    await ctx.db.patch(id, data as any);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const cat = await ctx.db.get(args.id);
    if (!cat) return { success: false };
    const children = await ctx.db.query("categories").withIndex("parentId", (q) => q.eq("parentId", args.id)).collect();
    if (children.length > 0) return { success: false, message: `Has ${children.length} subcategories` };
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const reorder = mutation({
  args: { items: v.array(v.object({ id: v.id("categories"), displayOrder: v.number(), parentId: v.optional(v.id("categories")) })) },
  handler: async (ctx, args) => {
    const now = Date.now();
    for (const item of args.items) await ctx.db.patch(item.id, { displayOrder: item.displayOrder, parentId: item.parentId, updatedAt: now });
    return { success: true };
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const cats = await ctx.db.query("categories").collect();
    return { total: cats.length, active: cats.filter(c => c.isActive).length, kitchen: cats.filter(c => c.businessType === "kitchen" || c.businessType === "both").length, mart: cats.filter(c => c.businessType === "mart" || c.businessType === "both").length };
  },
});
