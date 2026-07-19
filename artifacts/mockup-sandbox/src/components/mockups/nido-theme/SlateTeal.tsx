import React from 'react';
import { Globe, ChevronDown, CheckCircle2, ArrowRight, DollarSign, Users, MapPin, Search, Home } from 'lucide-react';

export function SlateTeal() {
  return (
    <div className="min-h-screen bg-[#1E2A3A] text-[#E2E8F0] font-sans selection:bg-[#14B8A6]/30 selection:text-white pb-20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#1E2A3A] border-b border-[#14B8A6]/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-12">
            <a href="#" className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <span className="text-[#14B8A6]">NIDO</span>
            </a>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
              <a href="#" className="hover:text-white transition-colors">Home</a>
              <a href="#" className="hover:text-white transition-colors">Programs</a>
              <a href="#" className="hover:text-white transition-colors">Listings</a>
              <a href="#" className="flex items-center gap-1 hover:text-white transition-colors">
                Copilot <span className="bg-[#14B8A6]/20 text-[#14B8A6] text-[10px] px-1.5 py-0.5 rounded-sm ml-1 font-bold">BETA</span>
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <div className="hidden md:flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer transition-colors">
              <Globe className="w-4 h-4" />
              <span>English</span>
              <ChevronDown className="w-3 h-3" />
            </div>
            
            <button className="hidden md:block px-4 py-2 border border-[#14B8A6]/50 text-[#14B8A6] rounded-lg hover:bg-[#14B8A6]/10 transition-colors font-medium">
              Log in
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-7 flex flex-col items-start">
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
            Find affordable housing in <span className="text-[#14B8A6]">NYC</span>
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl leading-relaxed">
            Discover programs, track your eligibility, and apply for housing lotteries with NIDO's bilingual assistance platform.
          </p>
          
          {/* Language Selector Below Hero */}
          <div className="flex items-center gap-2 mb-10 bg-[#1E2A3A]/80 border border-[#14B8A6]/20 p-1.5 rounded-lg">
            <button className="px-4 py-1.5 rounded-md bg-[#14B8A6]/20 text-[#14B8A6] text-sm font-medium">English</button>
            <button className="px-4 py-1.5 rounded-md text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors">Español</button>
            <button className="px-4 py-1.5 rounded-md text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors">中文</button>
          </div>
          
          <div className="flex gap-4 w-full max-w-md">
            <button 
              className="group relative flex-1 text-white font-semibold rounded-[10px] px-6 py-3.5 transition-all duration-300 hover:-translate-y-[1px] flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, rgba(20,184,166,0.9), rgba(13,148,136,0.8))',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2), 0 6px 24px rgba(20,184,166,0.35)',
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2), 0 8px 32px rgba(20,184,166,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2), 0 6px 24px rgba(20,184,166,0.35)';
              }}
            >
              Start Your Profile
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-6 py-3.5 text-slate-400 hover:text-[#E2E8F0] font-medium transition-colors">
              How it works
            </button>
          </div>
        </div>

        {/* Eligibility Card */}
        <div className="lg:col-span-5 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#14B8A6]/20 to-blue-500/20 rounded-[24px] blur-xl opacity-50" />
          <div className="relative bg-white/5 backdrop-blur-[24px] border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Check Eligibility</h2>
              <p className="text-slate-400 text-sm">Enter your household details to match with programs.</p>
            </div>
            
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">Monthly Income</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <input 
                      type="text" 
                      placeholder="4,500"
                      className="w-full bg-[rgba(30,42,58,0.8)] border border-[#14B8A6]/20 text-[#E2E8F0] placeholder-[#64748B] rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/60 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">Current Rent</label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <input 
                      type="text" 
                      placeholder="1,800"
                      className="w-full bg-[rgba(30,42,58,0.8)] border border-[#14B8A6]/20 text-[#E2E8F0] placeholder-[#64748B] rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/60 transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">Household Size</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <select className="w-full bg-[rgba(30,42,58,0.8)] border border-[#14B8A6]/20 text-[#E2E8F0] rounded-lg pl-9 pr-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/60 transition-all cursor-pointer">
                      <option>1 Person</option>
                      <option>2 People</option>
                      <option>3 People</option>
                      <option>4+ People</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">Borough</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <select className="w-full bg-[rgba(30,42,58,0.8)] border border-[#14B8A6]/20 text-[#E2E8F0] rounded-lg pl-9 pr-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/60 transition-all cursor-pointer">
                      <option>All NYC</option>
                      <option>Brooklyn</option>
                      <option>Queens</option>
                      <option>Manhattan</option>
                      <option>Bronx</option>
                      <option>Staten Island</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                  </div>
                </div>
              </div>
              
              <button 
                className="w-full mt-6 text-white font-semibold rounded-[10px] px-6 py-3.5 transition-all duration-300 hover:-translate-y-[1px] flex items-center justify-center gap-2 group"
                style={{
                  background: 'linear-gradient(135deg, rgba(20,184,166,0.9), rgba(13,148,136,0.8))',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2), 0 6px 24px rgba(20,184,166,0.35)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2), 0 8px 32px rgba(20,184,166,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2), 0 6px 24px rgba(20,184,166,0.35)';
                }}
              >
                <Search className="w-4 h-4 text-white" />
                <span>Check My Eligibility</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Program Results */}
      <section className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-semibold">Recommended Programs</h3>
          <button className="text-[#14B8A6] text-sm font-medium hover:text-white transition-colors flex items-center gap-1">
            View all 12 matches <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white/5 backdrop-blur-[24px] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-300 flex flex-col h-full group">
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14B8A6]/15 border border-[#14B8A6]/40 text-[#14B8A6] text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Income within program threshold
              </span>
            </div>
            <h4 className="text-xl font-semibold mb-2">NYC Housing Connect</h4>
            <p className="text-slate-400 text-sm mb-6 flex-grow leading-relaxed">
              Affordable housing lotteries for newly constructed or renovated buildings across the five boroughs.
            </p>
            <div className="pt-4 border-t border-white/5 mt-auto">
              <button className="w-full py-2.5 px-4 rounded-lg border border-[#14B8A6]/50 text-[#14B8A6] hover:bg-[#14B8A6]/10 font-medium transition-colors text-sm group-hover:border-[#14B8A6] group-hover:bg-[#14B8A6]/15">
                Learn More & Apply
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/5 backdrop-blur-[24px] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-300 flex flex-col h-full group">
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14B8A6]/15 border border-[#14B8A6]/40 text-[#14B8A6] text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Income within program threshold
              </span>
            </div>
            <h4 className="text-xl font-semibold mb-2">Mitchell-Lama Program</h4>
            <p className="text-slate-400 text-sm mb-6 flex-grow leading-relaxed">
              Provides affordable rental and cooperative housing to moderate- and middle-income families.
            </p>
            <div className="pt-4 border-t border-white/5 mt-auto">
              <button className="w-full py-2.5 px-4 rounded-lg border border-[#14B8A6]/50 text-[#14B8A6] hover:bg-[#14B8A6]/10 font-medium transition-colors text-sm group-hover:border-[#14B8A6] group-hover:bg-[#14B8A6]/15">
                Learn More & Apply
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/5 backdrop-blur-[24px] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-300 flex flex-col h-full group">
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-400/15 border border-red-400/30 text-red-400 text-xs font-medium">
                Income above threshold
              </span>
            </div>
            <h4 className="text-xl font-semibold mb-2">Section 8 Vouchers</h4>
            <p className="text-slate-400 text-sm mb-6 flex-grow leading-relaxed">
              Federal program assisting very low-income families, the elderly, and the disabled to afford decent housing.
            </p>
            <div className="pt-4 border-t border-white/5 mt-auto">
              <button className="w-full py-2.5 px-4 rounded-lg border border-transparent text-[#94A3B8] hover:bg-white/5 hover:text-[#E2E8F0] font-medium transition-colors text-sm">
                View Alternatives
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
