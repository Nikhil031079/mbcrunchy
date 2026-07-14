import { query } from "./_generated/server";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const orders = await ctx.db.query("orders").collect();
    const categories = await ctx.db.query("categories").collect();
    const reviews = await ctx.db.query("reviews").collect();

    const kitchenProducts = products.filter(p => p.businessType === "kitchen");
    const martProducts = products.filter(p => p.businessType === "mart");
    const activeKitchen = kitchenProducts.filter(p => p.isActive);
    const activeMart = martProducts.filter(p => p.isActive);

    const pendingOrders = orders.filter(o => o.status === "pending");
    const preparingOrders = orders.filter(o => o.status === "preparing");
    const deliveredOrders = orders.filter(o => o.status === "delivered");
    const cancelledOrders = orders.filter(o => o.status === "cancelled");

    const totalRevenue = orders.filter(o => o.status === "delivered" && o.paymentStatus === "paid").reduce((s, o) => s + o.total, 0);
    const pendingRevenue = orders.filter(o => o.status !== "cancelled" && o.paymentStatus === "pending").reduce((s, o) => s + o.total, 0);

    const lowStockProducts = products.filter(p => p.lowStockAlert && p.stock <= p.lowStockAlert && p.stock > 0);
    const outOfStockProducts = products.filter(p => p.isOutOfStock || p.stock <= 0);
    const averageRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

    const recentOrders = orders.sort((a, b) => b.createdAt - a.createdAt).slice(0, 10).map(o => ({
      id: o._id, orderNumber: o.orderNumber, customerName: o.customerName,
      businessType: o.businessType, total: o.total, status: o.status, createdAt: o.createdAt,
    }));

    const now = Date.now();
    const sevenDays = now - 7 * 86400000;
    const recentForChart = orders.filter(o => o.createdAt >= sevenDays);
    const ordersByDay: Record<string, number> = {};
    const revenueByDay: Record<string, number> = {};
    for (let i = 0; i < 7; i++) { const d = new Date(now - i * 86400000).toISOString().split("T")[0]; ordersByDay[d] = 0; revenueByDay[d] = 0; }
    for (const o of recentForChart) {
      const d = new Date(o.createdAt).toISOString().split("T")[0];
      if (ordersByDay[d] !== undefined) ordersByDay[d]++;
      if (o.status === "delivered" && revenueByDay[d] !== undefined) revenueByDay[d] += o.total;
    }

    return {
      totalProducts: products.length, kitchenProducts: kitchenProducts.length, martProducts: martProducts.length,
      activeKitchenProducts: activeKitchen.length, activeMartProducts: activeMart.length,
      lowStockProducts: lowStockProducts.length, outOfStockProducts: outOfStockProducts.length,
      totalCategories: categories.length, activeCategories: categories.filter(c => c.isActive).length,
      totalOrders: orders.length, pendingOrders: pendingOrders.length, preparingOrders: preparingOrders.length,
      deliveredOrders: deliveredOrders.length, cancelledOrders: cancelledOrders.length,
      totalRevenue, pendingRevenue,
      totalReviews: reviews.length, averageRating: Math.round(averageRating * 10) / 10,
      recentOrders,
      ordersByDay: Object.entries(ordersByDay).sort(([a], [b]) => a.localeCompare(b)).map(([d, c]) => ({ date: d, count: c })),
      revenueByDay: Object.entries(revenueByDay).sort(([a], [b]) => a.localeCompare(b)).map(([d, r]) => ({ date: d, revenue: r })),
    };
  },
});

export const getAlerts = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const lowStock = products.filter(p => p.lowStockAlert && p.stock <= p.lowStockAlert && p.stock > 0);
    const outOfStock = products.filter(p => p.isOutOfStock || p.stock <= 0);
    return { lowStockCount: lowStock.length, outOfStockCount: outOfStock.length, totalAlerts: lowStock.length + outOfStock.length };
  },
});
