import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";

import { supabase } from "@/services/supabase/client";

import { useSearch } from "@/hooks/use-search";

import { SearchModel } from "../search-model";
import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";

import { LogOutIcon, SearchIcon } from "lucide-react";
import { axiosInstance } from "@/utils/axios-instance";

export const Header = () => {
    const { open, isMobile } = useSidebar();
    const { isOpen, onOpen } = useSearch();

    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const debouncedSearchQuery = useDebounce(searchQuery, 700);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            supabase
                .from("profiles")
                .select("*")
                .eq("id", data.user.id)
                .single()
                .then(({ data }) => {
                    setUser(data);
                });
        });
    }, []);

    const { data, isLoading } = useQuery({
        queryKey: ["search", debouncedSearchQuery],
        queryFn: async () => {
            const response = await axiosInstance.get("/search", {
                params: {
                    q: debouncedSearchQuery,
                },
            });

            return response.data.data;
        },

        enabled: isOpen && debouncedSearchQuery.trim().length > 0,
    });

    return (
        <>
            <header className="bg-background flex h-[53px] w-full items-center justify-between gap-x-2 border-b px-4 py-2">
                <div className="flex w-full items-center gap-2">
                    {(!open || isMobile) && (
                        <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                        >
                            <SidebarTrigger />
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        className="w-full max-w-64 shrink-1 cursor-pointer justify-start"
                        onClick={onOpen}
                    >
                        <SearchIcon />
                        <span className="text-muted-foreground">Search...</span>
                        <kbd className="bg-background ml-auto rounded-sm border px-1 py-0.5 text-[12px]">Ctrl+K</kbd>
                    </Button>
                </div>
                <div className="flex items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Avatar className="cursor-pointer">
                                <AvatarImage src={user?.profile_pic} />
                                <AvatarFallback>
                                    {user?.first_name[0]}
                                    {user?.last_name[0]}
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <div className="p-2 text-sm">
                                <p>
                                    {user?.first_name} {user?.last_name}
                                </p>
                                <p className="text-muted-foreground">{user?.email}</p>
                            </div>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => supabase.auth.signOut()}
                            >
                                <LogOutIcon className="text-foreground" />
                                Log Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <SearchModel
                    data={data}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    isLoading={isLoading}
                />
            </header>
        </>
    );
};
