import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDocumentTitle } from "@uidotdev/usehooks";

import { useAuthStore } from "@/stores/auth-store";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import FionxaLogo from "@/assets/Finoxa-icon.svg";

const ResetPasswordPage = () => {
    useDocumentTitle("Reset Password - Finoxa");
    const navigate = useNavigate();
    const { resetPassword } = useAuthStore();

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const { data } = await resetPassword({ email });
        setIsLoading(false);
        if (data) {
            localStorage.setItem("counter", 60);
            navigate("/auth/reset-password/success", {
                state: {
                    email,
                },
            });
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="flex w-full max-w-[450px] flex-col items-center gap-10">
                <div className="flex flex-col items-center gap-4">
                    <img
                        src={FionxaLogo}
                        alt="Finoxa"
                        className="h-16 w-16"
                    />
                    <div className="flex flex-col gap-2">
                        <h1 className="text-center text-2xl font-bold">Forgot Password</h1>
                        <p className="text-muted-foreground text-center text-sm">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>
                </div>
                <form className="grid w-full grid-cols-1 gap-4">
                    <div className="col-span-full grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        className="col-span-full cursor-pointer"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
                    </Button>
                    <p className="justify-self-center">
                        Remember your password?{" "}
                        <Button
                            asChild
                            variant="link"
                            className="cursor-pointer px-0"
                        >
                            <Link
                                to="/auth/login"
                                replace
                            >
                                Back to Login
                            </Link>
                        </Button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
