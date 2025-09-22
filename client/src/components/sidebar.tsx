import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  UserPlus, 
  PlusCircle, 
  MinusCircle, 
  ArrowLeftRight, 
  Users,
  University,
  Menu,
  X,
  Github
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3, current: false },
  { name: "Create Account", href: "/create-account", icon: UserPlus, current: false },
  { name: "Deposit", href: "/deposit", icon: PlusCircle, current: false, color: "text-green-600" },
  { name: "Withdraw", href: "/withdraw", icon: MinusCircle, current: false, color: "text-red-600" },
  { name: "Transfer", href: "/transfer", icon: ArrowLeftRight, current: false, color: "text-blue-600" },
  { name: "All Accounts", href: "/accounts", icon: Users, current: false },
  { name: "GitHub Deploy", href: "/github-deploy", icon: Github, current: false, color: "text-gray-900" },
];

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isCurrentPath = (href: string) => {
    if (href === "/") return location === "/";
    return location === href;
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="bg-primary rounded-lg p-2">
            <University className="text-primary-foreground text-xl h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">SecureBank</h1>
            <p className="text-sm text-muted-foreground">Management System</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isCurrent = isCurrentPath(item.href);
            
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-medium",
                    isCurrent 
                      ? "bg-accent text-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                  onClick={() => setIsMobileOpen(false)}
                  data-testid={`link-${item.name.toLowerCase().replace(' ', '-')}`}
                >
                  <Icon className={cn("text-lg h-5 w-5", item.color)} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        data-testid="button-toggle-sidebar"
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "bg-card shadow-xl w-64 flex-shrink-0 sidebar-transition h-full",
        "lg:translate-x-0 lg:relative lg:z-auto",
        "fixed z-30",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}>
        <SidebarContent />
      </div>
    </>
  );
}
