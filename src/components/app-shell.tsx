'use client';

import { usePathname } from 'next/navigation';
import { BookOpen, Menu, Sparkles, CalendarDays, Settings } from 'lucide-react';
import { Home, LogOut } from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { useIsMobile } from '@/hooks/use-mobile';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Home,
  },
  {
    href: '/recipes',
    label: 'Recipes',
    icon: BookOpen,
  },
  {
    href: '/generate',
    label: 'Generate Plan',
    icon: Sparkles,
  },
  {
    href: '/plans',
    label: 'My Plans',
    icon: CalendarDays,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
];

function BottomNavigation() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="grid h-16 grid-cols-5">
        {menuItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
              pathname === item.href
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const getPageTitle = () => {
    const currentItem = menuItems.find(item => pathname.startsWith(item.href));
    if (currentItem) {
      return currentItem.label;
    }
    if (pathname.includes('/recipes/')) {
      return 'Recipe Details';
    }
    return 'NutriGenius';
  };

  if (isMobile) {
    return (
      <>
        <div className="flex h-14 items-center border-b bg-background px-4">
          <h1 className="flex-1 text-xl font-semibold font-headline">
            {getPageTitle()}
          </h1>
        </div>
        <main className="flex-1 p-4 pb-20">{children}</main>
        <BottomNavigation />
      </>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b">
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map(item => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                  className="transition-colors"
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  // Add your logout logic here
                  console.log('Logout clicked');
                }}
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger variant="outline" size="icon" className="h-8 w-8">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle navigation menu</span>
          </SidebarTrigger>
          <h1 className="flex-1 text-xl font-semibold font-headline">
            {getPageTitle()}
          </h1>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
