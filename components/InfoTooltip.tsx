import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, Check, X } from 'lucide-react';

interface InfoTooltipProps {
    what: string;
    good: string;
    bad: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ what, good, bad }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);

    const handleMouseEnter = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // Position tooltip below the icon, aligned to the right
            setCoords({
                top: rect.bottom + 8 + window.scrollY, // Add scrollY for absolute positioning relative to doc
                left: rect.right - 288 + window.scrollX // 288px is w-72 (width of tooltip)
            });
            setIsVisible(true);
        }
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    return (
        <>
            <button
                ref={triggerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="text-slate-500 hover:text-blue-400 transition-colors p-1 relative z-10"
            >
                <Info className="w-4 h-4" />
            </button>

            {isVisible && createPortal(
                <div
                    style={{ top: coords.top, left: coords.left }}
                    className="absolute w-72 bg-slate-900 border border-slate-700 shadow-xl rounded-xl p-4 z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
                >
                    <div className="space-y-3">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">What is this?</span>
                            <p className="text-sm text-slate-200 leading-snug">{what}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Good
                                </span>
                                <p className="text-xs text-slate-400 mt-0.5 leading-snug">{good}</p>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider flex items-center gap-1">
                                    <X className="w-3 h-3" /> Bad
                                </span>
                                <p className="text-xs text-slate-400 mt-0.5 leading-snug">{bad}</p>
                            </div>
                        </div>
                    </div>

                    {/* Arrow (visual only, simplified for portal) */}
                    <div className="absolute top-[-5px] right-2 w-3 h-3 bg-slate-900 border-l border-t border-slate-700 transform rotate-45"></div>
                </div>,
                document.body
            )}
        </>
    );
};
