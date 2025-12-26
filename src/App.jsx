import React, { useState, useEffect } from 'react';
import {
  Car, MapPin, Calendar, Clock, Info, CheckCircle,
  AlertCircle, Calculator, ChevronRight, User, ShieldCheck,
  Moon, Camera, X, Share2, HelpCircle, FileText, Plane,
  Briefcase, MessageCircle, ArrowRight, Star, Settings,
  Coffee, Users, GraduationCap, Zap, TicketPercent,
  TrendingUp, Eye, Gift, Lock
} from 'lucide-react';
import ProfitCalculator from './components/ProfitCalculator';

const Preloader = ({ onComplete }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-white">
      <div className="text-4xl font-black tracking-tighter mb-4 animate-pulse">
        WARDHA<span className="text-amber-400">RIDES</span>
      </div>
      <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 transition-all duration-100 ease-out"
          style={{ width: `${count}%` }}
        />
      </div>
      <div className="mt-2 text-xs font-mono text-slate-500">{count}%</div>
    </div>
  );
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [adminTab, setAdminTab] = useState('overview');

  // Persistence Loading
  const loadPref = (key, def) => localStorage.getItem(key) || def;

  const [activeTab, setActiveTab] = useState('taxi');
  const [tripType, setTripType] = useState(() => loadPref('wr_tripType', 'nagpur'));

  // Inputs
  const [days, setDays] = useState(1);
  const [distance, setDistance] = useState(250); // Default distance
  const [passengers, setPassengers] = useState(4);
  const [luggage, setLuggage] = useState(1);
  const [isNightDriving, setIsNightDriving] = useState(false);
  const [dates, setDates] = useState({ start: '', end: '' });
  const [pickupLocation, setPickupLocation] = useState(() => loadPref('wr_pickup', 'Hostel'));

  // Packages
  const [nagpurPackage, setNagpurPackage] = useState('full');
  const [airportMode, setAirportMode] = useState('drop');
  const [selfDrivePackage, setSelfDrivePackage] = useState('daily');
  const [hangoutPackage, setHangoutPackage] = useState('cafe');

  // Revenue Controls
  const [surgeActive, setSurgeActive] = useState(false); // Admin Controlled
  const [promoCode, setPromoCode] = useState('');
  const [activeDiscount, setActiveDiscount] = useState(0);

  // Social Proof & Analytics
  const [viewers, setViewers] = useState(3);
  const [totalRevenue, setTotalRevenue] = useState(() => parseInt(localStorage.getItem('wr_revenue') || '15400'));

  // UI State
  const [showGallery, setShowGallery] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false); // Modal visibility
  const [isLoggedIn, setIsLoggedIn] = useState(false);   // Auth status
  const [adminPass, setAdminPass] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [showReferral, setShowReferral] = useState(false);

  // Calculated
  const [quote, setQuote] = useState(0);
  const [baseQuote, setBaseQuote] = useState(0); // Before surge/discount
  const [breakdown, setBreakdown] = useState([]);
  const [showLuggageWarning, setShowLuggageWarning] = useState(false);

  // Constants
  const WHATSAPP_NUMBER = "919876543210";
  const GOOGLE_FORM_URL = "https://forms.gle/CL69KrpyP1LojWxa8";
  const ADMIN_SHEET_URL = "https://docs.google.com/spreadsheets/d/17lZ1pc8QaSYsiPgJ2ZK30kr-9lVTj2b0Ubn0TBUK7YM/edit?usp=sharing";

  // Save Preferences
  useEffect(() => {
    localStorage.setItem('wr_tripType', tripType);
    localStorage.setItem('wr_pickup', pickupLocation);
  }, [tripType, pickupLocation]);

  // FOMO Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => Math.max(2, Math.min(8, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const RATES = {
    taxi: {
      nagpur: { full: 3500, twoPoint: 2300 },
      airport: { drop: 2200, pickup: 2300 },
      outstation: { minKmPerDay: 300, ratePerKm: 12, driverAllowance: 300, nightCharge: 300 },
      hangout: { cafe: 1200, dam: 1800 }
    },
    self: {
      daily: 2500,
      halfDay: 1500,
      hangout: { cafe: 800, dam: 1200 },
      limit: 250,
      excessRate: 5,
      securityDeposit: 5000
    }
  };

  const CAMPUS_LOCATIONS = [
    "DMIMS Main Gate", "Girls Hostel (Sawangi)", "Boys Hostel (Sawangi)", "T-Point", "Staff Quarters", "Other"
  ];

  const SURGE_MULTIPLIER = 1.25; // 25% Increase

  const applyPromo = () => {
    const code = promoCode.toUpperCase().trim();
    let dis = 0;
    if (code === 'DMIMS100') dis = 100;
    else if (code === 'EXAMREADY') dis = quote * 0.05; // 5%
    else if (code === 'WARDHA200') dis = 200;

    if (dis > 0) setActiveDiscount(dis);
    else alert('Invalid Promo Code');
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPass === 'dudu') {
      setIsLoggedIn(true);
      setLoginError(false);
      setAdminPass('');
    } else {
      setLoginError(true);
    }
  };

  useEffect(() => {
    if (dates.start && dates.end) {
      const start = new Date(dates.start);
      const end = new Date(dates.end);
      if (end < start) {
        setDates(prev => ({ ...prev, end: prev.start }));
      } else {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setDays(diffDays > 0 ? diffDays : 1);
      }
    }
  }, [dates]);

  useEffect(() => {
    // Pricing Engine
    let price = 0;
    let details = [];

    if (activeTab === 'taxi') {
      if (tripType === 'nagpur') {
        if (nagpurPackage === 'full') {
          price = RATES.taxi.nagpur.full;
          details.push({ label: 'Full Day Package', value: `₹${price}` });
          details.push({ label: 'Includes', value: '12 Hrs / Local Unlimited' });
        } else {
          price = RATES.taxi.nagpur.twoPoint;
          details.push({ label: '2-Point Visit', value: `₹${price}` });
          details.push({ label: 'Duration', value: '6-7 Hours' });
        }
        details.push({ label: 'Driver Allowance', value: 'Included' });
      } else if (tripType === 'airport') {
        if (airportMode === 'drop') {
          price = RATES.taxi.airport.drop;
          details.push({ label: 'Wardha ➔ Nagpur Airport', value: `₹${price}` });
        } else {
          price = RATES.taxi.airport.pickup;
          details.push({ label: 'Nagpur Airport ➔ Wardha', value: `₹${price}` });
          details.push({ label: 'Includes', value: 'Parking & Waiting' });
        }
      } else if (tripType === 'hangout') {
        if (hangoutPackage === 'cafe') {
          price = RATES.taxi.hangout.cafe;
          details.push({ label: 'Cafe Hopping (4 Hrs)', value: `₹${price}` });
          details.push({ label: 'Distance', value: '40 km included' });
        } else {
          price = RATES.taxi.hangout.dam;
          details.push({ label: 'Dam Visit (6 Hrs)', value: `₹${price}` });
          details.push({ label: 'Distance', value: '80 km included' });
        }
      } else if (tripType === 'outstation') {
        const minKm = days * RATES.taxi.outstation.minKmPerDay;
        const billableKm = Math.max(distance, minKm);
        const baseFare = billableKm * RATES.taxi.outstation.ratePerKm;
        const driverBata = days * RATES.taxi.outstation.driverAllowance;
        price = baseFare + driverBata;

        details.push({ label: `Min Billing (${minKm} km)`, value: 'Active' });
        details.push({ label: 'Base Fare', value: `₹${baseFare}` });
        details.push({ label: 'Driver Allowance', value: `₹${driverBata}` });
      }

      if (isNightDriving && tripType !== 'hangout') {
        price += RATES.taxi.outstation.nightCharge;
        details.push({ label: 'Night Charge (10PM-6AM)', value: `₹${RATES.taxi.outstation.nightCharge}`, highlight: true });
      }

    } else {
      // Self Drive Logic
      if (tripType === 'hangout') {
        if (hangoutPackage === 'cafe') {
          price = RATES.self.hangout.cafe;
          details.push({ label: 'Cafe Solo (4 Hrs)', value: `₹${price}` });
          details.push({ label: 'Limit', value: '40 km' });
        } else {
          price = RATES.self.hangout.dam;
          details.push({ label: 'Dam Solo (6 Hrs)', value: `₹${price}` });
          details.push({ label: 'Limit', value: '80 km' });
        }
      } else {
        // Standard Self Drive
        const baseLimit = RATES.self.limit; // 250km limit
        const excessDist = Math.max(0, distance - baseLimit);
        const excessCharge = excessDist * RATES.self.excessRate;

        if (selfDrivePackage === '12hr') {
          price = RATES.self.halfDay + excessCharge;
          details.push({ label: '12-Hr Rental Base', value: `₹${RATES.self.halfDay}` });
        } else {
          price = (days * RATES.self.daily) + excessCharge;
          details.push({ label: `Daily Rental (${days} Days)`, value: `₹${days * RATES.self.daily}` });
        }

        details.push({ label: `Included Distance`, value: `${baseLimit} km` });
        if (excessDist > 0) {
          details.push({ label: `Excess Km (${excessDist})`, value: `+₹${excessCharge}`, highlight: true });
        }
      }
    }

    setBaseQuote(price);

    // Apply Revenue Tweaks
    let finalPrice = price;

    if (surgeActive) {
      const surgeAmt = Math.round(price * (SURGE_MULTIPLIER - 1));
      finalPrice += surgeAmt;
      details.push({ label: 'High Demand Surge', value: `+₹${surgeAmt}`, highlight: true, icon: Zap });
    }

    if (activeDiscount > 0) {
      finalPrice -= activeDiscount;
      details.push({ label: `Promo Applied`, value: `-₹${Math.round(activeDiscount)}`, highlight: true, color: 'text-green-500' });
    }

    setQuote(finalPrice);
    setBreakdown(details);

    // Luggage Config check
    let isTight = false;
    if (activeTab === 'taxi') {
      if (passengers === 5 && luggage > 1) isTight = true;
      if (passengers === 4 && luggage > 2) isTight = true;
      if (luggage > 4) isTight = true;
    }
    setShowLuggageWarning(isTight);

  }, [activeTab, tripType, days, distance, nagpurPackage, isNightDriving, airportMode, passengers, luggage, selfDrivePackage, dates, hangoutPackage, surgeActive, activeDiscount]);


  const handleWhatsApp = () => {
    // Analytics: Track "Book Click" as Revenue (Simulation)
    const newTotal = totalRevenue + quote;
    setTotalRevenue(newTotal);
    localStorage.setItem('wr_revenue', newTotal.toString());

    let text = `*New Student Booking*\nType: ${activeTab}\nMode: ${tripType}\nPickup: ${pickupLocation}\nPax: ${passengers}`;
    if (tripType === 'hangout') text += `\nPkg: ${hangoutPackage}`;
    if (activeTab === 'self' && tripType !== 'hangout') text += `\nDist: ${distance} km`;
    if (surgeActive) text += `\n(Surge Applied)`;
    if (activeDiscount > 0) text += `\nPromo: ${promoCode}`;
    text += `\nEst. Price: ₹${quote}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) return <Preloader onComplete={() => setLoading(false)} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-amber-200">

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-md mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded-lg rotate-3">
              <Car className="text-amber-400" size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Wardha<span className="text-amber-500">Rides</span></span>
          </div>
          <button onClick={() => {
            if (navigator.share) navigator.share({ url: window.location.href, title: 'Wardha Rides' });
          }} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <Share2 size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-md mx-auto pt-24 pb-12 px-6">

        {/* Premium Hero */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 mb-8 border border-white group">
          <div className="absolute inset-0 bg-slate-900"></div>
          {surgeActive && (
            <div className="absolute top-0 left-0 w-full bg-amber-500 text-slate-900 text-xs font-bold text-center py-1 z-20 animate-pulse flex justify-center items-center gap-1">
              <Zap size={12} fill="currentColor" /> High Demand: Surge Pricing Active
            </div>
          )}
          <div className="relative p-8 text-center text-white z-10 pt-10">
            <div className="flex justify-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/10 text-amber-400 rounded-full text-[10px] font-bold tracking-wider uppercase border border-amber-400/20">
                <Star size={10} fill="currentColor" /> Premium Fleet
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/20">
                <GraduationCap size={12} /> Campus Edition
              </div>
            </div>
            <h1 className="text-3xl font-black mb-1 leading-tight">Tata Altroz XZ+</h1>
            <p className="text-slate-400 text-sm font-medium mb-6">Sunroof • 5-Star Safety • Harmon Kardon</p>

            <button
              onClick={() => setShowGallery(true)}
              className="bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all text-white text-xs font-bold py-3 px-6 rounded-xl backdrop-blur-md border border-white/10 flex items-center gap-2 mx-auto"
            >
              <Camera size={14} /> View Gallery
            </button>
          </div>
        </div>

        {/* Segment Control */}
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 mb-8 flex relative">
          <button
            onClick={() => setActiveTab('taxi')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all relative z-10 ${activeTab === 'taxi' ? 'text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {activeTab === 'taxi' && <div className="absolute inset-0 bg-slate-900 rounded-xl -z-10 animate-fade-in" />}
            <User size={16} /> With Driver
          </button>
          <button
            onClick={() => setActiveTab('self')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all relative z-10 ${activeTab === 'self' ? 'text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {activeTab === 'self' && <div className="absolute inset-0 bg-slate-900 rounded-xl -z-10 animate-fade-in" />}
            <ShieldCheck size={16} /> Self Drive
          </button>
        </div>

        {/* Input Form */}
        <div className="space-y-6">

          {/* Trip Modes */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'hangout', label: 'Hangout Mode', icon: Coffee, desc: 'Cafe & Chill' },
              { id: 'nagpur', label: 'Nagpur / Local', icon: MapPin, desc: 'Shop & Dine' },
              { id: 'airport', label: 'Airport', icon: Plane, desc: 'Drop / Pickup' },
              { id: 'outstation', label: 'Outstation', icon: Car, desc: 'Long Drive' }
            ].filter(opt => activeTab === 'taxi' || opt.id !== 'airport').map(opt => (
              <button
                key={opt.id}
                onClick={() => setTripType(opt.id)}
                className={`p-3 rounded-2xl border transition-all text-left group ${tripType === opt.id ? 'bg-amber-50 border-amber-400 shadow-md shadow-amber-100' : 'bg-white border-slate-100 hover:border-amber-200'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <opt.icon size={20} className={tripType === opt.id ? 'text-amber-600' : 'text-slate-300 group-hover:text-amber-400'} />
                  {tripType === opt.id && <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />}
                </div>
                <div className={`font-bold text-sm leading-tight ${tripType === opt.id ? 'text-slate-900' : 'text-slate-500'}`}>{opt.label}</div>
                <div className="text-[10px] text-slate-400 font-medium">{opt.desc}</div>
              </button>
            ))}
          </div>

          {/* Configuration Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-100 border border-slate-50">

            {/* Passenger & Luggage (Taxi Only) */}
            {activeTab === 'taxi' && (
              <div className="mb-6 pb-6 border-b border-slate-50">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Group Size</div>
                    <div className="font-bold text-xl text-slate-800 mt-1 flex items-center gap-2">
                      <Users size={18} className="text-slate-400" /> {passengers} <span className="text-sm font-normal text-slate-400">Students</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center font-bold transition-colors">-</button>
                    <button onClick={() => setPassengers(Math.min(5, passengers + 1))} className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center font-bold transition-colors">+</button>
                  </div>
                </div>

                {tripType !== 'hangout' && (
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Luggage</div>
                      <div className="font-bold text-xl text-slate-800 mt-1">{luggage} <span className="text-sm font-normal text-slate-400">Bags</span></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setLuggage(Math.max(0, luggage - 1))} className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center font-bold transition-colors">-</button>
                      <button onClick={() => setLuggage(Math.min(6, luggage + 1))} className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center font-bold transition-colors">+</button>
                    </div>
                  </div>
                )}
                {showLuggageWarning && <div className="mt-4 text-xs bg-amber-50 text-amber-700 p-3 rounded-xl flex items-start gap-2 leading-relaxed"><AlertCircle size={14} className="mt-0.5 shrink-0" /> Compact Boot. Limit bags for 5 pax.</div>}
              </div>
            )}

            {/* Dynamic Inputs based on Type */}
            <div className="space-y-4">

              {/* Campus Quick-Pick */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Campus Pickup Point</label>
                <select
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800 font-bold text-sm text-slate-700"
                >
                  {CAMPUS_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>

              {/* HANGOUT MODE */}
              {tripType === 'hangout' && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setHangoutPackage('cafe')}
                    className={`p-3 rounded-xl border text-left ${hangoutPackage === 'cafe' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 border-slate-100'}`}
                  >
                    <div className="text-xs font-bold mb-1 opacity-70">4 Hours</div>
                    <div className="font-bold">Cafe Hop</div>
                  </button>
                  <button
                    onClick={() => setHangoutPackage('dam')}
                    className={`p-3 rounded-xl border text-left ${hangoutPackage === 'dam' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 border-slate-100'}`}
                  >
                    <div className="text-xs font-bold mb-1 opacity-70">6 Hours</div>
                    <div className="font-bold">Dam Visit</div>
                  </button>
                </div>
              )}

              {/* NAGPUR MODE */}
              {activeTab === 'taxi' && tripType === 'nagpur' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Package</label>
                  <div className="flex flex-col gap-2">
                    <label className={`block p-3 rounded-xl border-2 transition-all cursor-pointer ${nagpurPackage === 'full' ? 'border-amber-400 bg-amber-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                      <input type="radio" value="full" checked={nagpurPackage === 'full'} onChange={() => setNagpurPackage('full')} className="hidden" />
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700">Full Day (12 Hr)</span>
                        <span className="text-xs font-bold bg-white px-2 py-1 rounded-md text-slate-500 shadow-sm">Best Value</span>
                      </div>
                    </label>
                    <label className={`block p-3 rounded-xl border-2 transition-all cursor-pointer ${nagpurPackage === 'twoPoint' ? 'border-amber-400 bg-amber-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                      <input type="radio" value="twoPoint" checked={nagpurPackage === 'twoPoint'} onChange={() => setNagpurPackage('twoPoint')} className="hidden" />
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700">2-Point Visit (6 Hr)</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* AIRPORT MODE */}
              {activeTab === 'taxi' && tripType === 'airport' && (
                <>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => setAirportMode('drop')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${airportMode === 'drop' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}>Drop to Appt.</button>
                    <button onClick={() => setAirportMode('pickup')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${airportMode === 'pickup' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}>Pickup from Appt.</button>
                  </div>
                  <input type="datetime-local" min={new Date().toISOString().slice(0, 16)} className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-slate-900" />
                </>
              )}

              {/* OUTSTATION / SELF-DRIVE STANDARD */}
              {((tripType === 'outstation' && activeTab === 'taxi') || (activeTab === 'self' && tripType !== 'hangout')) && (
                <>
                  {/* Self Drive Pkg Selection */}
                  {activeTab === 'self' && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <button
                        onClick={() => setSelfDrivePackage('daily')}
                        className={`p-4 rounded-2xl border text-left transition-all ${selfDrivePackage === 'daily' ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
                      >
                        <div className="text-xs font-medium opacity-70 mb-1">Daily Rental</div>
                        <div className="text-lg font-bold">₹2500</div>
                        <div className="text-[10px] opacity-70 mt-1">250km Limit</div>
                      </button>
                      <button
                        onClick={() => setSelfDrivePackage('12hr')}
                        className={`p-4 rounded-2xl border text-left transition-all ${selfDrivePackage === '12hr' ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
                      >
                        <div className="text-xs font-medium opacity-70 mb-1">12-Hour</div>
                        <div className="text-lg font-bold">₹1500</div>
                        <div className="text-[10px] opacity-70 mt-1">250km Limit</div>
                      </button>
                    </div>
                  )}

                  {(activeTab === 'taxi' || selfDrivePackage === 'daily') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Trip Duration ({days} Days)</label>
                      <input type="range" min="1" max="15" value={days} onChange={(e) => setDays(parseInt(e.target.value))} className="w-full accent-slate-900" />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Est. Distance (Km)</label>
                    <input
                      type="number"
                      value={distance}
                      onChange={(e) => setDistance(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-slate-900"
                    />
                    {activeTab === 'self' && distance > 250 && <p className="text-xs text-amber-600 mt-2 font-bold">Excess charged at ₹5/km</p>}
                  </div>
                </>
              )}

              {/* Night Charge Toggle */}
              {activeTab === 'taxi' && tripType !== 'airport' && tripType !== 'hangout' && (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Moon size={16} /> Night Driving (10PM - 6AM)?
                  </div>
                  <input type="checkbox" checked={isNightDriving} onChange={(e) => setIsNightDriving(e.target.checked)} className="accent-slate-900 w-5 h-5 rounded hover:cursor-pointer" />
                </div>
              )}

            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl shadow-slate-300 relative overflow-hidden">

            {/* FOMO badge */}
            <div className="absolute top-0 right-0 bg-red-500 px-3 py-1 rounded-bl-xl text-[10px] font-bold flex items-center gap-1 animate-fade-in">
              <Eye size={10} className="animate-pulse" /> {viewers} students viewing
            </div>

            {/* Total & Split Fare */}
            <div className="border-b border-white/10 pb-6 mb-6 mt-2">
              <div className="flex justify-between items-end mb-1">
                <span className="text-slate-400 font-medium">Total Estimate</span>
                <span className="text-4xl font-black tracking-tight">₹{quote.toLocaleString()}</span>
              </div>
              {passengers > 1 && (
                <div className="flex justify-end items-center gap-2 text-amber-400 animate-pulse">
                  <span className="text-xs font-bold uppercase tracking-wider">Student Split:</span>
                  <span className="text-lg font-bold">₹{Math.ceil(quote / passengers)} <span className="text-xs font-normal text-amber-300/80">/ person</span></span>
                </div>
              )}
            </div>

            {/* Promo Code Input */}
            <div className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <TicketPercent className="absolute left-3 top-3.5 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Promo Code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full bg-slate-800 border-none rounded-xl py-3 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-amber-400"
                />
              </div>
              <button onClick={applyPromo} className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-4 rounded-xl text-sm transition-colors">Apply</button>
            </div>

            <div className="space-y-3 mb-8">
              {breakdown.map((item, i) => (
                <div key={i} className={`flex justify-between text-sm ${item.highlight ? item.color || 'text-amber-400 font-bold' : 'text-slate-300'}`}>
                  <span className="flex items-center gap-2">{item.icon && <item.icon size={14} />} {item.label}</span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={handleWhatsApp} className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-green-500/30">
                <MessageCircle size={20} /> Book via WhatsApp
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-500 mt-4 uppercase tracking-widest">
              {activeTab === 'self' ? 'Excludes Fuel & Tolls/Challans' : 'Excludes Tolls & Parking'}
            </p>
          </div>

        </div>

        {/* Footer with Referral Stub */}
        <div className="mt-12 text-center space-y-6">

          <div onClick={() => setShowReferral(!showReferral)} className="max-w-xs mx-auto bg-amber-50 border border-amber-200 p-4 rounded-2xl cursor-pointer hover:shadow-lg transition-all">
            <div className="flex items-center justify-center gap-3 text-amber-800 font-bold">
              <Gift size={20} />
              <span>Refer a Friend & Earn ₹50!</span>
            </div>
            {showReferral && (
              <div className="mt-3 pt-3 border-t border-amber-200 animate-fade-in text-xs text-amber-700">
                <p className="mb-2">Share this code with your batchmates:</p>
                <div className="bg-white p-2 rounded-lg font-mono font-black text-lg tracking-widest border border-dashed border-amber-400 text-slate-800">
                  STUDENT-{Math.floor(Math.random() * 1000)}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-6">
            <button
              onClick={() => setShowTerms(true)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >Terms & Policy
            </button>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >Owners Dashboard
            </button>
          </div>

          <div className="text-[10px] text-slate-300">
            Wardha Rides © 2024 • DMIMS Campus Edition
          </div>
        </div>

      </main>

      {/* --- MODALS --- */}

      {/* Admin Dashboard / Login */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-50 animate-fade-in flex flex-col">
          <div className="bg-slate-900 p-4 text-white flex justify-between items-center shadow-lg">
            <span className="font-bold flex items-center gap-2"><Briefcase size={18} /> Admin Console</span>
            <button onClick={() => { setIsAdminOpen(false); setLoginError(false); }} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-xs font-bold transition-colors">Exit</button>
          </div>

          {/* If Logged In: Show Content, Else: Show Login */}
          {isLoggedIn ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Admin Tabs */}
              <div className="flex bg-white border-b border-slate-200 shrink-0">
                <button
                  onClick={() => setAdminTab('overview')}
                  className={`flex-1 py-4 text-sm font-bold border-b-2 transition-all ${adminTab === 'overview' ? 'border-amber-400 text-slate-900 bg-amber-50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Overview & Bookings
                </button>
                <button
                  onClick={() => setAdminTab('calculator')}
                  className={`flex-1 py-4 text-sm font-bold border-b-2 transition-all ${adminTab === 'calculator' ? 'border-amber-400 text-slate-900 bg-amber-50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Profit & Expense Tool
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden bg-slate-100 p-2 sm:p-4">
                {adminTab === 'overview' ? (
                  <div className="flex flex-col h-full gap-4">
                    {/* Surge Control Panel */}
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 grid grid-cols-2 gap-4 shrink-0">
                      <div className="flex items-center justify-between bg-amber-50 p-3 rounded-xl border border-amber-100">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">⚡ Surge Pricing</h3>
                          <p className="text-[10px] text-slate-500">Toggle High Demand (+25%)</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={surgeActive} onChange={(e) => setSurgeActive(e.target.checked)} className="sr-only peer" />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between bg-green-50 p-3 rounded-xl border border-green-100">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">💰 Revenue (Est.)</h3>
                          <p className="text-[10px] text-slate-500">Total Bookings Value</p>
                        </div>
                        <span className="font-mono text-lg font-black text-green-700">₹{(totalRevenue / 1000).toFixed(1)}k</span>
                      </div>
                    </div>

                    {/* Sheet Iframe */}
                    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                      <iframe src={ADMIN_SHEET_URL} className="absolute inset-0 w-full h-full border-none" title="Admin"></iframe>
                    </div>
                  </div>
                ) : (
                  <div className="h-full">
                    <ProfitCalculator totalRevenue={totalRevenue} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock size={32} className="text-slate-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Owner Login</h2>
                <p className="text-slate-500 text-sm mb-6">Security check to access console.</p>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <input
                    type="password"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="Enter Password"
                    className="w-full text-center p-3 text-lg font-bold tracking-widest bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  {loginError && <p className="text-xs text-red-500 font-bold animate-pulse">Incorrect Password</p>}
                  <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">Access Dashboard</button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl relative max-h-[80vh] overflow-y-auto">
            <button onClick={() => setShowTerms(false)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"><X size={18} /></button>
            <h2 className="text-xl font-black mb-6">Terms of Service</h2>
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2">Self Drive Policy</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Refundable Security Deposit: ₹5000</li>
                  <li>Original License & Aadhar required.</li>
                  <li>Fuel is User's responsibility. Car given with Full Tank, expect Full Tank back.</li>
                </ul>
              </div>
              <p><strong>Speed Limits:</strong> Strict 100km/h limit. ₹500 penalty per breach.</p>
              <p><strong>Cancellations:</strong> Free up to 24 hrs prior. 50% charge if within 24 hrs.</p>
            </div>
            <button onClick={() => setShowTerms(false)} className="w-full mt-6 bg-slate-900 text-white font-bold py-4 rounded-xl">I Understand</button>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4 animate-fade-in">
          <button onClick={() => setShowGallery(false)} className="absolute top-6 right-6 text-white/50 hover:text-white"><X size={32} /></button>
          <div className="text-white text-center">
            <Car size={64} className="mx-auto text-amber-400 mb-4 opacity-50" />
            <h3 className="text-2xl font-bold">Gallery Mode</h3>
            <p className="text-slate-400 mt-2">High-res car images would appear here.</p>
            <button onClick={() => setShowGallery(false)} className="mt-8 px-6 py-2 border border-white/20 rounded-full text-sm hover:bg-white/10">Close</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
