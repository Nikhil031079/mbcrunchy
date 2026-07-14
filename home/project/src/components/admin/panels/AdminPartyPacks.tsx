import { PartyPopper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
export function AdminPartyPacks() {
  return (<div className="space-y-6"><div><h1 className="text-2xl font-bold">Party Packs</h1><p className="text-gray-500 text-sm">Party pack deals</p></div>
    <Card><CardContent className="p-8 text-center text-gray-500"><PartyPopper className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p className="font-medium">Coming in Phase 3</p></CardContent></Card></div>);
}
