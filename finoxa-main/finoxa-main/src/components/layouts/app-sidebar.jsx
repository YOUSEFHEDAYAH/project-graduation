import { Link } from "react-router";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

import { Logo } from "@/components/logo";
import { GlobeIcon, NewspaperIcon } from "lucide-react";

const items = [
    {
        groupTitle: "Markets",
        items: [
            {
                title: "Screener",
                url: "screener",
                icon: GlobeIcon,
            },
            {
                title: "News",
                url: "news",
                icon: NewspaperIcon,
            },
        ],
    },
];

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarHeader className="border-b">
                    <SidebarMenu>
                        <SidebarMenuItem className="flex items-center justify-between px-2">
                            <Logo />
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="cursor-pointer"
                            >
                                <SidebarTrigger />
                            </Button>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                {items.map((group) => (
                    <SidebarGroup key={group.groupTitle}>
                        <SidebarGroupLabel>{group.groupTitle}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link to={item.url}>
                                                <item.icon />
                                                <span className="font-medium">{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
        </Sidebar>
    );
}
