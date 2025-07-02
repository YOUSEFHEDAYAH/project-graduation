import { useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";

import numeral from "numeral";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const Profile = () => {
    const { ticker } = useOutletContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (ticker?.market === "indices") navigate("/not-found", { replace: true });
    }, [ticker?.market, navigate]);

    return (
        <div className="grid grid-cols-1 p-4 md:grid-cols-3">
            <div className="md:col-span-2">
                <Card className="bg-background border-none shadow-none">
                    <CardHeader className="p-0">
                        <CardTitle>Company Description</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <p>
                            {ticker?.description
                                ? ticker.description.split(". ").map((sentence, idx, arr) => (
                                      <span key={idx}>
                                          {sentence}
                                          {idx < arr.length - 1 ? ". " : ""}
                                          <br />
                                          <br />
                                      </span>
                                  ))
                                : "No description available."}
                        </p>
                    </CardContent>
                </Card>
                <Separator className="md:!w-[calc(100%+1rem)]" />
                <Card className="bg-background border-none shadow-none">
                    <CardHeader className="p-0">
                        <CardTitle>Key Executives</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-hidden rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Pay</TableHead>
                                        <TableHead>Exercised</TableHead>
                                        <TableHead>Year Born</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ticker?.company_officers?.map((executive, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{executive.name}</TableCell>
                                            <TableCell>{executive.title}</TableCell>
                                            <TableCell className="text-right">
                                                {numeral(executive.totalPay).format("0.00a").toUpperCase() || "--"}
                                            </TableCell>
                                            <TableCell className="text-right">{executive.exercised_value || "--"}</TableCell>
                                            <TableCell className="text-right">{executive.year_born || "--"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-1 md:flex">
                <Separator
                    orientation="vertical"
                    className="mx-4 hidden md:block"
                />
                <Separator className="md:hidden" />
                <Card className="bg-background border-none shadow-none">
                    <CardHeader className="p-0">
                        <CardTitle>{ticker?.company_name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 p-0">
                        <div>
                            <p>{ticker?.address?.street}</p>
                            <p>
                                {ticker?.address?.city} {ticker?.address?.state} {ticker?.address?.zip_code}
                            </p>
                            <p>{ticker?.country}</p>
                        </div>
                        <div>
                            <p>{ticker?.phone}</p>
                            <Button
                                variant="link"
                                className="p-0"
                            >
                                <a
                                    href={ticker?.website}
                                    target="_blank"
                                >
                                    {ticker?.website}
                                </a>
                            </Button>
                        </div>
                        <div>
                            <p>
                                Sector: <span className="font-medium">{ticker?.sector}</span>
                            </p>
                            <p>
                                Industry: <span className="font-medium">{ticker?.industry}</span>
                            </p>
                            <p>
                                Full time employees: <span className="font-medium">{numeral(ticker?.employees || 0).format("0,0")}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
