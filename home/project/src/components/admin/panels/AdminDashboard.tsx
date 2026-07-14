import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  UtensilsCrossed, ShoppingBag, ShoppingCart, IndianRupee, Users, Star,
  AlertTriangle, TrendingUp, TrendingDown, ListTree, Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function StatsCard({ title, value, icon, description, className }: { title: string; value: string | number; icon: React.ReactNode; description?: string; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const stats = useQuery(api.dashboard.getStats);
  const alerts = useQuery(api.dashboard.getAlerts);

  if (!stats) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Dashboard</h1><p className="text-gray-500 text-sm">Business overview</p></div>
        {alerts && alerts.totalAlerts > 0 && <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{alerts.totalAlerts} Alerts</Badge>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Active Kitchen" value={stats.activeKitchenProducts} icon={<UtensilsCrossed className="h-4 w-4" />} description={`${stats.kitchenProducts} total`} className="border-l-4 border-l-orange-500" />
        <StatsCard title="Active Mart" value={stats.activeMartProducts} icon={<ShoppingBag className="h-4 w-4" />} description={`${stats.martProducts} total`} className="border-l-4 border-l-emerald-500" />
        <StatsCard title="Categories" value={stats.activeCategories} icon={<ListTree className="h-4 w-4" />} description={`${stats.totalCategories} total`} className="border-l-4 border-l-blue-500" />
        <StatsCard title="Orders" value={stats.totalOrders} icon={<ShoppingCart className="h-4 w-4" />} description={`${stats.pendingOrders} pending`} className="border-l-4 border-l-purple-500" />
        <StatsCard title="Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={<IndianRupee className="h-4 w-4" />} description={`₹${stats.pendingRevenue.toLocaleString()} pending`} className="border-l-4 border-l-green-500" />
        <StatsCard title="Reviews" value={stats.totalReviews} icon={<Star className="h-4 w-4" />} description={`${stats.averageRating} avg rating`} className="border-l-4 border-l-yellow-500" />
        <StatsCard title="Stock Alerts" value={alerts?.totalAlerts || 0} icon={<Package className="h-4 w-4" />} description={`${alerts?.lowStockCount || 0} low, ${alerts?.outOfStockCount || 0} out`} className="border-l-4 border-l-red-500" />
        <StatsCard title="Customers" value={stats.totalOrders} icon={<Users className="h-4 w-4" />} className="border-l-4 border-l-cyan-500" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-green-50 border-green-200"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-700">{stats.deliveredOrders}</p><p className="text-sm text-green-600">Delivered</p></CardContent></Card>
        <Card className="bg-yellow-50 border-yellow-200"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-yellow-700">{stats.pendingOrders}</p><p className="text-sm text-yellow-600">Pending</p></CardContent></Card>
        <Card className="bg-blue-50 border-blue-200"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-700">{stats.preparingOrders}</p><p className="text-sm text-blue-600">Preparing</p></CardContent></Card>
        <Card className="bg-red-50 border-red-200"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-700">{stats.cancelledOrders}</p><p className="text-sm text-red-600">Cancelled</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="text-sm font-medium">Orders (7 Days)</CardTitle></CardHeader>
          <CardContent><div className="flex items-end gap-2 h-32">
            {stats.ordersByDay.map((day) => {
              const max = Math.max(...stats.ordersByDay.map(d => d.count), 1);
              return (<div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-600">{day.count}</span>
                <div className="w-full bg-orange-500 rounded-t-md transition-all" style={{ height: `${Math.max((day.count / max) * 100, 4)}%` }} />
                <span className="text-xs text-gray-400">{new Date(day.date).toLocaleDateString("en-IN", { weekday: "short" })}</span>
              </div>);
            })}
          </div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium">Revenue (7 Days)</CardTitle></CardHeader>
          <CardContent><div className="flex items-end gap-2 h-32">
            {stats.revenueByDay.map((day) => {
              const max = Math.max(...stats.revenueByDay.map(d => d.revenue), 1);
              return (<div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-600">₹{day.revenue}</span>
                <div className="w-full bg-emerald-500 rounded-t-md transition-all" style={{ height: `${Math.max((day.revenue / max) * 100, 4)}%` }} />
                <span className="text-xs text-gray-400">{new Date(day.date).toLocaleDateString("en-IN", { weekday: "short" })}</span>
              </div>);
            })}
          </div></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle className="text-sm font-medium">Recent Orders</CardTitle></CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? <p className="text-center text-gray-500 py-8">No orders yet</p> :
            <div className="space-y-2">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${order.businessType === "kitchen" ? "bg-orange-500" : "bg-emerald-500"}`}>{order.businessType === "kitchen" ? "K" : "M"}</div>
                    <div><p className="text-sm font-medium text-gray-900">{order.customerName}</p><p className="text-xs text-gray-500">{order.orderNumber}</p></div>
                  </div>
                  <div className="text-right"><p className="text-sm font-medium text-gray-900">₹{order.total}</p>
                    <span className={`text-xs ${order.status === "delivered" ? "text-green-600" : order.status === "cancelled" ? "text-red-600" : order.status === "preparing" ? "text-blue-600" : "text-yellow-600"}`}>{order.status.replace(/_/g, " ")}</span>
                  </div>
                </div>
              ))}
            </div>
          }
        </CardContent></Card>
    </div>
  );
}
