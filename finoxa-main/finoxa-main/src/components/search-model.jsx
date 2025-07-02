import { Link } from "react-router";
import moment from "moment";

import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

import { DotIcon, LoaderIcon, SearchIcon, XIcon } from "lucide-react";
import { useEffect } from "react";
import { useSearch } from "@/hooks/use-search";

export const SearchModel = ({ data, searchQuery, setSearchQuery, isLoading }) => {
    const { isOpen, toggle, onClose } = useSearch();

    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "k") {
                event.preventDefault();
                toggle();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [toggle]);

    return (
        <Dialog
            open={isOpen}
            onOpenChange={toggle}
        >
            <DialogContent className="w-full !max-w-[700px] gap-0 p-0 [&_button]:has-[svg]:hidden">
                <div className="sr-only">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">Search</DialogTitle>
                        <DialogDescription>Search for news, symbols or companies...</DialogDescription>
                    </DialogHeader>
                </div>
                <div className="flex items-center gap-2 px-4 py-2">
                    <SearchIcon
                        className="text-muted-foreground"
                        size={20}
                    />
                    <Input
                        className="border-0 !text-base shadow-none focus-visible:border-0 focus-visible:ring-0"
                        placeholder="Search for news, symbols or companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery.length > 0 && (
                        <span
                            className="hover:bg-muted cursor-pointer p-1 duration-150 hover:rounded-full"
                            onClick={() => setSearchQuery("")}
                        >
                            <XIcon
                                size={16}
                                className="text-muted-foreground"
                            />
                        </span>
                    )}
                </div>
                <div className="max-h-[500px] overflow-x-hidden overflow-y-auto">
                    {isLoading && (
                        <div className="flex items-center justify-center p-4">
                            <LoaderIcon
                                className="text-muted-foreground animate-spin"
                                size={20}
                            />
                        </div>
                    )}
                    {(data?.stocks.length > 0 || data?.indices.length > 0) && (
                        <div className="model-group">
                            <h3 className="model-heading">Symbols</h3>
                            <div className="model-list">
                                {[...data.stocks, ...data.indices]?.map((ticker) => (
                                    <Link
                                        key={ticker?.ticker}
                                        to={`/dashboard/screener/${ticker?.ticker}`}
                                        onClick={onClose}
                                    >
                                        <div className="model-item">
                                            <div>
                                                <p className="font-medium">{ticker?.ticker}</p>
                                                <p>{ticker?.company_name || ticker?.name}</p>
                                            </div>
                                            <p className="text-muted-foreground">{ticker?.market === "stocks" ? "Stock" : "Index"}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                    {data?.news.length > 0 && (
                        <div className="model-group">
                            <h3 className="model-heading">News</h3>
                            {data?.news?.map((article) => (
                                <a
                                    key={article?.id}
                                    href={article?.article_url}
                                    onClick={onClose}
                                    target="_blank"
                                >
                                    <div className="model-item flex-col">
                                        <p className="font-medium">{article?.title}</p>
                                        <div className="flex items-center">
                                            <p className="text-muted-foreground text-sm">{article?.publisher?.name}</p>
                                            <DotIcon
                                                className="text-muted-foreground"
                                                size={16}
                                            />
                                            <p className="text-muted-foreground text-sm">{moment(article?.published_at).fromNow()}</p>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
