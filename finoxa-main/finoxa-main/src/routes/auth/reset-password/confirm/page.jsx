import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { toast } from "sonner";

import { supabase } from "@/services/supabase/client";

const ConfirmPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const next = searchParams.get("next");

    useEffect(() => {
        if (token_hash && type) {
            const { error } = supabase.auth.verifyOtp({
                type,
                token_hash,
            });

            if (error) {
                toast.error(error.message);
            }

            if (!error) {
                if (next) {
                    navigate(next, {
                        state: {
                            timestamp: new Date().getTime(),
                        },
                    });
                } else {
                    navigate("/auth/login");
                }
            }
        }
    }, [navigate, next, token_hash, type]);
};

export default ConfirmPage;
