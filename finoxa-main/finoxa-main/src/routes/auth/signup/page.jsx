import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";

import { useDocumentTitle } from "@uidotdev/usehooks";

import { useAuthStore } from "@/stores/auth-store";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import FionxaLogo from "@/assets/Finoxa-icon.svg";

const SignupPage = () => {
    useDocumentTitle("Sign Up - Finoxa");
    const navigate = useNavigate();
    const { signup } = useAuthStore();

    const [inputsValues, setInputsValues] = useState({
        first_name: "",
        last_name: "",
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
        const { error } = await signup(inputsValues);
        setIsLoading(false);

        if (!error) {
            localStorage.setItem("counter", 60);

            navigate("/auth/verify-email", {
                state: {
                    email: inputsValues.email,
                },
            });
        }
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
                        <h1 className="text-center text-2xl font-bold">Create Your Finoxa Account</h1>
                        <p className="text-muted-foreground text-center text-sm">Sign up to access all Finoxa features.</p>
                    </div>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-4 md:grid-cols-2"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="first_name">First name</Label>
                        <Input
                            id="first_name"
                            name="first_name"
                            type="text"
                            placeholder="Enter your first name"
                            onChange={handleChange}
                            value={inputsValues.first_name}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="last_name">Last name</Label>
                        <Input
                            id="last_name"
                            name="last_name"
                            type="text"
                            placeholder="Enter your last name"
                            onChange={handleChange}
                            value={inputsValues.last_name}
                            required
                        />
                    </div>
                    <div className="col-span-full grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            onChange={handleChange}
                            value={inputsValues.email}
                            required
                        />
                    </div>
                    <div className="col-span-full grid gap-2">
                        <Label htmlFor="email">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            minLength={6}
                            onChange={handleChange}
                            value={inputsValues.password}
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        className="col-span-full cursor-pointer"
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing Up..." : "Sign Up"}
                    </Button>
                    <p className="text-muted-foreground col-span-full justify-self-center text-center text-sm">
                        Already have an account?{" "}
                        <Button
                            asChild
                            variant="link"
                            className="px-0"
                        >
                            <Link to="/auth/login">Log In</Link>
                        </Button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;
