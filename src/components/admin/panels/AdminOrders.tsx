import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AdminOrders() {
  const stats = useQuery(api.dashboard.getStats);
  return (<div className="space-y-6">
    <div><h1 className="text-2xl font-bold">Orders</h1><p className="text-gray-500 text-sm">Customer orders</p></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-yellow-50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-yellow-700">{stats?.pendingOrders||0}</p><p className="text-sm text-yellow-600">Pending</p></CardContent></Card>
      <Card className="bg-blue-50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-700">{stats?.preparingOrders||0}</p><p className="text-sm text-blue-600">Preparing</p></CardContent></Card>
      <Card className="bg-green-50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-700">{stats?.deliveredOrders||0}</p><p className="text-sm text-green-600">Delivered</p></CardContent></Card>
      <Card className="bg-red-50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-700">{stats?.cancelledOrders||0}</p><p className="text-sm text-red-600">Cancelled</p></CardContent></Card>
    </div>
    <Card><CardContent className="p-8 text-center text-gray-500"><ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p className="font-medium">Order management coming in Phase 2</p></CardContent></Card>
  </div>);
}
