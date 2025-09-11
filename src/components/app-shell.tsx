
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { BookOpen, Menu, Sparkles, CalendarDays, Settings } from "lucide-react";
import { useTranslations } from 'next-intl';

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
import { cn } from "@/lib/utils";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const t = useTranslations('Navigation'); 

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

  const currentLabel =
    menuItems.find((item) => pathname.includes(item.href.substring(1)))?.label || "NutriGenius";

  if (isMobile === undefined) {
    return null;
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
                  isActive={pathname.includes(item.href.substring(1))}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
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
            {currentLabel}
          </h1>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
