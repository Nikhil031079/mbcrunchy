import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRightFromLine, Store, type LucideIcon } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  label?: string;
  id?: string;
  icon?: LucideIcon;
  children?: NavItem[];
}

interface AdminSidebarProps {
  NAV_SECTIONS: NavGroup[];
  activeSection: string;
  onSectionChange: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

export function AdminSidebar({
  NAV_SECTIONS,
  activeSection,
  onSectionChange,
  collapsed,
  onToggle,
  onLogout,
}: AdminSidebarProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-orange-500" />
            <span className="font-bold text-lg text-gray-900">MB Crunchy</span>
          </div>
        )}
        {collapsed && <Store className="h-6 w-6 text-orange-500 mx-auto" />}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="px-2 space-y-4">
          {NAV_SECTIONS.map((group) => {
            if (group.children) {
              return (
                <div key={group.label || group.id}>
                  {!collapsed && (
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      {group.label}
                    </p>
                  )}
                  <div className="space-y-0.5">
                    {group.children.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.id}
                          variant="ghost"
                          size={collapsed ? "icon" : "sm"}
                          className={cn(
                            "w-full justify-start gap-3 font-normal",
                            collapsed ? "h-10 w-12 mx-auto" : "px-3",
                            activeSection === item.id
                              ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                              : "text-gray-600 hover:bg-gray-100"
                          )}
                          onClick={() => onSectionChange(item.id)}
                          title={collapsed ? item.label : undefined}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          {!collapsed && (
                            <span className="flex-1 text-left text-sm truncate">{item.label}</span>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              );
            }
            // Single item (like Dashboard)
            const Icon = group.icon!;
            return (
              <div key={group.id}>
                <Button
                  variant="ghost"
                  size={collapsed ? "icon" : "sm"}
                  className={cn(
                    "w-full justify-start gap-3 font-normal",
                    collapsed ? "h-10 w-12 mx-auto" : "px-3",
                    activeSection === group.id
                      ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                  onClick={() => group.id && onSectionChange(group.id)}
                  title={collapsed ? group.label : undefined}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span className="flex-1 text-left text-sm">{group.label}</span>}
                </Button>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-gray-200 p-2 space-y-1">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          className={cn("w-full justify-start gap-3 text-gray-500", collapsed ? "h-10 w-12 mx-auto" : "px-3")}
          onClick={onToggle}
          title={collapsed ? "Expand" : "Collapse"}
        >
          <ArrowRightFromLine className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && <span className="text-sm">Collapse</span>}
        </Button>
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          className={cn("w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50", collapsed ? "h-10 w-12 mx-auto" : "px-3")}
          onClick={onLogout}
          title="Logout"
        >
          <ArrowRightFromLine className="h-4 w-4 rotate-180" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </Button>
      </div>
    </div>
  );
}
