import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  adminAuth: defineTable({
    username: v.string(),
    passwordHash: v.string(),
    salt: v.string(),
    recoveryKey: v.optional(v.string()),
    recoveryKeyHash: v.optional(v.string()),
    failedLoginAttempts: v.optional(v.number()),
    lockedUntil: v.optional(v.number()),
    lastLoginAt: v.optional(v.number()),
    lastLoginIp: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("username", ["username"]),

  adminSessions: defineTable({
    adminId: v.id("adminAuth"),
    token: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("token", ["token"]),

  adminAuditLogs: defineTable({
    adminId: v.id("adminAuth"),
    action: v.string(),
    details: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    createdAt: v.number(),
  }).index("adminId", ["adminId"]),

  settings: defineTable({
    key: v.string(),
    value: v.any(),
    updatedAt: v.number(),
  }).index("key", ["key"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    parentId: v.optional(v.id("categories")),
    businessType: v.union(v.literal("kitchen"), v.literal("mart"), v.literal("both")),
    displayOrder: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("slug", ["slug"]).index("parentId", ["parentId"])
    .index("businessType", ["businessType"]).index("displayOrder", ["displayOrder"]),

  products: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    images: v.array(v.string()),
    categoryId: v.id("categories"),
    businessType: v.union(v.literal("kitchen"), v.literal("mart")),
    mrp: v.number(),
    sellingPrice: v.number(),
    discount: v.optional(v.number()),
    sku: v.optional(v.string()),
    stock: v.number(),
    lowStockAlert: v.optional(v.number()),
    displayOrder: v.number(),
    isVeg: v.boolean(),
    isBestSeller: v.optional(v.boolean()),
    isNewArrival: v.optional(v.boolean()),
    isOutOfStock: v.optional(v.boolean()),
    weightValue: v.number(),
    weightUnit: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("slug", ["slug"]).index("categoryId", ["categoryId"])
    .index("businessType", ["businessType"]).index("displayOrder", ["displayOrder"])
    .index("isActive", ["isActive"]),

  orders: defineTable({
    orderNumber: v.string(), customerName: v.string(), customerPhone: v.string(),
    customerEmail: v.optional(v.string()),
    businessType: v.union(v.literal("kitchen"), v.literal("mart")),
    orderType: v.union(v.literal("delivery"), v.literal("takeaway")),
    items: v.array(v.object({ productId: v.id("products"), name: v.string(), quantity: v.number(), unitPrice: v.number(), totalPrice: v.number(), weight: v.optional(v.string()) })),
    subtotal: v.number(), discount: v.optional(v.number()),
    deliveryCharge: v.optional(v.number()), packingCharge: v.optional(v.number()), tax: v.optional(v.number()),
    total: v.number(),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("preparing"), v.literal("ready"), v.literal("out_for_delivery"), v.literal("delivered"), v.literal("cancelled")),
    paymentMethod: v.union(v.literal("cod"), v.literal("upi")),
    paymentStatus: v.union(v.literal("pending"), v.literal("paid"), v.literal("failed")),
    upiTransactionId: v.optional(v.string()),
    deliveryAddress: v.optional(v.object({ street: v.string(), city: v.string(), state: v.string(), pincode: v.string(), landmark: v.optional(v.string()) })),
    notes: v.optional(v.string()),
    createdAt: v.number(), updatedAt: v.number(),
  }).index("orderNumber", ["orderNumber"]).index("status", ["status"]).index("createdAt", ["createdAt"]),

  reviews: defineTable({
    productId: v.id("products"), orderId: v.optional(v.id("orders")),
    customerName: v.string(), customerPhone: v.string(),
    rating: v.number(), comment: v.optional(v.string()),
    isVerifiedPurchase: v.boolean(), isApproved: v.boolean(), createdAt: v.number(),
  }).index("productId", ["productId"]).index("isApproved", ["isApproved"]),

  coupons: defineTable({
    code: v.string(), description: v.optional(v.string()),
    discountType: v.union(v.literal("percentage"), v.literal("fixed")),
    discountValue: v.number(), minOrderValue: v.optional(v.number()), maxDiscount: v.optional(v.number()),
    usageLimit: v.optional(v.number()), usedCount: v.number(),
    businessType: v.union(v.literal("kitchen"), v.literal("mart"), v.literal("both")),
    isActive: v.boolean(), startsAt: v.optional(v.number()), expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("code", ["code"]).index("isActive", ["isActive"]),

  offers: defineTable({
    title: v.string(), description: v.optional(v.string()), image: v.optional(v.string()),
    discountType: v.union(v.literal("percentage"), v.literal("fixed")),
    discountValue: v.number(),
    businessType: v.union(v.literal("kitchen"), v.literal("mart"), v.literal("both")),
    applicableProductIds: v.optional(v.array(v.id("products"))),
    minOrderValue: v.optional(v.number()), maxDiscount: v.optional(v.number()),
    isActive: v.boolean(), startsAt: v.optional(v.number()), expiresAt: v.optional(v.number()),
    displayOrder: v.number(), createdAt: v.number(), updatedAt: v.number(),
  }).index("isActive", ["isActive"]).index("businessType", ["businessType"]),

  combos: defineTable({
    name: v.string(), description: v.optional(v.string()), image: v.optional(v.string()),
    businessType: v.union(v.literal("kitchen"), v.literal("mart"), v.literal("both")),
    items: v.array(v.object({ productId: v.id("products"), quantity: v.number() })),
    mrp: v.number(), sellingPrice: v.number(), discount: v.optional(v.number()),
    isVeg: v.boolean(), isActive: v.boolean(), displayOrder: v.number(),
    createdAt: v.number(), updatedAt: v.number(),
  }).index("isActive", ["isActive"]).index("businessType", ["businessType"]),

  partyPacks: defineTable({
    name: v.string(), description: v.optional(v.string()), image: v.optional(v.string()),
    businessType: v.union(v.literal("kitchen"), v.literal("mart"), v.literal("both")),
    items: v.array(v.object({ productId: v.id("products"), quantity: v.number() })),
    serves: v.number(), mrp: v.number(), sellingPrice: v.number(), discount: v.optional(v.number()),
    isVeg: v.boolean(), isActive: v.boolean(), displayOrder: v.number(),
    createdAt: v.number(), updatedAt: v.number(),
  }).index("isActive", ["isActive"]).index("businessType", ["businessType"]),
});
