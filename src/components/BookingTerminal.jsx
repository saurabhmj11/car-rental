import React, { useState, useEffect } from 'react';
import { Terminal, CheckCircle, Smartphone, X, ShieldCheck, Cpu } from 'lucide-react';

const BookingTerminal = ({ details, onConfirm, onClose }) => {
    const [step, setStep] = useState(0); // 0: Init, 1: Connecting, 2: Analyzing, 3: Ticket, 4: Confirmed
    const [logs, setLogs] = useState([]);

    const addLog = (msg) => setLogs(prev => [...prev.slice(-4), msg]);

    useEffect(() => {
        // Sequence
        const sequence = [
            { t: 500, msg: '> Initializing Secure Connection...' },
            { t: 1200, msg: '> Verifying Fleet Availability... [OK]' },
            { t: 2000, msg: `> Optimizing Route: ${details.pickup} -> ${details.destination}...` },
            { t: 2800, msg: '> Calculating Final Surge Adjustments... [DONE]' },
            { t: 3500, msg: '> Generating Digital Boarding Pass...' },
            { t: 4000, action: 'SHOW_TICKET' }
        ];

        let timeouts = [];
        sequence.forEach(({ t, msg, action }) => {
            const id = setTimeout(() => {
                if (msg) addLog(msg);
                if (action === 'SHOW_TICKET') setStep(3);
            }, t);
            timeouts.push(id);
        });

        return () => timeouts.forEach(clearTimeout);
    }, []);

    return (
        <div className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">

            <div className="w-full max-w-md bg-black border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">

                {/* Header */}
                <div className="bg-slate-900/50 p-4 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold animate-pulse">
                        <Terminal size={14} />
                        <span>SYSTEM_TERMINAL_V2.0</span>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
                </div>

                {/* Body */}
                <div className="p-6 min-h-[400px] flex flex-col relative font-mono text-sm">

                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(17,24,39,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,39,0.5)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-20"></div>

                    {step < 3 && (
                        <div className="flex-1 space-y-3 pt-10">
                            {logs.map((log, i) => (
                                <div key={i} className="text-green-500 font-bold animate-fade-in border-l-2 border-green-500 pl-3">
                                    {log}
                                </div>
                            ))}
                            <div className="animate-pulse text-green-500">_</div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="flex-1 animate-fade-in flex flex-col items-center pt-4">
                            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full relative mb-6">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest text-center shadow-lg shadow-amber-500/20">
                                    Digital Pass Generated
                                </div>

                                {/* Details */}
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b border-slate-800 pb-2">
                                        <span className="text-slate-500 text-xs">TRIP ID</span>
                                        <span className="text-white font-bold">WR-{Math.floor(Math.random() * 10000)}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-800 pb-2">
                                        <span className="text-slate-500 text-xs">VEHICLE</span>
                                        <span className="text-amber-400 font-bold">ALTROZ DARK</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-800 pb-2">
                                        <span className="text-slate-500 text-xs">ESTIMATE</span>
                                        <span className="text-green-400 font-bold text-lg">₹{details.price}</span>
                                    </div>
                                </div>

                                {/* QR Stub */}
                                <div className="mt-6 flex justify-center">
                                    <div className="bg-white p-2 rounded-lg">
                                        <div className="w-24 h-24 bg-slate-900 pattern-isometric opacity-80"></div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onConfirm}
                                className="w-full bg-green-500 hover:bg-green-400 text-slate-900 font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all active:scale-95"
                            >
                                <Smartphone size={20} />
                                <span>OPEN SECURE FORM</span>
                            </button>

                            <p className="text-center text-[10px] text-slate-600 mt-4 max-w-xs">
                                <ShieldCheck size={10} className="inline mr-1" />
                                Secure End-to-End Encryption
                            </p>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
};

export default BookingTerminal;
