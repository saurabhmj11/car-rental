import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, TrendingDown, DollarSign, MapPin, Fuel, AlertCircle } from 'lucide-react';

const ProfitCalculator = ({ totalRevenue }) => {
    const [activeTab, setActiveTab] = useState('simulate'); // 'simulate' or 'ledger'
    const [entries, setEntries] = useState(() => JSON.parse(localStorage.getItem('wr_ledger') || '[]'));

    // Simulation State
    const [simTripType, setSimTripType] = useState('nagpur');
    const [simRevenue, setSimRevenue] = useState(3500);
    const [simDistance, setSimDistance] = useState(160); // Nagpur default
    const [simMileage, setSimMileage] = useState(18); // Altroz Diesel
    const [simFuelPrice, setSimFuelPrice] = useState(96); // Diesel Rate
    const [simToll, setSimToll] = useState(150);
    const [simOtherExp, setSimOtherExp] = useState(0);

    // Computed
    const fuelCost = Math.round((simDistance / simMileage) * simFuelPrice);
    const totalExpense = fuelCost + parseInt(simToll) + parseInt(simOtherExp);
    const netProfit = simRevenue - totalExpense;
    const margin = Math.round((netProfit / simRevenue) * 100);

    useEffect(() => {
        // Auto-set defaults based on Trip Type
        if (simTripType === 'nagpur') {
            setSimDistance(160);
            setSimToll(150);
            setSimRevenue(3500);
        } else if (simTripType === 'airport') {
            setSimDistance(150);
            setSimToll(200);
            setSimRevenue(2200);
        } else if (simTripType === 'local') {
            setSimDistance(40);
            setSimToll(0);
            setSimRevenue(1200);
        }
    }, [simTripType]);

    const saveEntry = () => {
        const newEntry = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            type: simTripType,
            revenue: simRevenue,
            expense: totalExpense,
            profit: netProfit,
            details: `Fuel: ₹${fuelCost}, Toll: ₹${simToll}`
        };
        const updated = [newEntry, ...entries];
        setEntries(updated);
        localStorage.setItem('wr_ledger', JSON.stringify(updated));
        alert('Trip Profit Saved to Ledger!');
    };

    const clearLedger = () => {
        if (confirm('Clear all history?')) {
            setEntries([]);
            localStorage.removeItem('wr_ledger');
        }
    };

    return (
        <div className="bg-slate-50 p-4 rounded-2xl h-full flex flex-col">

            {/* Toggle */}
            <div className="flex bg-white p-1 rounded-xl shadow-sm mb-4 border border-slate-200">
                <button
                    onClick={() => setActiveTab('simulate')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'simulate' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Calculator size={14} className="inline mr-1" /> Calculator
                </button>
                <button
                    onClick={() => setActiveTab('ledger')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'ledger' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <DollarSign size={14} className="inline mr-1" /> Ledger History
                </button>
            </div>

            {activeTab === 'simulate' ? (
                <div className="space-y-4 overflow-y-auto">

                    {/* Presets */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trip Preset</label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                            {['nagpur', 'airport', 'local'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setSimTripType(t)}
                                    className={`py-2 rounded-lg border text-xs font-bold capitalize ${simTripType === t ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-white border-slate-200'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic Inputs */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400">Dist (Km)</label>
                            <input type="number" value={simDistance} onChange={e => setSimDistance(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 text-sm font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400">Fuel (₹/L)</label>
                            <input type="number" value={simFuelPrice} onChange={e => setSimFuelPrice(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 text-sm font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400">Mileage</label>
                            <input type="number" value={simMileage} onChange={e => setSimMileage(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 text-sm font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400">Toll/Challan</label>
                            <input type="number" value={simToll} onChange={e => setSimToll(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 text-sm font-bold" />
                        </div>
                    </div>

                    {/* Results Card */}
                    <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg relative overflow-hidden">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-400 text-xs">Gross Revenue</span>
                            <input
                                type="number"
                                value={simRevenue}
                                onChange={e => setSimRevenue(e.target.value)}
                                className="bg-slate-800 text-white text-right font-bold w-20 rounded p-1 text-sm border-none focus:ring-1 focus:ring-amber-400"
                            />
                        </div>
                        <div className="flex justify-between items-center mb-2 text-red-300">
                            <span className="text-xs flex items-center gap-1"><Fuel size={12} /> Est. Fuel</span>
                            <span className="font-bold">-₹{fuelCost}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4 text-red-300">
                            <span className="text-xs">Tolls & Other</span>
                            <span className="font-bold">-₹{parseInt(simToll) + parseInt(simOtherExp)}</span>
                        </div>
                        <div className="pt-3 border-t border-white/10 flex justify-between items-end">
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Net Profit</div>
                                <div className={`text-2xl font-black ${netProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>₹{netProfit}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Margin</div>
                                <div className="text-lg font-bold text-amber-400">{margin}%</div>
                            </div>
                        </div>
                    </div>

                    <button onClick={saveEntry} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700">
                        Save to Ledger
                    </button>

                </div>
            ) : (
                <div className="overflow-y-auto flex-1">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-700">Recent Trips</h3>
                        <button onClick={clearLedger} className="text-[10px] text-red-500 font-bold hover:underline">Clear</button>
                    </div>
                    {entries.length === 0 ? (
                        <div className="text-center text-slate-400 py-8 text-sm">No history yet.</div>
                    ) : (
                        <div className="space-y-3">
                            {entries.map(e => (
                                <div key={e.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-bold text-slate-800 capitalize">{e.type} Trip</span>
                                        <span className="text-xs text-slate-400">{e.date}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-green-600 font-bold">Rev: ₹{e.revenue}</span>
                                        <span className="text-red-500 font-bold">Exp: ₹{e.expense}</span>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-slate-50 flex justify-between items-center">
                                        <span className="text-[10px] text-slate-400">{e.details}</span>
                                        <span className="font-black text-slate-900 bg-green-100 px-2 py-1 rounded text-xs">+₹{e.profit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};

export default ProfitCalculator;
