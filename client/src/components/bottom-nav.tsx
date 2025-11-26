import { Link, useLocation } from "wouter";
import { Home, Trophy, Wallet, Users, User } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/scrims", icon: Trophy, label: "Scrims" },
    { path: "/wallet", icon: Wallet, label: "Wallet" },
    { path: "/teammates", icon: Users, label: "Teammates" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-card-border md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <button
                data-testid={`nav-${item.label.toLowerCase()}`}
                className={`flex flex-col items-center justify-center w-full h-full min-w-[44px] min-h-[44px] gap-0.5 hover-elevate active-elevate-2 rounded-md ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className={isActive ? "fill-current" : ""} size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
