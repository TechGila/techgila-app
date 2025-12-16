import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { logout as apiLogout } from "@/lib/api";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Zap,
  LayoutDashboard,
  ListOrdered,
  TestTube2,
  Brain,
  Settings,
  CreditCard,
  LogOut,
  User,
  ChevronDown,
  Menu,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Logo from "../Logo";

const navItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Build Queue", url: "/dashboard/build-queue", icon: ListOrdered },
  { title: "Test Results", url: "/dashboard/test-results", icon: TestTube2 },
  { title: "AI Insights", url: "/dashboard/ai-insights", icon: Brain },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
  { title: "Billing", url: "/dashboard/billing", icon: CreditCard },
];

function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar
      className='border-r border-border/50 bg-sidebar'
      collapsible='icon'
    >
      <div className='flex h-16 items-center gap-3 px-4 border-b border-border/50'>
        <Logo />
      </div>
      <SidebarContent className='pt-4'>
        <SidebarGroup>
          <SidebarGroupLabel className='text-sidebar-foreground/60'>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className='flex items-center gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors'
                      activeClassName='bg-sidebar-accent text-sidebar-accent-foreground'
                    >
                      <item.icon className='h-5 w-5 shrink-0' />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiLogout();
      logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/auth");
    } catch {
      logout();
      navigate("/auth");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || "U";
  };

  return (
    <SidebarProvider>
      <div className='min-h-screen flex w-full bg-background'>
        <AppSidebar />
        <div className='flex-1 flex flex-col'>
          {/* Header */}
          <header className='h-16 border-b border-border/50 flex items-center justify-between px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
            <div className='flex items-center gap-4'>
              <SidebarTrigger className='text-muted-foreground hover:text-foreground'>
                <Menu className='h-5 w-5' />
              </SidebarTrigger>
              <h1 className='text-lg font-semibold text-foreground hidden sm:block'>
                Dashboard
              </h1>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='flex items-center gap-2 h-10 px-2'
                >
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src={user?.avatar || undefined} />
                    <AvatarFallback className='bg-primary text-primary-foreground text-sm'>
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className='text-sm font-medium text-foreground hidden sm:block'>
                    {user?.first_name || user?.username}
                  </span>
                  <ChevronDown className='h-4 w-4 text-muted-foreground' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuLabel>
                  <div className='flex flex-col space-y-1'>
                    <p className='text-sm font-medium'>
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/dashboard/settings")}
                >
                  <User className='mr-2 h-4 w-4' />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/dashboard/billing")}
                >
                  <CreditCard className='mr-2 h-4 w-4' />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className='mr-2 h-4 w-4' />
                  {isLoggingOut ? "Logging out..." : "Log out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* Main Content */}
          <main className='flex-1 p-6 overflow-auto'>
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
