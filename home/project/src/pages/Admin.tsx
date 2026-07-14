import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Loader2, LogIn, Eye, EyeOff, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, ListTree, ShoppingCart, Users, Star,
  TicketPercent, Gift, Combine, PartyPopper, Warehouse, BarChart3, Palette, Settings,
  Shield, ArrowRightFromLeft, PackageOpen, Split,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── Panel Imports ───
import { AdminDashboard } from "@/components/admin/panels/AdminDashboard";
import { AdminProducts } from "@/components/admin/panels/AdminProducts";
import { AdminCategories } from "@/components/admin/panels/AdminCategories";
import { AdminBranding } from "@/components/admin/panels/AdminBranding";
import { AdminSettings } from "@/components/admin/panels/AdminSettings";
import { AdminAccountSecurity } from "@/components/admin/panels/AdminAccountSecurity";
import { AdminMigration } from "@/components/admin/panels/AdminMigration";
import { AdminOrders } from "@/components/admin/panels/AdminOrders";
import { AdminReviews } from "@/components/admin/panels/AdminReviews";
import { AdminCoupons } from "@/components/admin/panels/AdminCoupons";
import { AdminOffers } from "@/components/admin/panels/AdminOffers";
import { AdminCombos } from "@/components/admin/panels/AdminCombos";
import { AdminPartyPacks } from "@/components/admin/panels/AdminPartyPacks";
import { AdminCustomers } from "@/components/admin/panels/AdminCustomers";
import { AdminInventory } from "@/components/admin/panels/AdminInventory";
import { AdminAnalytics } from "@/components/admin/panels/AdminAnalytics";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

// ─── Navigation config ───
const NAV_SECTIONS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { label: "Products", children: [
    { id: "kitchen-products", label: "Kitchen", icon: UtensilsCrossed },
    { id: "mart-products", label: "Mart", icon: ShoppingBag },
    { id: "categories", label: "Categories", icon: ListTree },
  ]},
  { label: "Sales", children: [
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "customers", label: "Customers", icon: Users },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "coupons", label: "Coupons", icon: TicketPercent },
    { id: "offers", label: "Offers", icon: Gift },
  ]},
  { label: "Menu", children: [
    { id: "combos", label: "Combos", icon: Combine },
    { id: "party-packs", label: "Party Packs", icon: PartyPopper },
  ]},
  { label: "Operations", children: [
    { id: "inventory", label: "Inventory", icon: Warehouse },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "migration", label: "Migration", icon: PackageOpen },
  ]},
  { label: "Configuration", children: [
    { id: "branding", label: "Branding", icon: Palette },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "account-security", label: "Security", icon: Shield },
  ]},
];

const PANEL_COMPONENTS: Record<string, React.FC<any>> = {
  dashboard: AdminDashboard,
  "kitchen-products": AdminProducts,
  "mart-products": AdminProducts,
  categories: AdminCategories,
  orders: AdminOrders,
  customers: AdminCustomers,
  reviews: AdminReviews,
  coupons: AdminCoupons,
  offers: AdminOffers,
  combos: AdminCombos,
  "party-packs": AdminPartyPacks,
  inventory: AdminInventory,
  analytics: AdminAnalytics,
  branding: AdminBranding,
  settings: AdminSettings,
  "account-security": AdminAccountSecurity,
  migration: AdminMigration,
};

const PANEL_PROPS: Record<string, Record<string, any>> = {
  "kitchen-products": { businessType: "kitchen" },
  "mart-products": { businessType: "mart" },
};

