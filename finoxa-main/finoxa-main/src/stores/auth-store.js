import { create } from "zustand";
import { toast } from "sonner";

import { supabase } from "@/services/supabase/client";

export const useAuthStore = create((set) => ({
    user: null,
    loading: true,

    initAuth: async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        set({ user: session?.user ?? null, loading: false });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            set({ user: session?.user ?? null, loading: false });
        });

        return () => subscription.unsubscribe();
    },

    /**
     * Signup user with metadata (first_name, last_name)
     */
    signup: async ({ first_name, last_name, email, password }) => {
        const { data: profiles } = await supabase.from("profiles").select("*").eq("email", email);

        if (profiles && profiles.length > 0) {
            toast.error("This email is already in use.");
            return { error: { message: "This email is already in use." } };
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { first_name, last_name },
            },
        });

        if (error) {
            toast.error(error.message);
            set({ loading: false });
            return { error: { message: error.message } };
        }

        if (data.user) {
            toast.success("Check your email for the OTP to verify your account");
            set({ loading: false });
            return { data, error: null };
        }
    },

    /**
     * Login user with email and password
     */
    login: async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error(error.message);
            return { error: { message: error.message } };
        }

        if (data.user) {
            toast.success("Login successful");
            set({ loading: false });
            return { data, error: null };
        }
    },

    /**
     *  Logout user
     */
    logout: async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            toast.error(error.message);
            return { error: { message: error.message } };
        }

        return { error: null };
    },

    /**
     * Resend OTP code to email
     */
    resendVerificationEmail: async ({ email }) => {
        const { data, error } = await supabase.auth.resend({
            type: "signup",
            email,
        });

        if (error) {
            return { error: { message: error.message } };
        }

        if (data) {
            toast.success("OTP code resent to email");
            return { data, error: null };
        }
    },

    /**
     * Verify email with OTP code
     */
    verifyEmail: async ({ email, token }) => {
        const { data, error } = await supabase.auth.verifyOtp({
            type: "signup",
            email,
            token,
        });

        if (error) {
            toast.error(error.message);
            return { error: { message: error.message } };
        }

        if (data.user) {
            toast.success("Email verified successfully");
            return { data, error: null };
        }
    },

    /**
     * Reset password with email
     */
    resetPassword: async ({ email }) => {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
            toast.error(error.message);
            return { error: { message: error.message } };
        }

        if (data) {
            toast.success("Check your email for the OTP to reset your password");
            return { data, error: null };
        }
    },

    /**
     * Update user password
     */
    updatePassword: async ({ password }) => {
        const { data, error } = await supabase.auth.updateUser({
            password,
        });

        if (error) {
            toast.error(error.message);
            return { error: { message: error.message } };
        }

        if (data) {
            toast.success("Password updated successfully");
            return { data, error: null };
        }
    },
}));
