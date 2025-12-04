"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import type { LucideIcon } from "lucide-react";
import {
  CommandIcon,
  FileCode2Icon,
  UsersIcon,
  WorkflowIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";

const navLinks: Array<{
  href: React.ComponentProps<typeof Link>["href"];
  icon: LucideIcon;
  label: string;
}> = [
  {
    href: "/",
    icon: FileCode2Icon,
    label: "Analyze Invoices",
  },
  {
    href: "/analysis-workflows",
    icon: WorkflowIcon,
    label: "Analysis History",
  },
  {
    href: "/customers/list",
    icon: UsersIcon,
    label: "Customers",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-sidebar-border h-(--header-height) border-b">
        <TeamSwitcher
          teams={[
            {
              name: "Invoisus",
              logo: CommandIcon,
              plan: "-",
            },
          ]}
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === link.href
                    : pathname.startsWith(link.href.toString());

                return (
                  <SidebarMenuItem key={link.href.toString()}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={link.label}
                      onClick={() => setOpenMobile(false)}
                    >
                      <Link href={link.href}>
                        <link.icon />
                        <span>{link.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
