import moment from "moment";

import { DotIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export const Article = ({ article }) => {
    return (
        <div
            key={article.id}
            className="border-b p-4"
        >
            <a
                href={article.article_url}
                target="_blank"
                rel="noopener noreferrer"
            >
                <div className="flex flex-wrap-reverse justify-between gap-8 sm:flex-nowrap">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="bg-muted/50 rounded-sm border p-1">
                                <img
                                    src={article.publisher.logo_url}
                                    alt={article.publisher.name}
                                    className="size-4 rounded"
                                />
                            </div>
                            <span className="text-xs font-medium">{article.publisher.name}</span>
                        </div>
                        <h2 className="text-lg font-semibold">{article.title}</h2>
                        <div className="text-muted-foreground flex items-center text-xs font-medium">
                            <p>{moment(article.published_at).fromNow()}</p>
                            {article.authors.length > 0 && (
                                <>
                                    <DotIcon />
                                    <div>
                                        By{" "}
                                        {article.authors.map((author, index) => (
                                            <span key={author}>
                                                {author}
                                                {index < article.authors.length - 1 && ", "}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {[...new Map(article.insights?.map((insight) => [insight.ticker, insight])).values()].map((insight) => (
                                <div
                                    key={insight.ticker}
                                    className={cn(
                                        "bg-muted/50 flex w-fit items-center gap-2 rounded-sm border p-1 text-xs font-medium",
                                        insight.sentiment === "Positive"
                                            ? "text-green-500"
                                            : insight.sentiment === "Negative"
                                              ? "text-red-500"
                                              : "text-foreground",
                                    )}
                                >
                                    {insight.ticker}
                                </div>
                            ))}
                        </div>
                    </div>
                    <img
                        src={article.image_url}
                        alt={article.title}
                        className="aspect-video h-40 rounded-lg object-cover"
                        loading="lazy"
                    />
                </div>
            </a>
        </div>
    );
};