function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  const login = useMutation(api.adminAuth.login);
  const resetPw = useMutation(api.adminAuth.resetPasswordWithRecoveryKey);

  const handleLogin = async () => {
    setError(""); setLoading(true);
    try {
      const r = await login({ password });
      if (r.success && r.token) { onLogin(r.token); }
      else { setError(r.message || "Invalid credentials"); }
    } catch { setError("Login failed"); }
    setLoading(false);
  };

  const handleReset = async () => {
    setError(""); setResetMsg(""); setLoading(true);
    try {
      const r = await resetPw({ recoveryKey: recoveryKey.toUpperCase(), newPassword });
      if (r.success) { setResetMsg("Password reset! You can now log in."); setTimeout(() => setShowReset(false), 2000); }
      else { setError(r.message || "Reset failed"); }
    } catch { setError("Reset failed"); }
    setLoading(false);
  };

  const storedKey = sessionStorage.getItem("admin_recovery_key");
  const showKey = sessionStorage.getItem("admin_recovery_key_show");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-xl font-bold text-white">MB</span>
          </div>
          <CardTitle className="text-xl font-bold">Admin Login</CardTitle>
          <CardDescription>MB Crunchy Management Panel</CardDescription>
        </CardHeader>
        <CardContent>
          {(storedKey || showKey) && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-semibold text-amber-800">Your Recovery Key</p>
              <p className="text-sm font-mono text-amber-900 break-all font-bold mt-1">
                {storedKey || "Check console"}
              </p>
              <p className="text-xs text-amber-700 mt-1">Save this key!</p>
            </div>
          )}

          {!showReset ? (
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative mt-1">
                  <Input type={showPassword ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="Enter admin password" autoFocus />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                disabled={loading || !password}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
                Sign In
              </Button>
              <Button type="button" variant="link" size="sm" className="w-full text-gray-500"
                onClick={() => setShowReset(true)}>Forgot Password?</Button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Enter your recovery key to reset your password.</p>
              <div>
                <label className="text-sm font-medium text-gray-700">Recovery Key</label>
                <Input value={recoveryKey} onChange={(e) => setRecoveryKey(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX-XXXX-XXXX" className="mt-1 font-mono" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">New Password</label>
                <Input type="password" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 chars" className="mt-1" />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {resetMsg && <p className="text-green-600 text-sm">{resetMsg}</p>}
              <Button onClick={handleReset} disabled={loading || !recoveryKey || !newPassword}
                className="w-full bg-amber-600 hover:bg-amber-700">Reset Password</Button>
              <Button type="button" variant="link" size="sm" className="w-full text-gray-500"
                onClick={() => { setShowReset(false); setError(""); }}>Back to Login</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem("admin_token"));
  const [activeSection, setActiveSection] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [initDone, setInitDone] = useState(false);

  const initializeAdmin = useMutation(api.adminAuth.initializeAdmin);
  const sessionValid = useQuery(api.adminAuth.verifySession, token ? { token } : "skip");

  useEffect(() => {
    if (!initDone) {
      initializeAdmin().then((r) => {
        setInitDone(true);
        if (r.initialized && r.recoveryKey) {
          sessionStorage.setItem("admin_recovery_key", r.recoveryKey);
          sessionStorage.setItem("admin_recovery_key_show", "true");
        }
      }).catch(() => setInitDone(true));
    }
  }, [initializeAdmin, initDone]);

  if (!initDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center"><Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" /><p className="text-gray-600">Initializing...</p></div>
      </div>
    );
  }

  if (!token || sessionValid?.valid === false) {
    return <AdminLogin onLogin={(t) => { setToken(t); sessionStorage.setItem("admin_token", t); }} />;
  }

  const PanelComponent = PANEL_COMPONENTS[activeSection];
  const panelProps = PANEL_PROPS[activeSection] || {};

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        NAV_SECTIONS={NAV_SECTIONS}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        onLogout={() => { setToken(null); sessionStorage.removeItem("admin_token"); }}
      />
      <main className={cn("flex-1 overflow-auto transition-all duration-300")}>
        <div className="p-6">
          {PanelComponent ? <PanelComponent {...panelProps} /> : (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg font-medium">Section not implemented yet</p>
              <p className="text-sm">Coming in a future phase</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
