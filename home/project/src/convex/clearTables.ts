import { mutation } from "./_generated/server";

const ALL_TABLES = [
  "adminAuth", "adminSessions", "adminAuditLogs", "settings", "categories",
  "products", "orders", "reviews", "coupons", "offers", "combos", "partyPacks",
  "customers", "blogs", "faqs", "contactMessages", "gallery",
  "authAccounts", "authSessions", "authVerificationCodes", "authVerifiers",
  "authRefreshTokens", "authRateLimits",
  "couponUsage", "flashSales", "happyHours", "volumeDeals",
  "crossSellRules", "frequentlyBought", "upsellingRules", "mealUpgrades",
  "productAddOns", "productVariants", "priceHistory",
  "referralProgram", "rewardConfig", "rewardPoints",
  "auditLogs", "otps", "users", "platters",
];

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    let total = 0;
    for (const t of ALL_TABLES) {
      try {
        const docs = await ctx.db.query(t).collect();
        for (const d of docs) {
          await ctx.db.delete(d._id);
          total++;
        }
      } catch (e: any) {
        // Table may not exist yet
      }
    }
    return { deleted: total, tables: ALL_TABLES.length };
  },
});
