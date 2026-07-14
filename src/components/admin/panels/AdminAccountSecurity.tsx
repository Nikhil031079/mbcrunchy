import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Shield, KeyRound, Eye, EyeOff, Copy, Check, Laptop, Loader2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function AdminAccountSecurity() {
  const token = sessionStorage.getItem("admin_token") || "";
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const adminInfo = useQuery(api.adminAuth.getAdminInfo, { token });
  const auditLogs = useQuery(api.adminAuth.getAuditLogs, { token, limit: 20 });
  const sessions = useQuery(api.adminAuth.getActiveSessions, { token });
  const changePassword = useMutation(api.adminAuth.changePassword);
  const revokeSession = useMutation(api.adminAuth.revokeSession);
  const storedKey = sessionStorage.getItem("admin_recovery_key");

  const handleChangePw = async () => {
    setErr(""); setMsg("");
    if (newPw !== confirmPw) { setErr("Passwords don't match"); return; }
    if (newPw.length < 6) { setErr("Min 6 characters"); return; }
    setLoading(true);
    try {
      const r = await changePassword({ currentPassword: curPw, newPassword: newPw, token });
      if (r.success) { setMsg("Password changed!"); setCurPw(""); setNewPw(""); setConfirmPw(""); }
      else setErr(r.message || "Failed");
    } catch { setErr("Error"); }
    setLoading(false);
  };

  return (<div className="space-y-6">
    <div><h1 className="text-2xl font-bold">Account Security</h1><p className="text-gray-500 text-sm">Manage admin account security</p></div>

    <Tabs defaultValue="password">
      <TabsList><TabsTrigger value="password"><KeyRound className="h-4 w-4 mr-1" />Password</TabsTrigger><TabsTrigger value="recovery"><Shield className="h-4 w-4 mr-1" />Recovery</TabsTrigger><TabsTrigger value="sessions"><Laptop className="h-4 w-4 mr-1" />Sessions</TabsTrigger><TabsTrigger value="audit"><History className="h-4 w-4 mr-1" />Audit Log</TabsTrigger></TabsList>

      <TabsContent value="password" className="space-y-4 mt-4">
        <Card><CardHeader><CardTitle className="text-sm">Change Password</CardTitle><CardDescription>Update your admin password</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Current Password</Label><Input type={showPw?"text":"password"} value={curPw} onChange={e => setCurPw(e.target.value)} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>New Password</Label><Input type={showPw?"text":"password"} value={newPw} onChange={e => setNewPw(e.target.value)} className="mt-1" /></div>
              <div><Label>Confirm</Label><Input type={showPw?"text":"password"} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="mt-1" /></div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-500"><input type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)} /> Show passwords</label>
            {err && <p className="text-red-500 text-sm">{err}</p>}{msg && <p className="text-green-600 text-sm">{msg}</p>}
            <Button onClick={handleChangePw} disabled={loading||!curPw||!newPw} className="bg-orange-500 hover:bg-orange-600">
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Change Password
            </Button>
          </CardContent></Card>
      </TabsContent>

      <TabsContent value="recovery" className="space-y-4 mt-4">
        <Card><CardHeader><CardTitle className="text-sm">Recovery Key</CardTitle><CardDescription>Use this to reset your password if forgotten</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {storedKey ? <div><p className="text-xs text-amber-600 font-medium mb-2">⚠️ Save this key somewhere safe!</p>
              <div className="flex gap-2"><code className="flex-1 p-3 bg-gray-100 rounded-lg font-mono text-sm break-all">{storedKey}</code>
                <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(storedKey); setCopied(true); setTimeout(()=>setCopied(false),2000); }}>
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div> : <p className="text-gray-500 text-center py-4">No recovery key available. It was shown on first login.</p>}
          </CardContent></Card>

        {adminInfo && <Card><CardHeader><CardTitle className="text-sm">Account Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Username</span><span className="font-medium">{adminInfo.username}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Created</span><span className="font-medium">{adminInfo.createdAt ? new Date(adminInfo.createdAt).toLocaleDateString("en-IN"):"-"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Last Login</span><span className="font-medium">{adminInfo.lastLoginAt ? new Date(adminInfo.lastLoginAt).toLocaleString("en-IN"):"-"}</span></div>
          </CardContent></Card>}
      </TabsContent>

      <TabsContent value="sessions" className="space-y-4 mt-4">
        <Card><CardHeader><CardTitle className="text-sm">Active Sessions</CardTitle></CardHeader>
          <CardContent>
            {!sessions ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> :
             sessions.length === 0 ? <p className="text-center text-gray-500 py-4">No active sessions</p> :
             <div className="space-y-3">{sessions.map(s => <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
               <div className="flex items-center gap-3">
                 <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center"><Laptop className="h-4 w-4" /></div>
                 <div><p className="text-sm font-medium">{s.isCurrent ? "Current Session" : s.userAgent || "Unknown"}</p>
                   <p className="text-xs text-gray-500">{s.ipAddress || "Unknown"} · {new Date(s.createdAt).toLocaleString("en-IN")}</p></div>
               </div>
               {!s.isCurrent && <Button variant="ghost" size="sm" className="text-red-500" onClick={() => revokeSession({ token, sessionIdToRevoke: s.id })}>Revoke</Button>}
             </div>)}</div>}
          </CardContent></Card>
      </TabsContent>

      <TabsContent value="audit" className="space-y-4 mt-4">
        <Card><CardHeader><CardTitle className="text-sm">Audit Log</CardTitle></CardHeader>
          <CardContent>
            {!auditLogs ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> :
             auditLogs.length === 0 ? <p className="text-center text-gray-500 py-4">No entries</p> :
             <div className="space-y-2">{auditLogs.map((log,i) => <div key={i} className="flex items-center gap-3 p-2 rounded-lg text-sm">
               <span className="text-gray-400 text-xs flex-shrink-0">{new Date(log.createdAt).toLocaleString("en-IN")}</span>
               <Badge variant="outline" className="text-xs">{log.action.replace(/_/g," ")}</Badge>
               {log.details && <span className="text-gray-500 text-xs">{log.details}</span>}
             </div>)}</div>}
          </CardContent></Card>
      </TabsContent>
    </Tabs>
  </div>);
}
