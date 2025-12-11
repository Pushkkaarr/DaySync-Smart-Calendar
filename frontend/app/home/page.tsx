"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    ChevronRight,
    Menu,
    Calendar as CalendarIcon,
    Settings,
    Layout,
    Clock,
    Moon,
    Sun,
    ChevronDown,
    Plus,
    LogOut,
    User,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import EventModal from '../../components/EventModal';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- Calendar Logic Helpers ---

const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
};

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Event {
    _id: string;
    title: string;
    start_time: string;
    end_time: string;
    color: string;
    recurrencePattern?: string;
    recurrenceGroupId?: string;
}

export default function HomePage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [view, setView] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [mounted, setMounted] = useState(false);
    const [today, setToday] = useState<Date | null>(null);
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Event State
    const [events, setEvents] = useState<Event[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            const currentPath = window.location.pathname;
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
            const target = basePath ? `${basePath}/login.html` : '/login';
            window.location.href = target;
            return;
        }
        setMounted(true);
        setToday(new Date());
        fetchEvents();
    }, []);

    const fetchEvents = React.useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/events`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data: Event[] = await res.json();
                setEvents(data);
            } else if (res.status === 401) {
                // Token invalid, redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                const currentPath = window.location.pathname;
                const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
                const target = basePath ? `${basePath}/login.html` : '/login';
                window.location.href = target;
            }
        } catch (error) {
            console.error("Failed to fetch events", error);
        }
    }, []);

    const handleSaveEvent = React.useCallback(async (eventData: Partial<Event>) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const method = eventData._id ? 'PUT' : 'POST';
            const url = eventData._id
                ? `${process.env.NEXT_PUBLIC_BACKEND}/api/events/${eventData._id}`
                : `${process.env.NEXT_PUBLIC_BACKEND}/api/events`;

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(eventData),
            });
            if (res.ok) {
                fetchEvents(); // Refresh events
            } else if (res.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                const currentPath = window.location.pathname;
                const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
                const target = basePath ? `${basePath}/login.html` : '/login';
                window.location.href = target;
            }
        } catch (error) {
            console.error("Failed to save event", error);
        }
    }, [fetchEvents]);

    const handleDeleteEvent = React.useCallback(async (eventId: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                fetchEvents();
            } else if (res.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                const currentPath = window.location.pathname;
                const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
                const target = basePath ? `${basePath}/login.html` : '/login';
                window.location.href = target;
            }
        } catch (error) {
            console.error("Failed to delete event", error);
        }
    }, [fetchEvents]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // --- Navigation Handlers ---
    const handlePrev = React.useCallback(() => {
        if (view === 'monthly') {
            setCurrentDate((d: Date) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
        } else if (view === 'weekly') {
            setCurrentDate((d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7));
        } else {
            setCurrentDate((d: Date) => new Date(d.getFullYear() - 1, d.getMonth(), 1));
        }
    }, [view]);

    const handleNext = React.useCallback(() => {
        if (view === 'monthly') {
            setCurrentDate((d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
        } else if (view === 'weekly') {
            setCurrentDate((d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7));
        } else {
            setCurrentDate((d: Date) => new Date(d.getFullYear() + 1, d.getMonth(), 1));
        }
    }, [view]);

    const handleToday = React.useCallback(() => {
        setCurrentDate(new Date());
        setView('monthly');
    }, []);

    const isSameDay = (d1: Date, d2: Date | null) => {
        if (!d2) return false;
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const getEventsForDate = (date: Date) => {
        return events.filter(e => {
            const eDate = new Date(e.start_time);
            return eDate.getDate() === date.getDate() &&
                eDate.getMonth() === date.getMonth() &&
                eDate.getFullYear() === date.getFullYear();
        });
    };

    // --- Grid Generators ---

    const generateMonthlyGrid = () => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const prevMonthDays = getDaysInMonth(year, month - 1);

        const cells = [];

        // Previous month filler
        for (let i = 0; i < firstDay; i++) {
            cells.push({
                day: prevMonthDays - firstDay + 1 + i,
                type: 'prev',
                key: `prev-${i}`
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            cells.push({
                day: i,
                type: 'current',
                isToday: isSameDay(date, today),
                key: `curr-${i}`,
                date: date,
                events: getEventsForDate(date)
            });
        }

        // Next month filler
        const remainingCells = 42 - cells.length;
        for (let i = 1; i <= remainingCells; i++) {
            cells.push({
                day: i,
                type: 'next',
                key: `next-${i}`
            });
        }
        return cells;
    };

    const generateWeeklyGrid = () => {
        const curr = new Date(currentDate);
        const day = curr.getDay();
        const diff = curr.getDate() - day; // adjust when day is sunday
        const startOfWeek = new Date(curr.setDate(diff));

        const cells = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            const dateEvents = getEventsForDate(d);
            cells.push({
                day: d.getDate(),
                type: 'current',
                isToday: isSameDay(d, today),
                key: `week-${i}`,
                fullDate: new Date(d),
                events: dateEvents
            });
        }
        return cells;
    };

    if (!mounted) return null;

    return (
        <div className="flex h-screen w-full bg-background text-foreground font-['Georgia'] overflow-hidden selection:bg-primary/20">
            <EventModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedEvent(null);
                }}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
                initialDate={selectedDate}
                initialEvent={selectedEvent}
            />

            {(isMonthPickerOpen || isYearPickerOpen) && (
                <div
                    className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]"
                    onClick={() => { setIsMonthPickerOpen(false); setIsYearPickerOpen(false); }}
                />
            )}
            {/* Sidebar */}
            <aside
                className={cn(
                    "h-full bg-card/50 backdrop-blur-xl border-r border-border transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] flex flex-col relative z-20",
                    isSidebarOpen ? "w-64" : "w-20"
                )}
            >
                {/* Sidebar Header */}
                <div className="h-24 flex items-center justify-between px-6 border-b border-border/50">
                    <div className={cn("flex items-center gap-3 overflow-hidden transition-all duration-300", !isSidebarOpen && "opacity-0 w-0")}>
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                            <CalendarIcon size={18} />
                        </div>
                        <span
                            onClick={() => {
                                const currentPath = window.location.pathname;
                                const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
                                const target = basePath ? `${basePath}/index.html` : '/';
                                window.location.href = target;
                            }}
                            className="font-bold text-lg tracking-tight whitespace-nowrap hover:text-primary transition-colors cursor-pointer"
                        >
                            DaySync
                        </span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-accent rounded-full transition-colors"
                    >
                        <Menu size={20} className="text-muted-foreground" />
                    </button>
                </div>

                {/* Content Container */}
                <div className="flex-1 relative overflow-hidden">
                    {/* Navigation View */}
                    <div className={cn(
                        "absolute inset-0 flex flex-col py-6 px-3 space-y-2 transition-all duration-500 ease-in-out",
                        isSettingsOpen ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
                    )}>
                        <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider opacity-70">
                            {isSidebarOpen ? "Views" : "..."}
                        </div>

                        {[
                            { id: 'weekly', label: 'Weekly', icon: Clock },
                            { id: 'monthly', label: 'Monthly', icon: Layout },
                            { id: 'yearly', label: 'Yearly', icon: CalendarIcon },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setView(item.id as any)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                    view === item.id
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                        : "hover:bg-accent text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <item.icon size={20} className={cn("shrink-0 transition-transform duration-300", view === item.id && "scale-110")} />
                                <span className={cn(
                                    "font-medium transition-all duration-300 whitespace-nowrap",
                                    !isSidebarOpen && "opacity-0 translate-x-4 absolute"
                                )}>
                                    {item.label}
                                </span>
                                {view === item.id && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                                )}
                            </button>
                        ))}

                        {/* Add Event Button */}
                        <div className="pt-4 mt-2 border-t border-border/50">
                            <button
                                onClick={() => {
                                    setSelectedDate(new Date());
                                    setSelectedEvent(null);
                                    setIsModalOpen(true);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground",
                                    !isSidebarOpen && "justify-center"
                                )}
                            >
                                <Plus size={20} className="shrink-0" />
                                <span className={cn(
                                    "font-bold transition-all duration-300 whitespace-nowrap",
                                    !isSidebarOpen && "opacity-0 translate-x-4 absolute"
                                )}>
                                    Add Event
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Settings View */}
                    <div className={cn(
                        "absolute inset-0 flex flex-col py-6 px-3 space-y-2 transition-all duration-500 ease-in-out",
                        isSettingsOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
                    )}>
                        <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider opacity-70">
                            {isSidebarOpen ? "Settings" : "..."}
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 hover:bg-accent text-muted-foreground hover:text-foreground group",
                                !isSidebarOpen && "justify-center"
                            )}
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            <span className={cn(
                                "font-medium transition-all duration-300 whitespace-nowrap",
                                !isSidebarOpen && "opacity-0 translate-x-4 absolute"
                            )}>
                                {theme === 'light' ? "Dark Mode" : "Light Mode"}
                            </span>
                        </button>

                        {/* Edit Profile Button */}
                        <button
                            onClick={() => {
                                const currentPath = window.location.pathname;
                                const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
                                const target = basePath ? `${basePath}/profile.html` : '/profile';
                                window.location.href = target;
                            }}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 hover:bg-accent text-muted-foreground hover:text-foreground group",
                                !isSidebarOpen && "justify-center"
                            )}
                        >
                            <User size={20} />
                            <span className={cn(
                                "font-medium transition-all duration-300 whitespace-nowrap",
                                !isSidebarOpen && "opacity-0 translate-x-4 absolute"
                            )}>
                                Edit Profile
                            </span>
                        </button>

                        {/* Logout Button */}
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('user');
                                const currentPath = window.location.pathname;
                                const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
                                const target = basePath ? `${basePath}/index.html` : '/';
                                window.location.href = target;
                            }}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 hover:bg-red-500/10 text-red-500 hover:text-red-600 group",
                                !isSidebarOpen && "justify-center"
                            )}
                        >
                            <LogOut size={20} />
                            <span className={cn(
                                "font-medium transition-all duration-300 whitespace-nowrap",
                                !isSidebarOpen && "opacity-0 translate-x-4 absolute"
                            )}>
                                Logout
                            </span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border/50 bg-card/30 backdrop-blur-sm z-10">
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-accent text-muted-foreground transition-all duration-300",
                            !isSidebarOpen && "justify-center",
                            isSettingsOpen && "bg-accent text-foreground"
                        )}
                    >
                        {isSettingsOpen ? <ChevronDown size={20} /> : <Settings size={20} />}
                        {isSidebarOpen && <span>{isSettingsOpen ? "Back" : "Settings"}</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-gradient-to-br from-background via-background to-accent/20">
                {/* Header Bar */}
                <header className="h-32 px-8 flex items-center justify-between z-50 border-b border-border/40 bg-background/50 backdrop-blur-sm">
                    {/* Left: Today's Date (Bold & Title Level) */}
                    <div className="flex flex-col justify-center">
                        <h1 className="text-5xl font-bold text-foreground tracking-tight drop-shadow-sm">
                            {today ? today.toLocaleDateString('en-US', { weekday: 'long' }) : '...'}
                        </h1>
                        <p className="text-2xl text-muted-foreground font-medium mt-1">
                            {today ? today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '...'}
                        </p>
                    </div>

                    {/* Right: Month Name & Controls */}
                    <div className="flex flex-col items-end gap-3">
                        <div className="text-right flex items-baseline gap-2 relative z-50">
                            {/* Month Picker */}
                            <div className="relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsMonthPickerOpen(!isMonthPickerOpen); setIsYearPickerOpen(false); }}
                                    className="text-3xl font-bold text-primary/80 hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
                                >
                                    {MONTH_NAMES[month]}
                                </button>
                                {isMonthPickerOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-48 max-h-80 overflow-y-auto bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                                        {MONTH_NAMES.map((m, idx) => (
                                            <div
                                                key={m}
                                                onClick={() => {
                                                    setCurrentDate(new Date(year, idx, 1));
                                                    setIsMonthPickerOpen(false);
                                                }}
                                                className={cn(
                                                    "px-4 py-3 cursor-pointer hover:bg-primary/10 transition-colors text-sm font-medium border-b border-border/50 last:border-0",
                                                    idx === month ? "text-primary bg-primary/5 font-bold" : "text-foreground"
                                                )}
                                            >
                                                {m}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Year Picker */}
                            <div className="relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsYearPickerOpen(!isYearPickerOpen); setIsMonthPickerOpen(false); }}
                                    className="text-3xl font-light text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                                >
                                    {year}
                                </button>
                                {isYearPickerOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-32 max-h-80 overflow-y-auto bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                                        {Array.from({ length: 200 }, (_, i) => 1900 + i).map((y) => (
                                            <div
                                                key={y}
                                                onClick={() => {
                                                    setCurrentDate(new Date(y, month, 1));
                                                    setIsYearPickerOpen(false);
                                                }}
                                                ref={y === year ? (el) => { el?.scrollIntoView({ block: 'center' }) } : null}
                                                className={cn(
                                                    "px-4 py-3 cursor-pointer hover:bg-primary/10 transition-colors text-sm font-medium text-center border-b border-border/50 last:border-0",
                                                    y === year ? "text-primary bg-primary/5 font-bold" : "text-foreground"
                                                )}
                                            >
                                                {y}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-card border border-border rounded-full p-1 shadow-sm">
                                <button onClick={handlePrev} className="p-2 hover:bg-accent rounded-full transition-colors">
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={handleToday}
                                    className="px-4 py-1 text-sm font-semibold hover:bg-accent rounded-full transition-colors"
                                >
                                    Today
                                </button>
                                <button onClick={handleNext} className="p-2 hover:bg-accent rounded-full transition-colors">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 p-8 pt-6 overflow-y-auto overflow-x-hidden flex flex-col">

                    {/* View: Monthly */}
                    {view === 'monthly' && (
                        <>
                            <div className="grid grid-cols-7 mb-4">
                                {DAYS_OF_WEEK.map(day => (
                                    <div key={day} className="text-center text-sm font-bold text-muted-foreground uppercase tracking-wider py-2 bg-primary/20 rounded-lg">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-3 min-h-[800px]">
                                {generateMonthlyGrid().map((cell) => (
                                    <div
                                        key={cell.key}
                                        onClick={() => {
                                            if (cell.type === 'current' && cell.date) {
                                                setSelectedDate(cell.date);
                                                setSelectedEvent(null);
                                                setIsModalOpen(true);
                                            }
                                        }}
                                        className={cn(
                                            "relative p-3 rounded-xl border-2 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer group",
                                            cell.type === 'current'
                                                ? "bg-card border-border hover:border-primary/50 hover:shadow-lg"
                                                : "bg-muted/20 border-transparent text-muted-foreground/30",
                                            cell.isToday && "ring-2 ring-[#f97316] border-[#f97316] bg-[#fff7ed]"
                                        )}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className={cn(
                                                "text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full",
                                                cell.isToday
                                                    ? "bg-[#f97316] text-white shadow-md shadow-orange-200"
                                                    : "text-foreground/70"
                                            )}>
                                                {cell.day}
                                            </span>
                                        </div>

                                        {/* Events List */}
                                        <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[80px] scrollbar-hide">
                                            {cell.events?.map((event) => (
                                                <div
                                                    key={event._id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedEvent(event);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium text-white shadow-sm hover:opacity-80 transition-opacity"
                                                    style={{ backgroundColor: event.color }}
                                                >
                                                    {event.title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* View: Weekly */}
                    {view === 'weekly' && (
                        <div className="flex-1 flex flex-col">
                            <div className="grid grid-cols-7 mb-4">
                                {DAYS_OF_WEEK.map(day => (
                                    <div key={day} className="text-center text-sm font-bold text-muted-foreground uppercase tracking-wider py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-3 h-full min-h-[600px]">
                                {generateWeeklyGrid().map((cell) => (
                                    <div
                                        key={cell.key}
                                        onClick={() => {
                                            if (cell.fullDate) {
                                                setSelectedDate(cell.fullDate);
                                                setSelectedEvent(null);
                                                setIsModalOpen(true);
                                            }
                                        }}
                                        className={cn(
                                            "relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col h-full cursor-pointer group",
                                            "bg-card border-border hover:border-primary/50 hover:shadow-lg",
                                            cell.isToday && "ring-2 ring-[#f97316] border-[#f97316] bg-[#fff7ed]"
                                        )}
                                    >
                                        <div className="flex flex-col items-center border-b border-border/50 pb-4 mb-4">
                                            <span className="text-sm font-medium text-muted-foreground uppercase">{cell.fullDate?.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                            <span className={cn(
                                                "text-3xl font-bold mt-2 w-12 h-12 flex items-center justify-center rounded-full",
                                                cell.isToday ? "bg-[#f97316] text-white shadow-lg shadow-orange-200" : "text-foreground"
                                            )}>
                                                {cell.day}
                                            </span>
                                        </div>

                                        {/* Events List */}
                                        <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
                                            {cell.events && cell.events.length > 0 ? (
                                                cell.events.map((event) => (
                                                    <div
                                                        key={event._id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedEvent(event);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="p-2 rounded-lg text-xs font-medium text-white shadow-sm flex flex-col gap-0.5 hover:opacity-80 transition-opacity"
                                                        style={{ backgroundColor: event.color }}
                                                    >
                                                        <span className="truncate font-bold">{event.title}</span>
                                                        <span className="opacity-90 text-[10px]">
                                                            {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex-1 border-l-2 border-dashed border-border/50 ml-6 pl-4 flex items-center">
                                                    <div className="text-xs text-muted-foreground italic">No events</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* View: Yearly */}
                    {view === 'yearly' && (
                        <div className="grid grid-cols-4 gap-6 h-full overflow-y-auto pb-10">
                            {MONTH_NAMES.map((mName, idx) => (
                                <div
                                    key={mName}
                                    onClick={() => {
                                        setCurrentDate(new Date(year, idx, 1));
                                        setView('monthly');
                                    }}
                                    className={cn(
                                        "p-6 rounded-2xl border-2 border-border bg-card hover:border-primary hover:shadow-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group",
                                        idx === new Date().getMonth() && year === new Date().getFullYear() && "border-[#f97316]/50 bg-[#fff7ed]"
                                    )}
                                >
                                    <h3 className={cn(
                                        "text-2xl font-bold group-hover:text-primary transition-colors",
                                        idx === new Date().getMonth() && year === new Date().getFullYear() ? "text-[#f97316]" : "text-foreground"
                                    )}>
                                        {mName}
                                    </h3>
                                    <div className="text-4xl font-light text-muted-foreground/20 group-hover:text-primary/20 transition-colors">
                                        {idx + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                {/* Floating Today Button */}
                <button
                    onClick={handleToday}
                    className="absolute bottom-8 right-8 bg-primary text-primary-foreground p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-50 group flex items-center justify-center"
                    title="Go to Today"
                >
                    <CalendarIcon size={24} />
                    <span className="absolute right-full mr-4 bg-foreground text-background px-3 py-1.5 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                        Go to Today
                    </span>
                </button>
            </main>
        </div>
    );
}
