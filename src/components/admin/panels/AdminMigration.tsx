import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminMigration() {
  const summary = useQuery(api.migration.getSummary);
  const categories = useQuery(api.categories.getAll, { includeInactive: true });
  const kitchenP = useQuery(api.products.getAll, { businessType: "kitchen", includeInactive: true });
  const martP = useQuery(api.products.getAll, { businessType: "mart", includeInactive: true });
  const orphaned = useQuery(api.migration.getOrphanedProducts);
  const migrate = useMutation(api.migration.migrateProductsToCategory);
  const reassign = useMutation(api.migration.reassignBusinessType);
  const bulkCat = useMutation(api.migration.bulkCategoryBusinessTypeUpdate);
  const delOrphaned = useMutation(api.migration.deleteOrphanedProducts);

  const [selectedIds, setSelectedIds] = useState<Id<"products">[]>([]);
  const [targetCat, setTargetCat] = useState("");
  const [targetBiz, setTargetBiz] = useState<"kitchen"|"mart">("kitchen");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const doMigrate = async () => {
    if (!targetCat || !selectedIds.length) return; setLoading(true); setMsg("");
    try { const r = await migrate({ productIds: selectedIds, targetCategoryId: targetCat as Id<"categories"> }); setMsg(r.message); setSelectedIds([]); } catch (err: any) { setMsg("Error: "+err.message); }
    setLoading(false);
  };

  if (!summary) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (<div className="space-y-6">
    <div><h1 className="text-2xl font-bold">Migration</h1><p className="text-gray-500 text-sm">Move products between categories and business types</p></div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="border-l-4 border-l-orange-500"><CardContent className="p-4"><p className="text-2xl font-bold">{summary.kitchenProducts}</p><p className="text-sm text-gray-500">Kitchen Products</p></CardContent></Card>
      <Card className="border-l-4 border-l-emerald-500"><CardContent className="p-4"><p className="text-2xl font-bold">{summary.martProducts}</p><p className="text-sm text-gray-500">Mart Products</p></CardContent></Card>
      <Card className="border-l-4 border-l-blue-500"><CardContent className="p-4"><p className="text-2xl font-bold">{summary.kitchenCategories}</p><p className="text-sm text-gray-500">Kitchen Categories</p></CardContent></Card>
      <Card className="border-l-4 border-l-purple-500"><CardContent className="p-4"><p className="text-2xl font-bold">{summary.martCategories}</p><p className="text-sm text-gray-500">Mart Categories</p></CardContent></Card>
    </div>

    {summary.unassignedToCategory > 0 && <Card className="border-red-200 bg-red-50"><CardContent className="p-4 flex items-center gap-3">
      <AlertTriangle className="h-5 w-5 text-red-500" />
      <div className="flex-1"><p className="text-sm font-medium text-red-700">{summary.unassignedToCategory} products without a valid category</p></div>
      <Button variant="destructive" size="sm" onClick={async () => { setLoading(true); const r = await delOrphaned({ productIds: (orphaned||[]).map(p => p.id) }); setMsg(r.message); setLoading(false); }} disabled={loading}>Clean Up</Button>
    </CardContent></Card>}

    <Tabs defaultValue="products">
      <TabsList><TabsTrigger value="products">Reassign Category</TabsTrigger><TabsTrigger value="biz">Change Business Type</TabsTrigger></TabsList>

      <TabsContent value="products" className="space-y-4 mt-4">
        <Card><CardHeader><CardTitle className="text-sm">Move Products to Category</CardTitle><CardDescription>Select products and move them to a new category</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Target Category</Label><Select value={targetCat} onValueChange={setTargetCat}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{categories?.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
              {(kitchenP?.products||[]).map(p => <label key={p._id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded text-sm cursor-pointer">
                <input type="checkbox" checked={selectedIds.includes(p._id)} onChange={e => setSelectedIds(e.target.checked ? [...selectedIds,p._id] : selectedIds.filter(i=>i!==p._id))} />
                <span>{p.name}</span><span className="text-xs text-gray-400">({p.businessType})</span>
              </label>)}
            </div>
            <Button onClick={doMigrate} disabled={loading||!targetCat||!selectedIds.length} className="bg-orange-500 hover:bg-orange-600">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
              Move {selectedIds.length} Products
            </Button>
            {msg && <p className="text-sm text-gray-600">{msg}</p>}
          </CardContent></Card>
      </TabsContent>

      <TabsContent value="biz" className="space-y-4 mt-4">
        <Card><CardHeader><CardTitle className="text-sm">Reassign Business Type</CardTitle><CardDescription>Switch products between Kitchen and Mart</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Move to</Label><Select value={targetBiz} onValueChange={(v:any)=>setTargetBiz(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="kitchen">Kitchen</SelectItem><SelectItem value="mart">Mart</SelectItem></SelectContent></Select></div>
            <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
              {(martP?.products||[]).map(p => <label key={p._id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded text-sm cursor-pointer">
                <input type="checkbox" checked={selectedIds.includes(p._id)} onChange={e => setSelectedIds(e.target.checked ? [...selectedIds,p._id] : selectedIds.filter(i=>i!==p._id))} />
                <span>{p.name}</span><span className="text-xs text-gray-400">({p.businessType})</span>
              </label>)}
            </div>
            <Button onClick={async () => { setLoading(true); setMsg(""); try { const r = await reassign({ productIds: selectedIds, newBusinessType: targetBiz }); setMsg(r.message); setSelectedIds([]); } catch(err:any){setMsg(err.message);} setLoading(false); }} disabled={loading||!selectedIds.length}>Reassign {selectedIds.length}</Button>
          </CardContent></Card>
      </TabsContent>
    </Tabs>
  </div>);
}
