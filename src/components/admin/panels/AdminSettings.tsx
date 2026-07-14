import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Save, Loader2, Check, Settings2, Truck, Clock, IndianRupee, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

export function AdminSettings() {
  const settings = useQuery(api.settings.getAll);
  const bulkUpdate = useMutation(api.settings.bulkUpdate);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => { if (settings) setForm(prev => ({...settings, ...prev})); }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    await bulkUpdate({ settings: Object.entries(form).map(([k,v]) => ({key:k,value:v})) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleDay = (key: string, day: string) => {
    const cur: string[] = form[key] || [];
    setForm({...form, [key]: cur.includes(day) ? cur.filter((d:string) => d !== day) : [...cur, day]});
  };

  if (!settings) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (<div className="space-y-6">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">Settings</h1><p className="text-gray-500 text-sm">Store configuration</p></div>
      <Button onClick={handleSave} disabled={saving} className={saved ? "bg-green-600" : "bg-orange-500"}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : saved ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        {saving ? "Saving..." : saved ? "Saved!" : "Save"}
      </Button>
    </div>

    <Tabs defaultValue="delivery">
      <TabsList><TabsTrigger value="delivery"><Truck className="h-4 w-4 mr-1" />Delivery</TabsTrigger><TabsTrigger value="timings"><Clock className="h-4 w-4 mr-1" />Timings</TabsTrigger><TabsTrigger value="taxes"><IndianRupee className="h-4 w-4 mr-1" />Taxes</TabsTrigger><TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-1" />Notifications</TabsTrigger></TabsList>

      <TabsContent value="delivery" className="space-y-4 mt-4">
        <Card><CardHeader><CardTitle className="text-sm">Delivery Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><Label>Enable Delivery</Label><Switch checked={form.deliveryEnabled !== false} onCheckedChange={v => setForm({...form, deliveryEnabled: v})} /></div>
            <div className="flex items-center justify-between"><Label>Enable Takeaway</Label><Switch checked={form.takeawayEnabled !== false} onCheckedChange={v => setForm({...form, takeawayEnabled: v})} /></div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Radius (km)</Label><Input type="number" value={form.deliveryRadius || 10} onChange={e => setForm({...form, deliveryRadius: parseInt(e.target.value)||0})} /></div>
              <div><Label>Charge (₹)</Label><Input type="number" value={form.deliveryCharge || 30} onChange={e => setForm({...form, deliveryCharge: parseInt(e.target.value)||0})} /></div>
              <div><Label>Free Delivery Min (₹)</Label><Input type="number" value={form.freeDeliveryMinOrder || 200} onChange={e => setForm({...form, freeDeliveryMinOrder: parseInt(e.target.value)||0})} /></div>
              <div><Label>Est. Time (mins)</Label><Input type="number" value={form.estimatedDeliveryMinutes || 30} onChange={e => setForm({...form, estimatedDeliveryMinutes: parseInt(e.target.value)||0})} /></div>
            </div>
          </CardContent></Card>
      </TabsContent>

      <TabsContent value="timings" className="space-y-4 mt-4">
        <Card><CardHeader><CardTitle className="text-sm">Store Timings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Opening</Label><Input type="time" value={form.openingTime || "09:00"} onChange={e => setForm({...form, openingTime: e.target.value})} /></div>
              <div><Label>Closing</Label><Input type="time" value={form.closingTime || "22:00"} onChange={e => setForm({...form, closingTime: e.target.value})} /></div>
            </div>
            <Separator />
            <div><Label className="mb-2 block">Kitchen Open Days</Label><div className="flex gap-2 flex-wrap">{DAYS.map(d => <Button key={d} variant={(form.kitchenOpenDays||[]).includes(d)?"default":"outline"} size="sm" onClick={() => toggleDay("kitchenOpenDays", d)} className={(form.kitchenOpenDays||[]).includes(d)?"bg-orange-500":""}>{d.slice(0,3)}</Button>)}</div></div>
            <div><Label className="mb-2 block">Mart Open Days</Label><div className="flex gap-2 flex-wrap">{DAYS.map(d => <Button key={d} variant={(form.martOpenDays||[]).includes(d)?"default":"outline"} size="sm" onClick={() => toggleDay("martOpenDays", d)} className={(form.martOpenDays||[]).includes(d)?"bg-emerald-500":""}>{d.slice(0,3)}</Button>)}</div></div>
          </CardContent></Card>
      </TabsContent>

      <TabsContent value="taxes" className="space-y-4 mt-4">
        <Card><CardHeader><CardTitle className="text-sm">Tax & Charges</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div><Label>Tax Rate (%)</Label><Input type="number" value={form.taxRate || 5} onChange={e => setForm({...form, taxRate: parseFloat(e.target.value)||0})} /></div>
            <div><Label>Tax Name</Label><Input value={form.taxName || "GST"} onChange={e => setForm({...form, taxName: e.target.value})} /></div>
            <div><Label>Packing (₹)</Label><Input type="number" value={form.packingCharge || 10} onChange={e => setForm({...form, packingCharge: parseInt(e.target.value)||0})} /></div>
          </CardContent></Card>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-4 mt-4">
        <Card><CardHeader><CardTitle className="text-sm">Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><div><Label>New Order Alerts</Label><p className="text-xs text-gray-500">Notify on new orders</p></div><Switch checked={form.newOrderNotification !== false} onCheckedChange={v => setForm({...form, newOrderNotification: v})} /></div>
            <Separator />
            <div className="flex items-center justify-between"><div><Label>Low Stock Alerts</Label><p className="text-xs text-gray-500">Notify when stock is low</p></div><Switch checked={form.lowStockNotification !== false} onCheckedChange={v => setForm({...form, lowStockNotification: v})} /></div>
            <div><Label>Low Stock Threshold</Label><Input type="number" value={form.lowStockThreshold || 10} onChange={e => setForm({...form, lowStockThreshold: parseInt(e.target.value)||0})} /></div>
          </CardContent></Card>
      </TabsContent>
    </Tabs>
  </div>);
}
