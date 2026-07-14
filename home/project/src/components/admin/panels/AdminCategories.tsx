import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, FolderTree, UtensilsCrossed, ShoppingBag, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

function BizBadge({ type }: { type: string }) {
  if (type === "kitchen") return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200"><UtensilsCrossed className="h-3 w-3 mr-1" />Kitchen</Badge>;
  if (type === "mart") return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><ShoppingBag className="h-3 w-3 mr-1" />Mart</Badge>;
  return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Globe className="h-3 w-3 mr-1" />Both</Badge>;
}

function TreeNode({ node, depth, onEdit, onDelete, exps, onToggle }: {
  node: any; depth: number; onEdit: (c: any) => void; onDelete: (id: Id<"categories">) => void;
  exps: Set<string>; onToggle: (id: string) => void;
}) {
  const has = node.children?.length > 0;
  const open = exps.has(node._id);
  return (<div>
    <div className={`flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-gray-50 group ${!node.isActive ? "opacity-60" : ""}`} style={{ paddingLeft: `${depth * 20 + 8}px` }}>
      <button className={`text-gray-300 hover:text-gray-600 ${!has ? "invisible" : ""}`} onClick={() => onToggle(node._id)}>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      <div className="flex-1 flex items-center gap-2"><span className="text-sm font-medium text-gray-900">{node.name}</span><BizBadge type={node.businessType} />{!node.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}</div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(node)}><Edit2 className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onDelete(node._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    </div>
    {has && open && node.children.map((child: any) => <TreeNode key={child._id} node={child} depth={depth+1} onEdit={onEdit} onDelete={onDelete} exps={exps} onToggle={onToggle} />)}
  </div>);
}

export function AdminCategories() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<Id<"categories"> | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", parentId: "", businessType: "both" as "kitchen" | "mart" | "both", isActive: true });
  const [exps, setExps] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("all");

  const tree = useQuery(api.categories.getTree, { includeInactive: true });
  const allCats = useQuery(api.categories.getAll, { includeInactive: true });
  const create = useMutation(api.categories.create);
  const update = useMutation(api.categories.update);
  const remove = useMutation(api.categories.remove);

  const handleSave = async () => {
    if (!form.name) return;
    try {
      if (editId) await update({ id: editId, name: form.name, slug: form.slug, description: form.description || undefined, parentId: form.parentId ? form.parentId as Id<"categories"> : undefined, businessType: form.businessType, isActive: form.isActive });
      else await create({ name: form.name, slug: form.slug, description: form.description || undefined, parentId: form.parentId ? form.parentId as Id<"categories"> : undefined, businessType: form.businessType });
      setShowForm(false); setEditId(null); setForm({ name: "", slug: "", description: "", parentId: "", businessType: "both", isActive: true });
    } catch (err: any) { alert(err.message); }
  };

  return (<div className="space-y-6">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold text-gray-900">Categories</h1><p className="text-gray-500 text-sm">Manage product categories</p></div>
      <Button onClick={() => { setEditId(null); setForm({ name: "", slug: "", description: "", parentId: "", businessType: "both", isActive: true }); setShowForm(true); }}><Plus className="h-4 w-4 mr-2" />Add Category</Button>
    </div>
    <Tabs value={filter} onValueChange={setFilter}><TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="kitchen">Kitchen</TabsTrigger><TabsTrigger value="mart">Mart</TabsTrigger></TabsList></Tabs>
    <Card><CardContent className="p-4">
      {!tree ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div> :
       tree.length === 0 ? <p className="text-center py-8 text-gray-500"><FolderTree className="h-8 w-8 mx-auto mb-2 text-gray-300" />No categories yet</p> :
       <div>{tree.filter(n => filter === "all" || n.businessType === filter || n.businessType === "both").map(n => <TreeNode key={n._id} node={n} depth={0}
         onEdit={(c) => { setEditId(c._id); setForm({ name: c.name, slug: c.slug, description: c.description || "", parentId: c.parentId || "", businessType: c.businessType, isActive: c.isActive }); setShowForm(true); }}
         onDelete={(id) => { if (confirm("Delete?")) remove({ id }); }}
         exps={exps} onToggle={(id) => { const s = new Set(exps); s.has(id) ? s.delete(id) : s.add(id); setExps(s); }} />)}</div>}
    </CardContent></Card>

    <Dialog open={showForm} onOpenChange={setShowForm}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>{editId ? "Edit" : "New"} Category</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value, slug: editId ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")})} /></div>
        <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} /></div>
        <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
        <div><Label>Parent Category</Label><Select value={form.parentId} onValueChange={v => setForm({...form, parentId: v})}><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
          <SelectContent><SelectItem value="__none">None</SelectItem>{allCats?.filter(c => c._id !== editId).map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Business Type</Label><Select value={form.businessType} onValueChange={(v: any) => setForm({...form, businessType: v})}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="both">Both</SelectItem><SelectItem value="kitchen">Kitchen</SelectItem><SelectItem value="mart">Mart</SelectItem></SelectContent></Select></div>
        <div className="flex items-center gap-2"><input type="checkbox" id="cat-active" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="rounded" /><Label htmlFor="cat-active" className="mb-0">Active</Label></div>
        <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={handleSave} disabled={!form.name} className="bg-orange-500">{editId ? "Update" : "Create"}</Button></div>
      </div>
    </DialogContent></Dialog>
  </div>);
}
