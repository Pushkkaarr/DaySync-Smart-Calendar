"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeClosed, ArrowRight, User } from 'lucide-react';
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-lg shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                className
            )}
            {...props}
        />
    )
}

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    // For 3D card effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
    const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
                // Use window.location for reliable navigation in Electron
                const currentPath = window.location.pathname;
                const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
                const target = basePath ? `${basePath}/home.html` : '/home';
                window.location.href = target;
            } else {
                setError(data.message || 'Signup failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center">
            {/* Background gradient effect - Blueish tone */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/40 via-blue-700/50 to-black" />

            {/* Subtle noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px'
                }}
            />

            {/* Top radial glow */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-blue-400/20 blur-[80px]" />
            <motion.div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-blue-300/20 blur-[60px]"
                animate={{
                    opacity: [0.15, 0.3, 0.15],
                    scale: [0.98, 1.02, 0.98]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "mirror"
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-xl relative z-10"
                style={{ perspective: 1500 }}
            >
                <motion.div
                    className="relative"
                    style={{ rotateX, rotateY }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    whileHover={{ z: 10 }}
                >
                    <div className="relative group">
                        {/* Glass card background */}
                        <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-10 border border-white/[0.05] shadow-2xl overflow-hidden">

                            {/* Back Button */}
                            <Link href="/" className="absolute top-6 left-6 text-white/60 hover:text-white transition-colors text-base">
                                ← Back
                            </Link>

                            {/* Logo and header */}
                            <div className="text-center space-y-2 mb-8 mt-10">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", duration: 0.8 }}
                                    className="mx-auto w-16 h-16 rounded-full border border-white/10 flex items-center justify-center relative overflow-hidden"
                                >
                                    <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">D</span>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80"
                                >
                                    Create Account
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-white/60 text-base"
                                >
                                    Join DaySync today
                                </motion.p>
                            </div>

                            {/* Signup form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded">
                                        {error}
                                    </div>
                                )}
                                <motion.div className="space-y-5">

                                    {/* Name Inputs */}
                                    <div className="flex gap-2">
                                        <motion.div
                                            className={`relative flex-1 ${focusedInput === "first_name" ? 'z-10' : ''}`}
                                            whileFocus={{ scale: 1.02 }}
                                            whileHover={{ scale: 1.01 }}
                                        >
                                            <div className="relative flex items-center overflow-hidden rounded-lg">
                                                <User className={`absolute left-4 w-5 h-5 transition-all duration-300 ${focusedInput === "first_name" ? 'text-white' : 'text-white/40'
                                                    }`} />
                                                <Input
                                                    name="first_name"
                                                    type="text"
                                                    placeholder="First Name"
                                                    value={formData.first_name}
                                                    onChange={handleChange}
                                                    onFocus={() => setFocusedInput("first_name")}
                                                    onBlur={() => setFocusedInput(null)}
                                                    className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 placeholder:text-lg h-14 text-base transition-all duration-300 pl-12 pr-4 focus:bg-white/10"
                                                    required
                                                />
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            className={`relative flex-1 ${focusedInput === "last_name" ? 'z-10' : ''}`}
                                            whileFocus={{ scale: 1.02 }}
                                            whileHover={{ scale: 1.01 }}
                                        >
                                            <div className="relative flex items-center overflow-hidden rounded-lg">
                                                <User className={`absolute left-4 w-5 h-5 transition-all duration-300 ${focusedInput === "last_name" ? 'text-white' : 'text-white/40'
                                                    }`} />
                                                <Input
                                                    name="last_name"
                                                    type="text"
                                                    placeholder="Last Name"
                                                    value={formData.last_name}
                                                    onChange={handleChange}
                                                    onFocus={() => setFocusedInput("last_name")}
                                                    onBlur={() => setFocusedInput(null)}
                                                    className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 placeholder:text-lg h-14 text-base transition-all duration-300 pl-12 pr-4 focus:bg-white/10"
                                                    required
                                                />
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Email input */}
                                    <motion.div
                                        className={`relative ${focusedInput === "email" ? 'z-10' : ''}`}
                                        whileFocus={{ scale: 1.02 }}
                                        whileHover={{ scale: 1.01 }}
                                    >
                                        <div className="relative flex items-center overflow-hidden rounded-lg">
                                            <Mail className={`absolute left-4 w-5 h-5 transition-all duration-300 ${focusedInput === "email" ? 'text-white' : 'text-white/40'
                                                }`} />

                                            <Input
                                                name="email"
                                                type="email"
                                                placeholder="Email address"
                                                value={formData.email}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedInput("email")}
                                                onBlur={() => setFocusedInput(null)}
                                                className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 placeholder:text-lg h-14 text-base transition-all duration-300 pl-12 pr-4 focus:bg-white/10"
                                                required
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Password input */}
                                    <motion.div
                                        className={`relative ${focusedInput === "password" ? 'z-10' : ''}`}
                                        whileFocus={{ scale: 1.02 }}
                                        whileHover={{ scale: 1.01 }}
                                    >
                                        <div className="relative flex items-center overflow-hidden rounded-lg">
                                            <Lock className={`absolute left-4 w-5 h-5 transition-all duration-300 ${focusedInput === "password" ? 'text-white' : 'text-white/40'
                                                }`} />

                                            <Input
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedInput("password")}
                                                onBlur={() => setFocusedInput(null)}
                                                className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 placeholder:text-lg h-14 text-base transition-all duration-300 pl-12 pr-12 focus:bg-white/10"
                                                required
                                            />

                                            <div
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 cursor-pointer"
                                            >
                                                {showPassword ? (
                                                    <Eye className="w-5 h-5 text-white/40 hover:text-white transition-colors duration-300" />
                                                ) : (
                                                    <EyeClosed className="w-5 h-5 text-white/40 hover:text-white transition-colors duration-300" />
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Confirm Password input */}
                                    <motion.div
                                        className={`relative ${focusedInput === "confirmPassword" ? 'z-10' : ''}`}
                                        whileFocus={{ scale: 1.02 }}
                                        whileHover={{ scale: 1.01 }}
                                    >
                                        <div className="relative flex items-center overflow-hidden rounded-lg">
                                            <Lock className={`absolute left-4 w-5 h-5 transition-all duration-300 ${focusedInput === "confirmPassword" ? 'text-white' : 'text-white/40'
                                                }`} />

                                            <Input
                                                name="confirmPassword"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Confirm Password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedInput("confirmPassword")}
                                                onBlur={() => setFocusedInput(null)}
                                                className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 placeholder:text-lg h-14 text-base transition-all duration-300 pl-12 pr-12 focus:bg-white/10"
                                                required
                                            />
                                        </div>
                                    </motion.div>
                                </motion.div>

                                {/* Sign up button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full relative group/button mt-5"
                                >
                                    <div className="relative overflow-hidden bg-white text-black font-medium h-14 rounded-lg transition-all duration-300 flex items-center justify-center">
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-black/70 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <span className="flex items-center justify-center gap-2 text-base font-medium">
                                                Create Account
                                                <ArrowRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform duration-300" />
                                            </span>
                                        )}
                                    </div>
                                </motion.button>

                                {/* Login link */}
                                <motion.p
                                    className="text-center text-base text-white/60 mt-6"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    Already have an account?{' '}
                                    <Link
                                        href="/login"
                                        className="relative inline-block group/signup"
                                    >
                                        <span className="relative z-10 text-white group-hover/signup:text-white/70 transition-colors duration-300 font-medium">
                                            Sign in
                                        </span>
                                    </Link>
                                </motion.p>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}


