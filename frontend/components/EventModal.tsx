"use client";

import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar as CalendarIcon, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const COLORS = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#6366f1', // Indigo
    '#14b8a6', // Teal
];

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (eventData: any) => void;
    initialDate?: Date;
}

export default function EventModal({ isOpen, onClose, onSave, initialDate }: EventModalProps) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [color, setColor] = useState(COLORS[0]);

    useEffect(() => {
        if (isOpen && initialDate) {
            setDate(initialDate.toISOString().split('T')[0]);
        }
    }, [isOpen, initialDate]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            title,
            start_time: new Date(`${date}T${startTime}`),
            end_time: new Date(`${date}T${endTime}`),
            color
        });
        onClose();
        // Reset form
        setTitle('');
        setStartTime('09:00');
        setEndTime('10:00');
        setColor(COLORS[0]);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card text-card-foreground w-full max-w-md rounded-2xl shadow-2xl border border-border p-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Add New Event</h2>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Event Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Meeting with Team..."
                            className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-3 pl-11 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                            <CalendarIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        </div>
                    </div>

                    {/* Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Start Time</label>
                            <div className="relative">
                                <input
                                    type="time"
                                    required
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full px-4 py-3 pl-11 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                                <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">End Time</label>
                            <div className="relative">
                                <input
                                    type="time"
                                    required
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full px-4 py-3 pl-11 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                                <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            </div>
                        </div>
                    </div>

                    {/* Color */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Color</label>
                        <div className="flex flex-wrap gap-3">
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={cn(
                                        "w-8 h-8 rounded-full transition-all hover:scale-110 flex items-center justify-center",
                                        color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : "opacity-70 hover:opacity-100"
                                    )}
                                    style={{ backgroundColor: c }}
                                >
                                    {color === c && <Check size={14} className="text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-medium hover:bg-accent text-muted-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
                        >
                            Save Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
