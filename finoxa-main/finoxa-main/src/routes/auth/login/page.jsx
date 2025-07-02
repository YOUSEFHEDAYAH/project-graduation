import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useDocumentTitle } from "@uidotdev/usehooks";

import { useAuthStore } from "@/stores/auth-store";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Loader2Icon } from "lucide-react";

import FionxaLogo from "@/assets/Finoxa-icon.svg";

const LoginPage = () => {
    useDocumentTitle("Log In - Finoxa");
    const navigate = useNavigate();
    const { login, resendVerificationEmail } = useAuthStore();

    const [inputsValues, setInputsValues] = useState({
        email: "",
        password: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInputsValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const { error } = await login(inputsValues);
        setIsLoading(false);

        if (error?.message === "Email not confirmed") {
            resendVerificationEmail({ email: inputsValues.email });
            localStorage.setItem("counter", 60);
            navigate("/auth/verify-email", {
                state: {
                    email: inputsValues.email,
                },
            });
        }

        if (!error) navigate("/dashboard");
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="flex w-full max-w-[450px] flex-col gap-10">
                <div className="flex flex-col items-center gap-4">
                    <img
                        src={FionxaLogo}
                        alt="Finoxa"
                        className="h-16 w-16"
                    />
                    <div className="flex flex-col gap-2">
                        <h1 className="text-center text-2xl font-bold">Welcome Back to Finoxa</h1>
                        <p className="text-muted-foreground text-center text-sm">Enter your email and password to continue.</p>
                    </div>
                </div>
                <form
                    className="grid grid-cols-1 gap-4 md:grid-cols-2"
                    onSubmit={handleSubmit}
                >
                    <div className="col-span-full grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={inputsValues.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-span-full grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            minLength={6}
                            value={inputsValues.password}
                            onChange={handleChange}
                            required
                        />
                        <Button
                            asChild
                            type="button"
                            variant="link"
                            className="justify-end px-0"
                        >
                            <Link
                                to="/auth/reset-password"
                                className="text-sm font-normal"
                            >
                                Forgot Password?
                            </Link>
                        </Button>
                    </div>
                    <Button
                        type="submit"
                        className="col-span-full cursor-pointer"
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging In..." : "Log In"}
                    </Button>
                    <p className="text-muted-foreground col-span-full justify-self-center text-center text-sm">
                        Don't have an account?{" "}
                        <Button
                            asChild
                            variant="link"
                            className="px-0"
                        >
                            <Link to="/auth/signup">Sign Up</Link>
                        </Button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
