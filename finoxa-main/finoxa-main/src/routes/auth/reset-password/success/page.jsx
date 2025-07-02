import { useState } from "react";
import { Link, useLocation, Navigate } from "react-router";
import { useDocumentTitle } from "@uidotdev/usehooks";

import { useCountdown } from "@/hooks/use-count-down";
import { useAuthStore } from "@/stores/auth-store";

import { Button } from "@/components/ui/button";

import { Loader2Icon, MailIcon } from "lucide-react";

const SuccessPage = () => {
    useDocumentTitle("Success - Finoxa");
    const location = useLocation();

    const { resetPassword } = useAuthStore();

    const [complete, setComplete] = useState(true);

    const { count, setCount, start } = useCountdown(localStorage.getItem("counter"), {
        interval: 1000,
        autoStart: localStorage.getItem("counter") ? true : false,
        onStart: () => {
            setComplete(false);
        },
        onTick: (time) => {
            localStorage.setItem("counter", time);
        },
        onComplete: () => {
            setComplete(true);
            localStorage.removeItem("counter");
        },
    });

    const handleResendEmail = async () => {
        setCount(60);
        setComplete(false);
        start();
        await resetPassword({ email: location.state.email });
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="flex w-full max-w-[450px] flex-col items-center gap-10">
                <div className="flex flex-col items-center gap-4">
                    <div className="bg-muted flex h-24 w-24 items-center justify-center rounded-full">
                        <MailIcon size={64} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <h1 className="text-center text-2xl font-bold">Check Your Email</h1>
                        <p className="text-muted-foreground text-center text-sm">
                            We sent a password reset link to your email. Please check your inbox.
                        </p>
                    </div>
                </div>
                <div className="grid w-full grid-cols-1 gap-4">
                    <Button
                        asChild
                        type="submit"
                        className="col-span-full cursor-pointer"
                    >
                        <Link
                            to="https://mail.google.com/"
                            target="_blank"
                        >
                            Open Gmail
                        </Link>
                    </Button>
                    <p className="justify-self-center">
                        Didn't receive the email?{" "}
                        <Button
                            variant="link"
                            className="cursor-pointer px-0"
                            onClick={handleResendEmail}
                            disabled={!complete}
                        >
                            {!complete ? `Resend in ${count}s` : "Resend email"}
                        </Button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SuccessPage;
