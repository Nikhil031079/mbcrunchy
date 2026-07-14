import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Loader2, Leaf, Flame, Sparkles, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { formatWeight } from "@/lib/weightUnits";

const WEIGHT_UNITS = [
  { value: "gm", label: "Gram" }, { value: "kg", label: "Kilogram" }, { value: "ml", label: "Millilitre" },
  { value: "litre", label: "Litre" }, { value: "pcs", label: "Pieces" }, { value: "piece", label: "Piece" },
  { value: "plate", label: "Plate" }, { value: "pack", label: "Pack" }, { value: "box", label: "Box" },
  { value: "jar", label: "Jar" }, { value: "bottle", label: "Bottle" },
];

interface Props { businessType: "kitchen" | "mart" }

export function AdminProducts({ businessType }: Props) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"products"> | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [form, setForm] = useState({
    name: "", slug: "", description: "", images: [] as string[], categoryId: "",
    mrp: 0, sellingPrice: 0, sku: "", stock: 0, lowStockAlert: 5, displayOrder: 0,
    isVeg: true, isBestSeller: false, isNewArrival: false, isOutOfStock: false,
    weightValue: 0, weightUnit: "gm", isActive: true,
  });

  const products = useQuery(api.products.getAll, { businessType, includeInactive: true, search: search || undefined });
  const categories = useQuery(api.categories.getAll, { businessType, includeInactive: false });
  const create = useMutation(api.products.create);
  const update = useMutation(api.products.update);
  const remove = useMutation(api.products.remove);
  const toggle = useMutation(api.products.toggleActive);

  const resetForm = () => setForm({ name: "", slug: "", description: "", images: [], categoryId: "", mrp: 0, sellingPrice: 0, sku: "", stock: 0, lowStockAlert: 5, displayOrder: 0, isVeg: true, isBestSeller: false, isNewArrival: false, isOutOfStock: false, weightValue: 0, weightUnit: "gm", isActive: true });

  const handleSave = async () => {
    if (!form.name || !form.categoryId || !form.mrp || !form.sellingPrice) return;
    try {
      if (editingId) {
        await update({ id: editingId, ...form, categoryId: form.categoryId as Id<"categories">, businessType });
      } else {
        await create({ ...form, categoryId: form.categoryId as Id<"categories">, businessType });
      }
      setShowForm(false); setEditingId(null); resetForm();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (p: any) => {
    setForm({ name: p.name, slug: p.slug, description: p.description || "", images: p.images, categoryId: p.categoryId, mrp: p.mrp, sellingPrice: p.sellingPrice, sku: p.sku || "", stock: p.stock, lowStockAlert: p.lowStockAlert || 5, displayOrder: p.displayOrder, isVeg: p.isVeg, isBestSeller: p.isBestSeller || false, isNewArrival: p.isNewArrival || false, isOutOfStock: p.isOutOfStock || false, weightValue: p.weightValue, weightUnit: p.weightUnit, isActive: p.isActive });
    setEditingId(p._id); setShowForm(true);
  };

  const genSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const label = businessType === "kitchen" ? "Kitchen" : "Mart";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">{label} Products</h1><p className="text-gray-500 text-sm">Manage your product catalog</p></div>
        <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }}><Plus className="h-4 w-4 mr-2" />Add Product</Button>
      </div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
      <Card><CardContent className="p-0">
        <Table><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Weight</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {!products ? <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow> :
           products.products.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No products found</TableCell></TableRow> :
           products.products.map(p => (
            <TableRow key={p._id} className={!p.isActive ? "opacity-60" : ""}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    {p.images[0] ? <img src={p.images[0]} alt="" className="h-full w-full object-cover" /> : <Package className="h-5 w-5 text-gray-400" />}
                  </div>
                  <div><p className="text-sm font-medium text-gray-900 flex items-center gap-1">{p.isVeg && <Leaf className="h-3 w-3 text-green-600" />}{p.name}{p.isBestSeller && <Flame className="h-3 w-3 text-orange-500" />}</p></div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-600">{categories?.find(c => c._id === p.categoryId)?.name || "-"}</TableCell>
              <TableCell><p className="text-sm font-medium">₹{p.sellingPrice}</p>{p.mrp > p.sellingPrice && <p className="text-xs text-gray-400 line-through">₹{p.mrp}</p>}</TableCell>
              <TableCell><span className={`text-sm font-medium ${p.stock <= (p.lowStockAlert || 0) ? "text-red-600" : ""}`}>{p.stock}</span></TableCell>
              <TableCell className="text-sm">{formatWeight(p.weightValue, p.weightUnit)}</TableCell>
              <TableCell><Badge variant={p.isActive ? "default" : "secondary"} className={p.isActive ? "bg-green-100 text-green-700" : ""}>{p.isActive ? "Active" : "Inactive"}</Badge></TableCell>
              <TableCell><div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Edit2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => toggle({ id: p._id })}>{p.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { if (confirm("Delete?")) remove({ id: p._id }); }}><Trash2 className="h-4 w-4" /></Button>
              </div></TableCell>
            </TableRow>
          ))}
        </TableBody></Table>
      </CardContent></Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} Product</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value, slug: editingId ? form.slug : genSlug(e.target.value) })} /></div>
              <div className="col-span-2"><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} /></div>
              <div className="col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
              <div><Label>Category</Label><Select value={form.categoryId} onValueChange={v => setForm({...form, categoryId: v})}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{categories?.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Display Order</Label><Input type="number" value={form.displayOrder} onChange={e => setForm({...form, displayOrder: parseInt(e.target.value) || 0})} /></div>
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-4">
              <div><Label>MRP (₹)</Label><Input type="number" value={form.mrp || ""} onChange={e => setForm({...form, mrp: parseFloat(e.target.value) || 0})} /></div>
              <div><Label>Selling (₹)</Label><Input type="number" value={form.sellingPrice || ""} onChange={e => setForm({...form, sellingPrice: parseFloat(e.target.value) || 0})} /></div>
              <div><Label>SKU</Label><Input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} /></div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Weight</Label><Input type="number" value={form.weightValue || ""} onChange={e => setForm({...form, weightValue: parseFloat(e.target.value) || 0})} /></div>
              <div><Label>Unit</Label><Select value={form.weightUnit} onValueChange={v => setForm({...form, weightUnit: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{WEIGHT_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Stock</Label><Input type="number" value={form.stock || ""} onChange={e => setForm({...form, stock: parseInt(e.target.value) || 0})} /></div>
              <div><Label>Low Alert</Label><Input type="number" value={form.lowStockAlert || ""} onChange={e => setForm({...form, lowStockAlert: parseInt(e.target.value) || 0})} /></div>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2"><Checkbox checked={form.isVeg} onCheckedChange={v => setForm({...form, isVeg: v as boolean})} /><span className="text-sm">Veg</span></label>
              <label className="flex items-center gap-2"><Checkbox checked={form.isBestSeller} onCheckedChange={v => setForm({...form, isBestSeller: v as boolean})} /><span className="text-sm">Best Seller</span></label>
              <label className="flex items-center gap-2"><Checkbox checked={form.isNewArrival} onCheckedChange={v => setForm({...form, isNewArrival: v as boolean})} /><span className="text-sm">New</span></label>
              <label className="flex items-center gap-2"><Checkbox checked={form.isOutOfStock} onCheckedChange={v => setForm({...form, isOutOfStock: v as boolean})} /><span className="text-sm">Out of Stock</span></label>
              <label className="flex items-center gap-2"><Checkbox checked={form.isActive} onCheckedChange={v => setForm({...form, isActive: v as boolean})} /><span className="text-sm">Active</span></label>
            </div>
            <Separator />
            <div><Label>Images</Label><div className="flex gap-2 mt-1"><Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Image URL" /><Button variant="outline" onClick={() => { if (imageUrl && !form.images.includes(imageUrl)) { setForm({...form, images: [...form.images, imageUrl]}); setImageUrl(""); } }}>Add</Button></div>
              {form.images.length > 0 && <div className="flex gap-2 mt-2 flex-wrap">{form.images.map(url => <div key={url} className="relative group"><img src={url} alt="" className="h-16 w-16 rounded-lg object-cover" /><button className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100" onClick={() => setForm({...form, images: form.images.filter(i => i !== url)})} >×</button></div>)}</div>}
            </div>
            <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={handleSave} disabled={!form.name || !form.categoryId || !form.mrp} className="bg-orange-500 hover:bg-orange-600">{editingId ? "Update" : "Create"}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
