import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

const Preloader = ({ onComplete }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 800);
                    return 100;
                }
                return prev + 1; // Slower, smoother for cinematic availability
            });
        }, 15);
        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-white overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-slate-900 animate-gradient-x bg-[length:400%_400%] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 opacity-50"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] animate-pulse"></div>

            {/* Content */}
            <div className="relative z-10 text-center">
                <div className="text-6xl font-black tracking-tighter mb-6 relative inline-block animate-fade-in">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500">WARDHA</span>
                    <span className="text-amber-500 relative">
                        RIDES
                        <Zap size={24} className="absolute -top-4 -right-6 text-amber-300 animate-bounce" fill="currentColor" />
                    </span>
                </div>

                <div className="w-64 h-2 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-md border border-white/5 mx-auto relative">
                    <div
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)] transition-all duration-100 ease-out relative"
                        style={{ width: `${count}%` }}
                    >
                        <div className="absolute right-0 top-0 h-full w-2 bg-white/50 blur-[2px]"></div>
                    </div>
                </div>

                <div className="mt-4 flex justify-between w-64 mx-auto text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                    <span>Loading Fleet</span>
                    <span>{count}%</span>
                </div>
            </div>
        </div>
    );
};

export default Preloader;
