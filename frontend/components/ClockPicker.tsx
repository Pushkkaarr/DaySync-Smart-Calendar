"use client";

import React, { useState, useEffect } from 'react';
import './ClockPicker.css';

interface ClockPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (time: string) => void;
    initialTime: string; // Format "HH:mm" (24h)
}

export default function ClockPicker({ isOpen, onClose, onSave, initialTime }: ClockPickerProps) {
    const [view, setView] = useState<'hours' | 'minutes'>('hours');
    const [hour, setHour] = useState(12);
    const [minute, setMinute] = useState(0);
    const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');

    useEffect(() => {
        if (isOpen && initialTime) {
            const [h, m] = initialTime.split(':').map(Number);
            let finalHour = h;
            let finalAmpm: 'AM' | 'PM' = 'AM';

            if (h >= 12) {
                finalAmpm = 'PM';
                if (h > 12) finalHour = h - 12;
            } else if (h === 0) {
                finalHour = 12;
            }

            setHour(finalHour);
            setMinute(m);
            setAmpm(finalAmpm);
            setView('hours');
        }
    }, [isOpen, initialTime]);

    if (!isOpen) return null;

    const handleNumberClick = (num: number) => {
        if (view === 'hours') {
            setHour(num);
            setTimeout(() => setView('minutes'), 300); // Auto switch to minutes
        } else {
            // Minutes: num is 1-12, map to 0-55
            const m = num === 12 ? 0 : num * 5;
            setMinute(m);
        }
    };

    const handleSave = () => {
        let finalH = hour;
        if (ampm === 'PM' && hour !== 12) finalH += 12;
        if (ampm === 'AM' && hour === 12) finalH = 0;

        const timeString = `${String(finalH).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        onSave(timeString);
        onClose();
    };

    // Calculate rotation
    const hourRotation = (hour % 12) * 30; // 30 deg per hour
    const minuteRotation = minute * 6; // 6 deg per minute

    return (
        <div className="clock-overlay" onClick={onClose}>
            <div className="clock-card" onClick={(e) => e.stopPropagation()}>
                {/* Time Display */}
                <div className="time-display">
                    <div
                        className={`time-part ${view === 'hours' ? 'active' : ''}`}
                        onClick={() => setView('hours')}
                    >
                        {String(hour).padStart(2, '0')}
                    </div>
                    <span>:</span>
                    <div
                        className={`time-part ${view === 'minutes' ? 'active' : ''}`}
                        onClick={() => setView('minutes')}
                    >
                        {String(minute).padStart(2, '0')}
                    </div>

                    <div className="ampm-toggle">
                        <div
                            className={`ampm-btn ${ampm === 'AM' ? 'active' : ''}`}
                            onClick={() => setAmpm('AM')}
                        >AM</div>
                        <div
                            className={`ampm-btn ${ampm === 'PM' ? 'active' : ''}`}
                            onClick={() => setAmpm('PM')}
                        >PM</div>
                    </div>
                </div>

                {/* Clock Face */}
                <div className="clock-container">
                    <div className="clock-face">
                        {/* Markers */}
                        {[...Array(12)].map((_, i) => (
                            <div key={`m-${i}`} className={`marker marker-${i + 1}`}>
                                <div className="marker-dot"></div>
                            </div>
                        ))}

                        {/* Numbers */}
                        <div className="number-container">
                            {[...Array(12)].map((_, i) => {
                                const num = i + 1;
                                // Basic trigonometry for positioning numbers in a circle
                                // Radius ~ 110px? 
                                const angle = (num * 30 - 90) * (Math.PI / 180);
                                const radius = 110;
                                const x = 50 + (radius / 300 * 100) * Math.cos(angle);
                                const y = 50 + (radius / 300 * 100) * Math.sin(angle);

                                const displayNum = view === 'hours' ? num : (num === 12 ? '00' : num * 5);
                                const isSelected = view === 'hours' ? hour === num : (num === 12 ? minute === 0 : minute === num * 5);

                                return (
                                    <div
                                        key={`n-${num}`}
                                        className={`number ${isSelected ? 'selected' : ''}`}
                                        style={{
                                            left: `${x}%`,
                                            top: `${y}%`
                                        }}
                                        onClick={() => handleNumberClick(num)}
                                    >
                                        {displayNum}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Hands */}
                        {view === 'hours' && (
                            <div
                                className="hand hour-hand"
                                style={{ transform: `translateX(-50%) rotate(${hourRotation}deg)` }}
                            ></div>
                        )}
                        {view === 'minutes' && (
                            <div
                                className="hand minute-hand"
                                style={{ transform: `translateX(-50%) rotate(${minuteRotation}deg)` }}
                            ></div>
                        )}
                        <div className="center-pin"></div>
                    </div>
                </div>

                {/* Actions */}
                <div className="clock-actions">
                    <button className="clock-btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="clock-btn-ok" onClick={handleSave}>OK</button>
                </div>
            </div>
        </div>
    );
}
