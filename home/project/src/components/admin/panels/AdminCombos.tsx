import { Combine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
export function AdminCombos() {
  return (<div className="space-y-6"><div><h1 className="text-2xl font-bold">Combos</h1><p className="text-gray-500 text-sm">Combo deals</p></div>
    <Card><CardContent className="p-8 text-center text-gray-500"><Combine className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p className="font-medium">Coming in Phase 3</p></CardContent></Card></div>);
}
