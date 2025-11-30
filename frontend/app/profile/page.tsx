"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowLeft, Save } from 'lucide-react';
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

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'name' | 'email' | 'password'>('name');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Name form
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    // Email form
    const [email, setEmail] = useState('');

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsed = JSON.parse(userData);
            setUser(parsed);
            setFirstName(parsed.first_name || '');
            setLastName(parsed.last_name || '');
            setEmail(parsed.email || '');
        }
    }, []);

    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/auth/update-name`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ first_name: firstName, last_name: lastName }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || 'Name updated successfully!');
                // Update localStorage
                const updatedUser = { ...user, first_name: data.first_name, last_name: data.last_name };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            } else {
                setError(data.message || 'Failed to update name');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/auth/update-email`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || 'Email updated successfully!');
                // Update localStorage
                const updatedUser = { ...user, email: data.email };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            } else {
                setError(data.message || 'Failed to update email');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/auth/update-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || 'Password updated successfully!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setError(data.message || 'Failed to update password');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <span
                        onClick={() => {
                            const currentPath = window.location.pathname;
                            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
                            const target = basePath ? `${basePath}/home.html` : '/home';
                            window.location.href = target;
                        }}
                        className="p-2 hover:bg-accent rounded-full transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={24} />
                    </span>
                    <div>
                        <h1 className="text-3xl font-bold">Edit Profile</h1>
                        <p className="text-muted-foreground">Update your account information</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-card p-1 rounded-lg border border-border">
                    <button
                        onClick={() => { setActiveTab('name'); setError(''); setMessage(''); }}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all",
                            activeTab === 'name' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                        )}
                    >
                        <User size={18} />
                        <span className="font-medium">Name</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('email'); setError(''); setMessage(''); }}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all",
                            activeTab === 'email' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                        )}
                    >
                        <Mail size={18} />
                        <span className="font-medium">Email</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('password'); setError(''); setMessage(''); }}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all",
                            activeTab === 'password' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                        )}
                    >
                        <Lock size={18} />
                        <span className="font-medium">Password</span>
                    </button>
                </div>

                {/* Messages */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600"
                    >
                        {message}
                    </motion.div>
                )}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Forms */}
                <div className="bg-card p-6 rounded-xl border border-border">
                    {activeTab === 'name' && (
                        <form onSubmit={handleUpdateName} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">First Name</label>
                                <Input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full h-12"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Last Name</label>
                                <Input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full h-12"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary text-primary-foreground h-12 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                {isLoading ? 'Updating...' : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {activeTab === 'email' && (
                        <form onSubmit={handleUpdateEmail} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Email Address</label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-12"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary text-primary-foreground h-12 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                {isLoading ? 'Updating...' : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {activeTab === 'password' && (
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Current Password</label>
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full h-12"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">New Password</label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full h-12"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full h-12"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary text-primary-foreground h-12 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                {isLoading ? 'Updating...' : (
                                    <>
                                        <Save size={18} />
                                        Update Password
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
