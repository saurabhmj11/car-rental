import React, { useState, useEffect } from 'react';
import {
  Car, MapPin, Calendar, Clock, Info, CheckCircle,
  AlertCircle, Calculator, ChevronRight, User, ShieldCheck,
  Moon, Camera, X, Share2, HelpCircle, FileText, Plane,
  Briefcase, MessageCircle, ArrowRight, Star, Settings,
  Coffee, Users, GraduationCap, Zap, TicketPercent,
  TrendingUp, Eye, Gift, Lock, Code
} from 'lucide-react';
import ProfitCalculator from './components/ProfitCalculator';
import Preloader from './components/Preloader';
import Hero from './components/Hero';
import BookingTerminal from './components/BookingTerminal';

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
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [showReferral, setShowReferral] = useState(false);

  // SYSTEM STATE
  const [showTerminal, setShowTerminal] = useState(false);

  // Calculated
  const [quote, setQuote] = useState(0);
  const [baseQuote, setBaseQuote] = useState(0);
  const [breakdown, setBreakdown] = useState([]);
  const [showLuggageWarning, setShowLuggageWarning] = useState(false);

  // Constants
  const WHATSAPP_NUMBER = "919876543210";
  const ADMIN_SHEET_URL = "https://docs.google.com/spreadsheets/d/17lZ1pc8QaSYsiPgJ2ZK30kr-9lVTj2b0Ubn0TBUK7YM/edit?usp=sharing";
  const GOOGLE_FORM_URL = "https://forms.gle/CL69KrpyP1LojWxa8";

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

  const SURGE_MULTIPLIER = 1.25;

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


  // SYSTEM ACTIONS
  const handleInitiateBooking = () => {
    setShowTerminal(true);
  };

  const handleDispatch = () => {
    // Analytics: Track "Book Click" as Revenue (Simulation)
    const newTotal = totalRevenue + quote;
    setTotalRevenue(newTotal);
    localStorage.setItem('wr_revenue', newTotal.toString());

    // Redirect to Google Form - The "Secure Portal"
    window.open(GOOGLE_FORM_URL, '_blank');
    setShowTerminal(false);
  };

  if (loading) return <Preloader onComplete={() => setLoading(false)} />;

  return (
    <div className="min-h-screen text-slate-800 selection:bg-amber-300/30">

      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 left-0 p-4">
        <div className="max-w-md mx-auto h-16 flex justify-between items-center glass-panel rounded-full px-6">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded-lg rotate-3 shadow-lg">
              <Car className="text-amber-400" size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">Wardha<span className="text-amber-600">Rides</span></span>
          </div>
          <button onClick={() => {
            if (navigator.share) navigator.share({ url: window.location.href, title: 'Wardha Rides' });
          }} className="p-2 hover:bg-white/50 rounded-full transition-colors text-slate-600">
            <Share2 size={18} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-24 pb-32 px-4 space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-12">

        {/* --- LIVE ACTIVITY HUD (FOMO) --- */}
        <div className="lg:col-span-12 flex justify-center lg:justify-start mb-2">
          <div className="inline-flex items-center gap-2 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold border border-white/10 shadow-xl animate-pulse">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{viewers} students checking rides right now</span>
          </div>
        </div>

        {/* LEFT COLUMN: VISUALS */}
        <div className="lg:col-span-7 space-y-6">
          {/* PREMIUM HERO V2 */}
          <Hero surgeActive={surgeActive} onViewGallery={() => setShowGallery(true)} />

          {/* Desktop Promo/Value Props (Visible on large screens) */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
              <h3 className="font-bold text-slate-900 mb-2">⚡ No Hidden Charges</h3>
              <p className="text-sm text-slate-600">Fuel, Tolls, and Driver Allowance are strictly calculated. No surprises.</p>
            </div>
            <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
              <h3 className="font-bold text-slate-900 mb-2">🎓 Student Special</h3>
              <p className="text-sm text-slate-600">Exclusive discounts and campus pickup points for data-driven savings.</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BOOKING ENGINE (STICKY) */}
        <div className="lg:col-span-5 relative">
          <div className="lg:sticky lg:top-24 space-y-6">

            {/* --- MAIN INTERFACE (Bento Grid) --- */}

            {/* 1. Trip Type Selector (Glass) */}
            <div className="glass-panel p-1.5 rounded-2xl flex relative w-full">
              <button onClick={() => setActiveTab('taxi')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'taxi' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-white/50'}`}>With Driver</button>
              <button onClick={() => setActiveTab('self')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'self' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-white/50'}`}>Self Drive</button>
            </div>

            {/* 2. Destination Grid (Bento) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-2 mb-1.5 block">Select Mode</label>
              </div>
              {[
                { id: 'hangout', label: 'Hangout', icon: Coffee, desc: '4/8 Hrs' },
                { id: 'nagpur', label: 'Nagpur', icon: MapPin, desc: 'Local' },
                { id: 'airport', label: 'Airport', icon: Plane, desc: 'Drop/Pick' },
                { id: 'outstation', label: 'Long Drive', icon: Car, desc: 'Multi-Day' }
              ].filter(opt => activeTab === 'taxi' || opt.id !== 'airport').map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setTripType(opt.id)}
                  className={`p-4 rounded-3xl border text-left transition-all duration-300 relative overflow-hidden group ${tripType === opt.id ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-transparent shadow-xl shadow-slate-200' : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md'}`}
                >
                  {tripType === opt.id && <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-2xl"></div>}
                  <opt.icon size={22} className={`mb-3 ${tripType === opt.id ? 'text-amber-400' : 'text-slate-300 group-hover:scale-110 transition-transform'}`} />
                  <div className="font-bold text-sm">{opt.label}</div>
                  <div className={`text-[10px] font-medium ${tripType === opt.id ? 'text-slate-400' : 'text-slate-400'}`}>{opt.desc}</div>
                </button>
              ))}
            </div>

            {/* 3. Configuration Panel (Glass) */}
            <div className="glass-panel p-6 rounded-3xl space-y-5">

              {/* Passenger Control */}
              {activeTab === 'taxi' && (
                <div className="flex justify-between items-center pb-5 border-b border-slate-200/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Users size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500">Total Persons</div>
                      <div className="text-slate-900 font-bold">{passengers} Students</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600">-</button>
                    <button onClick={() => setPassengers(Math.min(5, passengers + 1))} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600">+</button>
                  </div>
                </div>
              )}

              {/* Dynamic Inputs */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-2 mb-2 block">Pickup Point</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-4 text-slate-400" />
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-10 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-slate-900/10 transition-all appearance-none cursor-pointer hover:bg-slate-100"
                  >
                    {CAMPUS_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
              </div>

              {/* Contextual Options */}
              {tripType === 'nagpur' && activeTab === 'taxi' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setNagpurPackage('full')}
                    className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${nagpurPackage === 'full' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    Full Day (₹3500)
                  </button>
                  <button
                    onClick={() => setNagpurPackage('2point')}
                    className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${nagpurPackage === '2point' ? 'border-amber-400 bg-amber-50 text-amber-900 border-dashed' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    2-Point (₹2300)
                  </button>
                </div>
              )}

              {tripType === 'hangout' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {['cafe', 'dam'].map(pkg => (
                    <button
                      key={pkg}
                      onClick={() => setHangoutPackage(pkg)}
                      className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${hangoutPackage === pkg ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      {pkg === 'cafe' ? 'Cafe (4hr)' : 'Dam (6hr)'}
                    </button>
                  ))}
                </div>
              )}

              {
                /* Date Selection for Multi-Day Trips */
                ((tripType === 'outstation') || (activeTab === 'self' && selfDrivePackage === 'daily')) && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-2 mb-2 block">Start Date</label>
                      <input
                        type="date"
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10 uppercase tracking-wide"
                        onChange={(e) => setDates(prev => ({ ...prev, start: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-2 mb-2 block">End Date</label>
                      <div className="relative">
                        <input
                          type="date"
                          className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10 uppercase tracking-wide"
                          onChange={(e) => setDates(prev => ({ ...prev, end: e.target.value }))}
                        />
                        {days > 1 && (
                          <div className="absolute -top-8 right-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg">
                            {days} Days
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }

              {
                (tripType === 'outstation' || (activeTab === 'self' && tripType !== 'hangout')) && (
                  <div className="pt-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-2 mb-2 block">Distance Estimate</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl">
                      <input
                        type="range"
                        min="50"
                        max="600"
                        step="10"
                        value={distance}
                        onChange={(e) => setDistance(parseInt(e.target.value))}
                        className="flex-1 accent-slate-900 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="bg-white px-3 py-1.5 rounded-xl font-bold text-sm shadow-sm min-w-[80px] text-center border border-slate-100 flex flex-col justify-center">
                        <span>{distance} km</span>
                        <span className="text-[8px] text-slate-400 font-medium uppercase leading-none mt-0.5">Est. Range</span>
                      </div>
                    </div>
                  </div>
                )
              }
            </div>

            {/* 4. Pricing Card (Dark Auto-Layout) */}
            <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">

              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 blur-[50px] rounded-full group-hover:bg-amber-500/30 transition-all"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">Estimated Total</div>
                    <div className="text-4xl font-black tracking-tighter">
                      ₹{quote.toLocaleString()}
                    </div>
                  </div>
                  {passengers > 1 && (
                    <div className="text-right">
                      <div className="text-amber-400 font-bold text-lg">₹{Math.ceil(quote / passengers)}</div>
                      <div className="text-slate-500 text-[10px]">per person</div>
                    </div>
                  )}
                </div>

                {/* SQUAD PAY VISUALIZER */}
                {passengers > 1 && (
                  <div className="mb-6 p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Squad Split</span>
                      <span className="text-[10px] font-bold text-green-400">Save ₹{Math.floor(quote - (quote / passengers))} together</span>
                    </div>
                    <div className="flex gap-1 h-2 overflow-hidden rounded-full">
                      {Array.from({ length: passengers }).map((_, i) => (
                        <div key={i} className="flex-1 bg-amber-400/80 first:bg-amber-400"></div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Promo Field */}
                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    placeholder="PROMO CODE"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="bg-white/10 border-none rounded-xl px-4 py-3 text-sm font-bold placeholder:text-white/30 text-white focus:ring-1 focus:ring-amber-400 w-full uppercase tracking-widest"
                  />
                  <button onClick={applyPromo} className="bg-amber-400 text-slate-900 px-4 rounded-xl font-bold hover:bg-amber-300 transition-colors">
                    <CheckCircle size={18} />
                  </button>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleInitiateBooking}
                  className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/10"
                >
                  <MessageCircle className="text-green-600" size={20} fill="currentColor" fillOpacity={0.2} />
                  <span>BOOK NOW</span>
                  <ArrowRight size={18} className="opacity-40" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- FOOTER (Signature) --- */}
        <div className="pt-8 pb-4 text-center lg:col-span-12">

          <div onClick={() => setShowReferral(!showReferral)} className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 mb-8 cursor-pointer hover:bg-amber-50 transition-colors">
            <Gift size={14} className="text-amber-500" />
            <span className="text-xs font-bold text-slate-600">Get ₹50 Off</span>
          </div>
          {showReferral && (
            <div className="mb-8 animate-fade-in">
              <div className="bg-white p-3 rounded-xl border border-dashed border-amber-300 inline-block">
                <div className="text-xs text-slate-400 mb-1">YOUR REFERRAL CODE</div>
                <div className="font-mono font-black text-lg text-slate-800 tracking-widest">STUDENT-{Math.floor(Math.random() * 100)}</div>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-6 mb-8">
            <button onClick={() => setShowTerms(true)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Terms</button>
            <a href={GOOGLE_FORM_URL} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Upload Docs</a>
            <button onClick={() => setIsAdminOpen(true)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Admin</button>
          </div>

          {/* SIGNATURE CREDIT */}
          <div className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
            <div className="w-8 h-[2px] bg-slate-300 rounded-full mb-1"></div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Code size={12} />
              <span>Designed & Developed by</span>
              <span className="font-bold text-slate-900">Saurabh</span>
            </div>
          </div>

        </div>

      </main>

      {/* --- MODALS --- */}

      {/* 1. BOOKING TERMINAL (BOT) */}
      {showTerminal && (
        <BookingTerminal
          details={{
            pickup: pickupLocation,
            destination: tripType,
            price: quote
          }}
          onConfirm={handleDispatch}
          onClose={() => setShowTerminal(false)}
        />
      )}

      {/* Admin Dashboard */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-50 animate-fade-in flex flex-col">
          <div className="bg-slate-900 p-4 text-white flex justify-between items-center shadow-lg shrink-0">
            <span className="font-bold flex items-center gap-2"><Briefcase size={18} /> Admin Console</span>
            <button onClick={() => { setIsAdminOpen(false); setLoginError(false); }} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-xs font-bold transition-colors">Exit</button>
          </div>
          {isLoggedIn ? (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex bg-white border-b border-slate-200 shrink-0">
                <button onClick={() => setAdminTab('overview')} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-all ${adminTab === 'overview' ? 'border-amber-400 text-slate-900 bg-amber-50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Overview</button>
                <button onClick={() => setAdminTab('calculator')} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-all ${adminTab === 'calculator' ? 'border-amber-400 text-slate-900 bg-amber-50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Profit Tool</button>
              </div>
              <div className="flex-1 overflow-hidden bg-slate-100 p-2 sm:p-4">
                {adminTab === 'overview' ? (
                  <div className="flex flex-col h-full gap-4">
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 grid grid-cols-2 gap-4 shrink-0">
                      <div className="flex items-center justify-between bg-amber-50 p-3 rounded-xl border border-amber-100">
                        <div><h3 className="font-bold text-slate-900 text-sm">⚡ Surge</h3></div>
                        <input type="checkbox" checked={surgeActive} onChange={(e) => setSurgeActive(e.target.checked)} className="w-5 h-5 accent-amber-500" />
                      </div>
                      <div className="flex items-center justify-between bg-green-50 p-3 rounded-xl border border-green-100">
                        <div><h3 className="font-bold text-slate-900 text-sm">💰 Revenue</h3></div>
                        <span className="font-bold text-green-700">₹{(totalRevenue / 1000).toFixed(1)}k</span>
                      </div>
                    </div>
                    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative"><iframe src={ADMIN_SHEET_URL} className="absolute inset-0 w-full h-full border-none" title="Admin"></iframe></div>
                  </div>
                ) : (<div className="h-full"><ProfitCalculator totalRevenue={totalRevenue} /></div>)}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-100">
              <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center">
                <Lock size={32} className="mx-auto text-slate-400 mb-4" />
                <h2 className="text-2xl font-black text-slate-900 mb-6">Owner Login</h2>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} placeholder="Password" className="w-full text-center p-3 text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl" />
                  {loginError && <p className="text-xs text-red-500 font-bold">Incorrect</p>}
                  <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl">Access</button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setShowTerms(false)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full"><X size={18} /></button>
            <h2 className="text-xl font-black mb-4">Terms</h2>
            <div className="text-sm text-slate-600 space-y-2"><p>Standard rental terms apply.</p></div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4 animate-fade-in">
          <button onClick={() => setShowGallery(false)} className="absolute top-6 right-6 text-white"><X size={32} /></button>
          <div className="text-white text-center"><Car size={64} className="mx-auto text-amber-400 mb-4 opacity-50" /><h3 className="text-2xl font-bold">Gallery</h3></div>
        </div>
      )}

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 w-full z-40 lg:hidden user-select-none">
        {/* Gradient Blur Overlay */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none"></div>

        <div className="relative bg-white/80 backdrop-blur-xl border-t border-slate-200/50 p-4 pb-8 flex items-center justify-between gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">Total Estimate</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 tracking-tight">₹{quote.toLocaleString()}</span>
              {passengers > 1 && <span className="text-xs font-bold text-slate-400">/ {passengers}</span>}
            </div>
          </div>
          <button
            onClick={handleInitiateBooking}
            className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
          >
            <span>BOOK NOW</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default App;
