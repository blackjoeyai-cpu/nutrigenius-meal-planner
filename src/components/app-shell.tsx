"use client";

import { usePathname } from "next/navigation";
import { BookOpen, Menu, Sparkles, CalendarDays, Settings } from "lucide-react";

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
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const menuItems = [
    {
      href: "/recipes",
      label: t("recipes"),
      icon: BookOpen,
    },
    {
      href: "/generate",
      label: t("generate_plan"),
      icon: Sparkles,
    },
    {
      href: "/plans",
      label: t("my_plans"),
      icon: CalendarDays,
    },
    {
      href: "/settings",
      label: t("settings"),
      icon: Settings,
    },
  ];

  if (isMobile) {
    return (
      <>
        <div className="flex h-14 items-center border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <h1 className="flex-1 text-xl font-semibold md:text-2xl font-headline">
            {menuItems.find((item) => item.href === pathname)?.label ||
              "NutriGenius"}
          </h1>
        </div>
        <main className="flex-1 p-4 pb-20">{children}</main>
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background shadow-t-lg md:hidden">
          <div className="grid h-16 grid-cols-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-sm font-medium",
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <a href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter></SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </SidebarTrigger>
          <h1 className="flex-1 text-xl font-semibold md:text-2xl font-headline">
            {menuItems.find((item) => item.href === pathname)?.label ||
              "NutriGenius"}
          </h1>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
