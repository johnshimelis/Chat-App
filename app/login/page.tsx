"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (isLogin) {
            const res = await signIn("credentials", {
                redirect: false,
                email: form.email,
                password: form.password,
            });

            if (res?.error) {
                setError("Invalid email or password");
                setLoading(false);
            } else {
                router.push("/");
            }
        } else {
            try {
                const res = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form)
                });

                if (res.ok) {
                    await signIn("credentials", {
                        redirect: false,
                        email: form.email,
                        password: form.password,
                    });
                    router.push("/");
                } else {
                    const data = await res.json();
                    setError(data.error || "Registration failed");
                    setLoading(false);
                }
            } catch (err) {
                setError("Something went wrong");
                setLoading(false);
            }
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#F8F9FA] dark:bg-[#0A0E14]">
            {/* Left Side - Visuals - Figma Design */}
            <div className="hidden lg:flex w-1/2 bg-[#E2E8F0] items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]" />
                <div className="relative z-10 p-14 text-white max-w-lg">
                    <h1 className="text-5xl font-bold mb-6 leading-tight">Connect across the globe.</h1>
                    <p className="text-lg opacity-95 leading-relaxed font-medium">
                        Experience real-time messaging with a modern, simple, and elegant interface.
                        Join thousands of users chatting today.
                    </p>
                </div>
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#A78BFA] opacity-20 rounded-full blur-3xl"></div>
            </div>

            {/* Right Side - Form - Figma Design */}
            <div className="flex-1 flex items-center justify-center p-10">
                <div className="w-full max-w-md space-y-10">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9] mb-2">
                            {isLogin ? "Welcome back" : "Create an account"}
                        </h2>
                        <p className="text-[15px] text-[#64748B] dark:text-[#94A3B8] font-medium">
                            {isLogin ? "Sign in to continue chatting" : "Join us to start messaging"}
                        </p>
                    </div>

                    <div className="mt-8 space-y-6">
                        {/* Email/Password Form - Top Priority */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        required
                                        className="w-full px-5 py-3 border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1F2832] text-[#0F172A] dark:text-[#F1F5F9] rounded-xl focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all duration-200 outline-none placeholder:text-[#94A3B8] font-medium shadow-sm"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] mb-2">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    className="w-full px-5 py-3 border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1F2832] text-[#0F172A] dark:text-[#F1F5F9] rounded-xl focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all duration-200 outline-none placeholder:text-[#94A3B8] font-medium shadow-sm"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] mb-2">Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-5 py-3 border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1F2832] text-[#0F172A] dark:text-[#F1F5F9] rounded-xl focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all duration-200 outline-none placeholder:text-[#94A3B8] font-medium shadow-sm"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                />
                            </div>

                            {error && (
                                <div className="p-4 rounded-xl bg-[#FEE2E2] text-[#DC2626] text-sm font-semibold border border-[#FCA5A5] shadow-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] hover:from-[#4F46E5] hover:to-[#7C3AED] text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 text-[15px]"
                            >
                                {loading ? "Processing..." : (isLogin ? "Sign In with Email" : "Create Account")}
                            </button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E2E8F0] dark:border-[#334155]"></div></div>
                            <div className="relative flex justify-center text-sm"><span className="px-4 bg-[#F8F9FA] dark:bg-[#0A0E14] text-[#64748B] dark:text-[#94A3B8] font-semibold">Or continue with</span></div>
                        </div>

                        {/* Google Button - Secondary - Figma Design */}
                        <button
                            type="button"
                            onClick={() => signIn("google", { callbackUrl: "/" })}
                            className="w-full flex items-center justify-center gap-3 px-8 py-3.5 border border-[#E2E8F0] dark:border-[#334155] rounded-xl shadow-sm bg-white dark:bg-[#1F2832] text-[14px] font-bold text-[#0F172A] dark:text-[#F1F5F9] hover:bg-[#F8F9FA] dark:hover:bg-[#1F2832] transition-all duration-200"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Sign in with Google
                        </button>

                        <div className="text-center">
                            <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] font-medium">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                                <button
                                    onClick={() => { setIsLogin(!isLogin); setError(""); }}
                                    className="ml-2 text-[#6366F1] font-bold hover:text-[#8B5CF6] transition-colors"
                                >
                                    {isLogin ? "Sign up" : "Log in"}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
