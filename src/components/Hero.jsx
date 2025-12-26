import React from 'react';
import { Camera, Zap } from 'lucide-react';

const Hero = ({ surgeActive, onViewGallery }) => {
    return (
        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-500/20 aspect-[4/3] lg:aspect-[16/9] group transition-all duration-500 hover:scale-[1.01]">
            <div className="absolute inset-0 bg-slate-900 animate-gradient-x bg-[length:400%_400%] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900"></div>

            {/* Decorative Aurora */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

            {surgeActive && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full z-20 flex items-center gap-1 shadow-lg shadow-amber-500/20 border border-white/20">
                    <Zap size={10} fill="currentColor" /> High Demand Active
                </div>
            )}

            <div className="relative h-full flex flex-col justify-end p-8 z-10">
                <div className="mb-auto pt-6 flex justify-center gap-2 opacity-80">
                    <span className="px-2 py-0.5 border border-white/20 rounded-full text-[10px] font-bold text-white bg-white/5 backdrop-blur-sm">PREMIUM</span>
                    <span className="px-2 py-0.5 border border-white/20 rounded-full text-[10px] font-bold text-white bg-white/5 backdrop-blur-sm">CAMPUS</span>
                </div>

                <div className="text-center">
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight drop-shadow-lg">Tata Altroz</h1>
                    <p className="text-white/60 text-sm font-medium mb-6">Dark Edition • Sunroof • 5-Star</p>
                    <button
                        onClick={onViewGallery}
                        className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-3 px-8 rounded-2xl backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 mx-auto group-hover:bg-white group-hover:text-slate-900"
                    >
                        <Camera size={14} /> View Fleet
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Hero;
