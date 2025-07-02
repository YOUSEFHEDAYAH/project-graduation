import { useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import { useCountdown } from "@/hooks/use-count-down";
import { useAuthStore } from "@/stores/auth-store";

import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";

import FionxaLogo from "@/assets/Finoxa-icon.svg";

const VerifyEmailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [complete, setComplete] = useState(false);
    const [pendingEmail] = useState(location.state?.email);
    const [otp, setOtp] = useState("");

    const { resendVerificationEmail, verifyEmail, user } = useAuthStore();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const { error } = await verifyEmail({ email: user?.email || pendingEmail, token: otp });
        if (!error) {
            localStorage.removeItem("counter");
            navigate("/dashboard");
        }
    };

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

    const handleResendCode = async () => {
        setCount(60);
        setComplete(false);
        start();
        await resendVerificationEmail({ email: location.state.email });
    };

    if (!pendingEmail)
        return (
            <Navigate
                to="/auth/signup"
                replace
            />
        );

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
                        <h1 className="text-center text-2xl font-bold">Verify your email</h1>
                        <p className="text-muted-foreground text-center text-sm">Enter the 6-digit code we sent to your email.</p>
                    </div>
                </div>
                <form
                    className="grid grid-cols-1 gap-4"
                    onSubmit={handleSubmit}
                >
                    <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        value={otp}
                        onChange={(value) => setOtp(value)}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot
                                index={0}
                                className="size-10"
                            />
                            <InputOTPSlot
                                index={1}
                                className="size-10"
                            />
                            <InputOTPSlot
                                index={2}
                                className="size-10"
                            />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot
                                index={3}
                                className="size-10"
                            />
                            <InputOTPSlot
                                index={4}
                                className="size-10"
                            />
                            <InputOTPSlot
                                index={5}
                                className="size-10"
                            />
                        </InputOTPGroup>
                    </InputOTP>
                    <Button
                        type="submit"
                        className="cursor-pointer"
                        disabled={otp.length < 6}
                    >
                        Verify Email
                    </Button>
                    <p>
                        Didn't receive the code?{" "}
                        <Button
                            variant="link"
                            className="cursor-pointer px-0"
                            onClick={handleResendCode}
                            disabled={!complete}
                        >
                            {!complete ? `Resend in ${count}s` : "Resend code"}
                        </Button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
