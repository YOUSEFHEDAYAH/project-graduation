import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDocumentTitle } from "@uidotdev/usehooks";

import FionxaLogo from "@/assets/Finoxa-icon.svg";

import { useAuthStore } from "@/stores/auth-store";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { supabase } from "@/services/supabase/client";

const UpdatePasswordPage = () => {
    useDocumentTitle("Reset Password - Finoxa");

    const navigate = useNavigate();
    const location = useLocation();

    const { updatePassword } = useAuthStore();

    const [inputsValues, setInputValues] = useState({
        password: "",
        repassword: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInputValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setIsLoading(true);

        if (inputsValues.password !== inputsValues.repassword) {
            toast.error("Passwords do not match");
            setIsLoading(false);
            return;
        }

        const { error } = await updatePassword({ password: inputsValues.password });
        setIsLoading(false);

        if (!error) {
            toast.success("Password updated successfully");
            await supabase.auth.signOut();
            navigate("/auth/login");
        }
    };

    useEffect(() => {
        async function signOutIfExpired() {
            const currentTime = new Date().getTime();
            const timeDifference = currentTime - location.state.timestamp;
            const minutes = Math.floor(timeDifference / (1000 * 60));
            if (minutes > 15) {
                await supabase.auth.signOut();
                toast.error("Link has expired");
                navigate("/auth/login");
            }
        }
        if (location.state) {
            signOutIfExpired();
        }
    }, [location.state, navigate]);

    useEffect(() => {
        async function checkToken() {
            const { data } = await supabase.auth.getUser();
            if (!data.user) {
                navigate("/not-found", { replace: true });
            }
        }
        checkToken();
    }, [navigate]);

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
                        <h1 className="text-center text-2xl font-bold">Create a New Password</h1>
                        <p className="text-muted-foreground text-center text-sm">
                            Enter your new password below to complete the reset process. Ensure it's strong and secure.
                        </p>
                    </div>
                </div>
                <form
                    className="grid grid-cols-1 gap-4 md:grid-cols-2"
                    onSubmit={handleSubmit}
                >
                    <div className="col-span-full grid gap-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={inputsValues.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-span-full grid gap-2">
                        <Label htmlFor="repassword">Repeat new password</Label>
                        <Input
                            id="repassword"
                            name="repassword"
                            type="password"
                            placeholder="Enter your password"
                            your
                            password
                            minLength={6}
                            value={inputsValues.repassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        className="col-span-full cursor-pointer"
                        disabled={isLoading}
                    >
                        {isLoading ? "Submitting..." : "Submit"}
                    </Button>
                    <p className="col-span-full justify-self-center">
                        Remember your password?{" "}
                        <Button
                            type="button"
                            variant="link"
                            className="cursor-pointer px-0"
                            onClick={async () => {
                                await supabase.auth.signOut();
                                navigate("/auth/login");
                            }}
                        >
                            Back to Log In
                        </Button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default UpdatePasswordPage;
