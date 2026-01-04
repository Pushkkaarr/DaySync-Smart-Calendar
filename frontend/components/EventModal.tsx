"use client";

import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar as CalendarIcon, Check, Trash2, Repeat } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ClockPicker from './ClockPicker';

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
    onDelete?: (eventId: string, deleteType?: 'single' | 'series') => void;
    initialDate?: Date;
    initialEvent?: any;
}

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function EventModal({ isOpen, onClose, onSave, onDelete, initialDate, initialEvent }: EventModalProps) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [recurrence, setRecurrence] = useState('none');
    const [color, setColor] = useState(COLORS[0]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Clock Picker State
    const [clockPickerType, setClockPickerType] = useState<'start' | 'end' | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialEvent) {
                setTitle(initialEvent.title);
                const startDate = new Date(initialEvent.start_time);
                const endDate = new Date(initialEvent.end_time);
                setDate(formatDate(startDate));
                setStartTime(startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
                setEndTime(endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
                setColor(initialEvent.color);
            } else if (initialDate) {
                setDate(formatDate(initialDate));
                setTitle('');
                setStartTime('09:00');
                setEndTime('10:00');
                setRecurrence('none');
                setColor(COLORS[0]);
            }
        }
    }, [isOpen, initialDate, initialEvent]);

    const handleClockSave = (time: string) => {
        if (clockPickerType === 'start') {
            setStartTime(time);
            if (endTime < time) {
                setEndTime(time);
            }
        } else if (clockPickerType === 'end') {
            setEndTime(time);
        }
        setClockPickerType(null);
    };

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Properly format dates to ISO strings with correct timezone handling
        const startDateTime = new Date(`${date}T${startTime}:00`);
        const endDateTime = new Date(`${date}T${endTime}:00`);
        
        
        onSave({
            _id: initialEvent?._id,
            title,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            recurrencePattern: recurrence,
            color
        });
        onClose();
    };

    const handleDelete = (type: 'single' | 'series' = 'single') => {
        if (initialEvent && onDelete) {
            onDelete(initialEvent._id, type);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card text-card-foreground w-full max-w-md rounded-2xl shadow-2xl border border-border p-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">{initialEvent ? 'Edit Event' : 'Add New Event'}</h2>
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
                            <button
                                type="button"
                                onClick={() => setClockPickerType('start')}
                                className="flex items-center w-full px-4 py-3 rounded-xl bg-muted/50 border border-border hover:border-primary/50 transition-all text-left"
                            >
                                <Clock size={18} className="mr-2 text-muted-foreground" />
                                <span>{startTime}</span>
                            </button>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">End Time</label>
                            <button
                                type="button"
                                onClick={() => setClockPickerType('end')}
                                className="flex items-center w-full px-4 py-3 rounded-xl bg-muted/50 border border-border hover:border-primary/50 transition-all text-left"
                            >
                                <Clock size={18} className="mr-2 text-muted-foreground" />
                                <span>{endTime}</span>
                            </button>
                        </div>
                    </div>

                    {/* Recurrence */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Repeat size={14} /> Repeat
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['none', 'daily', 'weekly', 'monthly', 'yearly'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setRecurrence(type)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                                        recurrence === type
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background border-border hover:bg-accent text-muted-foreground"
                                    )}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                        {recurrence !== 'none' && date && (
                            <p className="text-xs text-muted-foreground mt-2 font-medium bg-muted/50 px-3 py-2 rounded-lg border border-border/50">
                                {(() => {
                                    const d = new Date(date + 'T00:00:00'); // Force local time
                                    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
                                    const dayNum = d.getDate();
                                    const monthName = d.toLocaleDateString('en-US', { month: 'long' });

                                    if (recurrence === 'daily') return 'Event will repeat every day';
                                    if (recurrence === 'weekly') return `Event will repeat every ${dayName}`;
                                    if (recurrence === 'monthly') return `Event will repeat monthly on the ${dayNum}th`;
                                    if (recurrence === 'yearly') return `Event will repeat annually on ${monthName} ${dayNum}`;
                                    return '';
                                })()}
                            </p>
                        )}
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
                    <div className="flex items-center justify-between pt-4">
                        {initialEvent ? (
                            <div className="relative">
                                {showDeleteConfirm ? (
                                    <div className="absolute bottom-full left-0 mb-2 p-2 bg-card border border-border rounded-xl shadow-xl z-50 flex flex-col gap-2 min-w-[200px] animate-in slide-in-from-bottom-2">
                                        <p className="text-xs font-semibold text-muted-foreground px-2">Delete Event?</p>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete('single')}
                                            className="text-left px-3 py-2 text-sm hover:bg-accent rounded-lg transition-colors text-destructive"
                                        >
                                            Delete Only This Event
                                        </button>
                                        {initialEvent.recurrenceGroupId && (
                                            <button
                                                type="button"
                                                onClick={() => handleDelete('series')}
                                                className="text-left px-3 py-2 text-sm hover:bg-accent rounded-lg transition-colors text-destructive font-medium"
                                            >
                                                Delete Entire Series
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="text-left px-3 py-2 text-sm hover:bg-accent rounded-lg transition-colors text-muted-foreground border-t border-border/50 mt-1"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="px-4 py-2.5 rounded-xl font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 size={18} />
                                        Delete
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div></div>
                        )}
                        <div className="flex items-center gap-3">
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
                                {initialEvent ? 'Update Event' : 'Save Event'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Clock Picker Modal */}
                {clockPickerType && (
                    <ClockPicker
                        isOpen={!!clockPickerType}
                        onClose={() => setClockPickerType(null)}
                        onSave={handleClockSave}
                        initialTime={clockPickerType === 'start' ? startTime : endTime}
                    />
                )}
            </div>
        </div>
    );
}
