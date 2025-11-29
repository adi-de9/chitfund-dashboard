import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  FileText,
  Bell,
  LogOut,
  Menu,
  Search,
  Moon,
  Sun,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  BadgeDollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { logout } from "@/api/auth";

const Sidebar = ({ 
  className, 
  isCollapsed = false,
  onNavigate 
}: { 
  className?: string; 
  isCollapsed?: boolean;
  onNavigate?: () => void;
}) => {
  const location = useLocation();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/groups", icon: Users, label: "Groups" },
    { href: "/ledger", icon: FileText, label: "Ledger" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
  ];

  return (
    <div
      className={cn(
        "pb-12 border-r relative overflow-hidden transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-50" />
      
      <div className="space-y-4 py-6 relative z-10">
        <div className="px-4 py-2">
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link 
                  key={item.href} 
                  to={item.href}
                  onClick={onNavigate}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      "hover:bg-accent/50 hover:text-accent-foreground",
                      "group relative overflow-hidden",
                      isActive && "bg-primary text-primary-foreground shadow-md hover:bg-primary hover:text-primary-foreground",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    {/* Active indicator line */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground rounded-r-full" />
                    )}
                    
                    <item.icon className={cn(
                      "h-5 w-5 transition-transform group-hover:scale-110",
                      isActive && "animate-pulse-slow",
                      isCollapsed && "h-6 w-6"
                    )} />
                    
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {isActive && (
                          <ChevronRight className="h-4 w-4 opacity-70" />
                        )}
                      </>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
                        {item.label}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Auto-close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {/* Modern Header with gradient border - Fixed */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 lg:px-6 shadow-sm shrink-0">
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        {/* Mobile Menu */}
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="md:hidden hover-lift h-10 w-10"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar onNavigate={() => setIsMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="px-3 transition-all duration-300 w-64 flex items-center gap-2">
          <BadgeDollarSign className="h-5 w-5 bg-gradient-to-r from-primary to-primary/70 bg-clip-text" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent text-nowrap">
              Chit Fund
            </h2>
        </div>

        {/* Desktop Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden md:flex hover-lift h-10 w-10"
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        
        <div className="flex w-full items-center justify-between gap-4">
          {/* Mobile Logo */}
          <div className="font-bold md:hidden bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Chit Fund Admin
          </div>
          
          {/* Search bar - Desktop & Tablet */}
          <div className="hidden sm:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 bg-accent/50 border-accent focus-visible:ring-primary/50"
              />
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden hover-lift h-10 w-10"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover-lift h-10 w-10"
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover-lift h-10 w-10"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
              <span className="sr-only">Notifications</span>
            </Button>
            
            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full hover-lift ring-2 ring-transparent hover:ring-primary/20 transition-all"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/avatars/01.png" alt="@admin" />
                    <AvatarFallback className="bg-gradient-to-r from-primary to-primary/70 text-primary-foreground">
                      AD
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Admin User</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      admin@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar - Fixed */}
        <aside className="hidden md:block border-r bg-card shrink-0 overflow-y-auto">
          <Sidebar 
            className="border-none bg-transparent" 
            isCollapsed={isSidebarCollapsed}
          />
        </aside>
        
        {/* Main Content Area - Scrollable */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-100 overflow-y-auto">
          <div className="animate-fade-in max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
