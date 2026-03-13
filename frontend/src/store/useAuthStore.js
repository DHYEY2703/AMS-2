import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

import.meta.env.MODE === "development" ? "http://localhost:5002" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],

    // Initialize auth state from localStorage token
    initializeAuth: () => {
        const token = localStorage.getItem("token");
        if (token) {
            // Set token in axios headers is handled by interceptor
            get().checkAuth();
        } else {
            set({ authUser: null, isCheckingAuth: false });
        }
    },

    // Check if user is authenticated
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/users/auth/check");
            set({ authUser: res.data });
        } catch (error) {
            console.error("Error in check auth:", error);
            set({ authUser: null });
            localStorage.removeItem("token");
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    // Signup
    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/users/signup", data);
            if (res.data.token) {
                localStorage.setItem("token", res.data.token);
            }
            set({ authUser: res.data.user || res.data });
            toast.success("Account Created Successfully");
        } catch (error) {
            console.error("Signup error:", error);
            toast.error(error?.response?.data?.message || "Signup failed");
        } finally {
            set({ isSigningUp: false });
        }
    },

    // Logout
    logout: async () => {
        try {
            await axiosInstance.post("/users/logout");
            set({ authUser: null });
            localStorage.removeItem("token");
            toast.success("Logged out Successfully");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error(error?.response?.data?.message || "Logout failed");
        }
    },

    // Update Profile
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/users/profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error?.response?.data?.message || "Failed to update profile");
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    // Login - Step 1: Send credentials, receive OTP challenge
    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/users/login", data);
            
            if (res.data.requireOTP) {
                // OTP required — don't set authUser yet
                set({ isLoggingIn: false });
                return res.data; // { requireOTP, userId, email, message }
            }

            // Fallback: direct login (shouldn't happen with 2FA)
            if (res.data.token) {
                localStorage.setItem("token", res.data.token);
            }
            set({ authUser: res.data.user || res.data });
            toast.success("Logged In Successfully");
            return res.data;
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error?.response?.data?.msg || "Login failed");
            throw error;
        } finally {
            set({ isLoggingIn: false });
        }
    },

    // Login - Step 2: Verify OTP
    verifyOTP: async ({ userId, otp }) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/users/verify-otp", { userId, otp });
            if (res.data.token) {
                localStorage.setItem("token", res.data.token);
            }
            set({ authUser: res.data.user || res.data });
            toast.success("Login Successful! ✅");
            return res.data;
        } catch (error) {
            console.error("OTP verification error:", error);
            toast.error(error?.response?.data?.msg || "OTP verification failed");
            throw error;
        } finally {
            set({ isLoggingIn: false });
        }
    },
}
));
