import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Save, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminBranding() {
  const settings = useQuery(api.settings.getAll);
  const bulkUpdate = useMutation(api.settings.bulkUpdate);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => { if (settings) setForm(prev => ({ ...settings, ...prev })); }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    await bulkUpdate({ settings: Object.entries(form).map(([key, value]) => ({ key, value })) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!settings) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

  return (<div className="space-y-6">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold text-gray-900">Branding</h1><p className="text-gray-500 text-sm">Customize store appearance</p></div>
      <Button onClick={handleSave} disabled={saving} className={saved ? "bg-green-600" : "bg-orange-500 hover:bg-orange-600"}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : saved ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        {saving ? "Saving..." : saved ? "Saved!" : "Save"}
      </Button>
    </div>

    <Tabs defaultValue="business">
      <TabsList><TabsTrigger value="business">Business</TabsTrigger><TabsTrigger value="appearance">Appearance</TabsTrigger><TabsTrigger value="social">Social</TabsTrigger><TabsTrigger value="payment">Payment</TabsTrigger></TabsList>

      <TabsContent value="business" className="space-y-4 mt-4">
        <Card><CardHeader><CardTitle>Business Info</CardTitle><CardDescription>Store name and contact details</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Business Name</Label><Input value={form.businessName || ""} onChange={e => setForm({...form, businessName: e.target.value})} /></div>
              <div><Label>Tagline</Label><Input value={form.businessTagline || ""} onChange={e => setForm({...form, businessTagline: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Logo (URL)</Label><Input value={form.businessLogo || ""} onChange={e => setForm({...form, businessLogo: e.target.value})} />{form.businessLogo && <img src={form.businessLogo} alt="" className="h-16 mt-2 rounded border" />}</div>
              <div><Label>Favicon (URL)</Label><Input value={form.businessFavicon || ""} onChange={e => setForm({...form, businessFavicon: e.target.value})} /></div>
            </div>
            <div><Label>Address</Label><Textarea value={form.businessAddress || ""} onChange={e => setForm({...form, businessAddress: e.target.value})} rows={2} /></div>
          </CardContent></Card>
      </TabsContent>

      <TabsContent value="appearance" className="space-y-4 mt-4">
        <Card><CardHeader><CardTitle>Theme Colors</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[{key:"primaryColor",label:"Primary"},{key:"secondaryColor",label:"Secondary"},{key:"accentColor",label:"Accent"},{key:"backgroundColor",label:"Background"},{key:"textColor",label:"Text"}].map(({key,label}) => (
                <div key={key}><Label>{label}</Label><div className="flex gap-2 mt-1"><input type="color" value={form[key] || "#000000"} onChange={e => setForm({...form, [key]: e.target.value})} className="h-10 w-10 rounded cursor-pointer border" /><Input value={form[key] || ""} onChange={e => setForm({...form, [key]: e.target.value})} className="flex-1" /></div></div>
              ))}
            </div>
            <div className="flex gap-4 items-center p-4 rounded-lg border" style={{backgroundColor: form.backgroundColor || "#FFF8F0", color: form.textColor || "#1A1A2E"}}>
              <span className="px-3 py-1 rounded text-white text-sm" style={{backgroundColor: form.primaryColor || "#E85D2C"}}>Primary</span>
              <span className="px-3 py-1 rounded text-white text-sm" style={{backgroundColor: form.secondaryColor || "#F5A623"}}>Secondary</span>
              <span className="px-3 py-1 rounded text-white text-sm" style={{backgroundColor: form.accentColor || "#2ECC71"}}>Accent</span>
              <span className="text-sm">Preview</span>
            </div>
          </CardContent></Card>
      </TabsContent>

      <TabsContent value="social" className="space-y-4 mt-4">
        <Card><CardHeader><CardTitle>Social Links</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={form.businessPhone || ""} onChange={e => setForm({...form, businessPhone: e.target.value})} /></div>
              <div><Label>Email</Label><Input value={form.businessEmail || ""} onChange={e => setForm({...form, businessEmail: e.target.value})} /></div>
              <div><Label>WhatsApp</Label><Input value={form.whatsappNumber || ""} onChange={e => setForm({...form, whatsappNumber: e.target.value})} /></div>
              <div><Label>Instagram</Label><Input value={form.instagramUrl || ""} onChange={e => setForm({...form, instagramUrl: e.target.value})} /></div>
              <div><Label>Facebook</Label><Input value={form.facebookUrl || ""} onChange={e => setForm({...form, facebookUrl: e.target.value})} /></div>
              <div><Label>YouTube</Label><Input value={form.youtubeUrl || ""} onChange={e => setForm({...form, youtubeUrl: e.target.value})} /></div>
            </div>
          </CardContent></Card>
      </TabsContent>

      <TabsContent value="payment" className="space-y-4 mt-4">
        <Card><CardHeader><CardTitle>UPI Payment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>UPI ID</Label><Input value={form.upiId || ""} onChange={e => setForm({...form, upiId: e.target.value})} /></div>
              <div><Label>Merchant Name</Label><Input value={form.upiMerchantName || ""} onChange={e => setForm({...form, upiMerchantName: e.target.value})} /></div>
            </div>
            {form.upiId && <div className="p-4 bg-gray-50 rounded-lg border"><p className="text-sm text-gray-500 mb-2">UPI QR: {form.upiId}</p>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${encodeURIComponent(form.upiId)}&pn=${encodeURIComponent(form.upiMerchantName||"MB Crunchy")}`} alt="QR" className="h-32 rounded" /></div>}
          </CardContent></Card>
      </TabsContent>
    </Tabs>
  </div>);
}
