import React, { useState } from 'react';
import { Globe, ChevronDown, CheckCircle2, XCircle, Search, ArrowRight } from 'lucide-react';

export function NavyGlass() {
  const [hoverCTA, setHoverCTA] = useState(false);
  const [hoverBtn1, setHoverBtn1] = useState(false);
  const [hoverBtn2, setHoverBtn2] = useState(false);

  return (
    <div className="min-h-screen font-sans text-white selection:bg-blue-500/30" style={{ backgroundColor: '#0A1929' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4" style={{ background: 'linear-gradient(to bottom, #0A1929, #112840)' }}>
        <div className="flex items-center gap-8">
          <div className="text-2xl font-bold tracking-tight">RealDoor</div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
            <a href="#" className="hover:text-white transition-colors">Home</a>
            <a href="#" className="hover:text-white transition-colors">Programs</a>
            <a href="#" className="hover:text-white transition-colors">Listings</a>
            <a href="#" className="hover:text-white transition-colors">Copilot</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 text-sm hover:bg-white/10 transition-colors">
            <Globe className="w-4 h-4" />
            <span>English</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-white/5"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
            }}
          >
            Sign In
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Hero Left */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
              Housing assistance,<br />
              <span style={{ color: '#3B82F6' }}>simplified.</span>
            </h1>
            <p className="text-lg md:text-xl max-w-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Find and apply for affordable housing programs in New York City. Check your eligibility in minutes.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-6 border-t border-white/10 w-max">
            <span className="text-sm font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Available in</span>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>English</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>Español</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>中文</span>
            </div>
          </div>
        </div>

        {/* Eligibility Card Right */}
        <div className="lg:col-span-5">
          <div className="rounded-[24px] p-8 shadow-2xl" style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}>
            <h2 className="text-2xl font-bold mb-6">Check Eligibility</h2>
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>Monthly Income</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3" style={{ color: 'rgba(255,255,255,0.4)' }}>$</span>
                    <input type="text" placeholder="0.00" className="w-full pl-7 pr-4 py-3 rounded-xl outline-none transition-colors placeholder:text-white/40"
                      style={{ 
                        background: 'rgba(255,255,255,0.06)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        color: 'white',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' 
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>Current Rent</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3" style={{ color: 'rgba(255,255,255,0.4)' }}>$</span>
                    <input type="text" placeholder="0.00" className="w-full pl-7 pr-4 py-3 rounded-xl outline-none transition-colors placeholder:text-white/40"
                      style={{ 
                        background: 'rgba(255,255,255,0.06)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        color: 'white',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' 
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>Household Size</label>
                <div className="relative">
                  <select className="w-full pl-4 pr-10 py-3 rounded-xl outline-none transition-colors appearance-none"
                    style={{ 
                      background: 'rgba(255,255,255,0.06)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      color: 'white',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' 
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  >
                    <option style={{ background: '#0A1929' }}>1 Person</option>
                    <option style={{ background: '#0A1929' }}>2 People</option>
                    <option style={{ background: '#0A1929' }}>3 People</option>
                    <option style={{ background: '#0A1929' }}>4+ People</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-white/40 pointer-events-none" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>Borough</label>
                <div className="relative">
                  <select className="w-full pl-4 pr-10 py-3 rounded-xl outline-none transition-colors appearance-none"
                    style={{ 
                      background: 'rgba(255,255,255,0.06)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      color: 'white',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' 
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  >
                    <option style={{ background: '#0A1929' }}>Brooklyn</option>
                    <option style={{ background: '#0A1929' }}>Queens</option>
                    <option style={{ background: '#0A1929' }}>Manhattan</option>
                    <option style={{ background: '#0A1929' }}>Bronx</option>
                    <option style={{ background: '#0A1929' }}>Staten Island</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-white/40 pointer-events-none" />
                </div>
              </div>
              
              <div className="pt-4">
                <button 
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold transition-transform duration-200 ${hoverCTA ? '-translate-y-0.5' : ''}`}
                  style={{
                    background: hoverCTA ? 'rgba(255,255,255,0.35)' : 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 100%)',
                    boxShadow: hoverCTA 
                      ? 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.4), 0 8px 32px rgba(59,130,246,0.4)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(59,130,246,0.4), 0 8px 32px rgba(59,130,246,0.25)',
                    backdropFilter: 'blur(12px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(160%)',
                  }}
                  onMouseEnter={() => setHoverCTA(true)}
                  onMouseLeave={() => setHoverCTA(false)}
                >
                  <Search className="w-4 h-4" />
                  Find Programs
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <h3 className="text-2xl font-bold mb-8">Recommended Programs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-2xl p-6 flex flex-col h-full" style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}>
            <div className="mb-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34D399' }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Income within threshold
            </div>
            <h4 className="text-xl font-bold mb-2">NYC Housing Connect</h4>
            <p className="text-sm leading-relaxed mb-8 flex-grow" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Apply for affordable housing lotteries in newly constructed and renovated buildings across all five boroughs.
            </p>
            <button 
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-transform duration-200 text-sm ${hoverBtn1 ? '-translate-y-0.5' : ''}`}
              style={{
                background: hoverBtn1 ? 'rgba(255,255,255,0.35)' : 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 100%)',
                boxShadow: hoverBtn1
                  ? 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.4)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(12px) saturate(160%)',
                WebkitBackdropFilter: 'blur(12px) saturate(160%)',
              }}
              onMouseEnter={() => setHoverBtn1(true)}
              onMouseLeave={() => setHoverBtn1(false)}
            >
              Learn More & Apply
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl p-6 flex flex-col h-full" style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}>
            <div className="mb-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34D399' }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Income within threshold
            </div>
            <h4 className="text-xl font-bold mb-2">CityFHEPS</h4>
            <p className="text-sm leading-relaxed mb-8 flex-grow" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Rental assistance supplement program to help individuals and families find and keep housing.
            </p>
            <button 
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-transform duration-200 text-sm ${hoverBtn2 ? '-translate-y-0.5' : ''}`}
              style={{
                background: hoverBtn2 ? 'rgba(255,255,255,0.35)' : 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 100%)',
                boxShadow: hoverBtn2
                  ? 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.4)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(12px) saturate(160%)',
                WebkitBackdropFilter: 'blur(12px) saturate(160%)',
              }}
              onMouseEnter={() => setHoverBtn2(true)}
              onMouseLeave={() => setHoverBtn2(false)}
            >
              Learn More & Apply
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl p-6 flex flex-col h-full opacity-70" style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}>
            <div className="mb-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', color: '#F87171' }}
            >
              <XCircle className="w-3.5 h-3.5" />
              Income above threshold
            </div>
            <h4 className="text-xl font-bold mb-2">Section 8 Vouchers</h4>
            <p className="text-sm leading-relaxed mb-8 flex-grow" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Federal program for assisting very low-income families, the elderly, and the disabled to afford decent housing.
            </p>
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all hover:bg-white/5 hover:text-white text-sm"
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white'
              }}
            >
              View Requirements
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
