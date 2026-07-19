import React from 'react';
import { Globe, Leaf, ChevronDown, AlertCircle, ArrowRight, Home, Users, MapPin, DollarSign, Menu, ExternalLink } from 'lucide-react';

export function ForestAmber() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .realdoor-bg { background-color: #F8F6F0; color: #1A3D2B; }
        .realdoor-header { background-color: #1A3D2B; }
        .realdoor-text-forest { color: #1A3D2B; }
        .realdoor-text-amber { color: #C8922A; }
        .realdoor-text-muted { color: rgba(26,61,43,0.8); }
        .realdoor-text-light { color: rgba(26,61,43,0.6); }

        .glass-btn-primary {
          background: linear-gradient(135deg, #1A3D2B 0%, #254D38 100%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.2), 0 4px 20px rgba(26,61,43,0.35);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: white;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .glass-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.2), 0 8px 28px rgba(26,61,43,0.4);
        }

        .glass-btn-amber {
          background: linear-gradient(135deg, #C8922A, #B07820);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 16px rgba(200,146,42,0.4);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          color: white;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .glass-btn-amber:hover {
          transform: translateY(-1px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 24px rgba(200,146,42,0.5);
        }

        .glass-btn-secondary {
          background: rgba(26,61,43,0.06);
          border: 1px solid rgba(26,61,43,0.2);
          color: #1A3D2B;
          backdrop-filter: blur(8px);
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .glass-btn-secondary:hover {
          background: rgba(26,61,43,0.12);
        }

        .form-input-realdoor {
          background: white;
          border: 1px solid rgba(26,61,43,0.2);
          color: #1A3D2B;
          transition: all 0.2s ease;
        }
        .form-input-realdoor::placeholder {
          color: #8FAE9F;
        }
        .form-input-realdoor:focus {
          border-color: #1A3D2B;
          box-shadow: 0 0 0 3px rgba(26,61,43,0.1);
          outline: none;
        }

        .card-realdoor {
          background: white;
          border: 1px solid rgba(26,61,43,0.12);
          box-shadow: 0 2px 12px rgba(26,61,43,0.06), 0 8px 32px rgba(26,61,43,0.04);
        }

        .badge-default {
          background: rgba(26,61,43,0.08);
          color: #1A3D2B;
        }
        .badge-success {
          background: rgba(26,61,43,0.1);
          border: 1px solid rgba(26,61,43,0.3);
          color: #1A3D2B;
        }
        .badge-warning {
          background: rgba(200,146,42,0.12);
          border: 1px solid rgba(200,146,42,0.3);
          color: #8B6010;
        }
      `}} />

      <div className="min-h-screen font-sans realdoor-bg pb-24">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full realdoor-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white glass-btn-amber shadow-none hover:shadow-none hover:translate-y-0 cursor-pointer">
                  <Home size={18} />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">RealDoor</span>
              </div>
              
              <nav className="hidden md:flex space-x-8">
                {['Home', 'Programs', 'Listings', 'Copilot'].map((item) => (
                  <a key={item} href="#" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                    {item}
                  </a>
                ))}
              </nav>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 text-white/90 hover:text-white cursor-pointer text-sm font-medium transition-colors bg-white/10 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/20">
                  <Globe size={16} />
                  <span>English</span>
                  <ChevronDown size={14} />
                </div>
                <button className="md:hidden text-white p-2">
                  <Menu size={24} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 lg:items-center">
            
            {/* Hero Content */}
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium badge-default">
                <span className="w-2 h-2 rounded-full bg-[#C8922A]"></span>
                NYC Housing Assistance 2024
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] realdoor-text-forest">
                Find housing programs you <span className="realdoor-text-amber relative whitespace-nowrap">
                  qualify
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#C8922A]/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span> for.
              </h1>
              
              <p className="text-lg sm:text-xl leading-relaxed max-w-2xl realdoor-text-muted">
                RealDoor helps New Yorkers navigate rent assistance, affordable housing lotteries, and emergency programs in multiple languages.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4">
                <span className="text-sm font-bold uppercase tracking-wider realdoor-text-light">Available in:</span>
                <div className="flex flex-wrap gap-2">
                  {['Español', '中文', 'বাংলা', 'Русский'].map((lang) => (
                    <button key={lang} className="text-sm font-medium px-4 py-1.5 rounded-full transition-colors bg-black/5 hover:bg-black/10 realdoor-text-forest">
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Eligibility Card */}
            <div className="w-full lg:w-[440px] shrink-0 rounded-2xl p-6 sm:p-8 card-realdoor relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1A3D2B] to-[#C8922A]"></div>
              <h2 className="text-2xl font-bold mb-6 realdoor-text-forest">Check Eligibility</h2>
              
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold realdoor-text-forest">Monthly Income (Gross)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8FAE9F]" />
                    <input type="text" placeholder="0.00" className="w-full pl-9 pr-4 py-3 rounded-lg text-sm form-input-realdoor" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold realdoor-text-forest">Current Rent</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8FAE9F]" />
                    <input type="text" placeholder="0.00" className="w-full pl-9 pr-4 py-3 rounded-lg text-sm form-input-realdoor" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold realdoor-text-forest">Household</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8FAE9F]" />
                      <select className="w-full pl-9 pr-8 py-3 rounded-lg text-sm appearance-none form-input-realdoor cursor-pointer">
                        <option>1 Person</option>
                        <option>2 People</option>
                        <option>3 People</option>
                        <option>4+ People</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8FAE9F] pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold realdoor-text-forest">Borough</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8FAE9F]" />
                      <select className="w-full pl-9 pr-8 py-3 rounded-lg text-sm appearance-none form-input-realdoor cursor-pointer">
                        <option>Bronx</option>
                        <option>Brooklyn</option>
                        <option>Manhattan</option>
                        <option>Queens</option>
                        <option>Staten Island</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8FAE9F] pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="w-full flex items-center justify-center gap-2 py-3.5 px-4 glass-btn-primary group">
                    Find Matches
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Results Section */}
          <div className="mt-24 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-3xl font-bold realdoor-text-forest">Recommended Programs</h3>
                <p className="mt-1 realdoor-text-muted">Based on your provided details</p>
              </div>
              <a href="#" className="text-sm font-bold hover:underline realdoor-text-amber inline-flex items-center gap-1">
                View all 12 programs <ArrowRight size={14} />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="flex flex-col rounded-2xl p-6 h-full card-realdoor group hover:-translate-y-1 transition-transform duration-300">
                <div className="mb-5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold badge-success">
                    <Leaf size={14} />
                    Income within threshold
                  </span>
                </div>
                <h4 className="text-2xl font-bold mb-3 realdoor-text-forest">CityFHEPS</h4>
                <p className="text-sm flex-grow mb-8 leading-relaxed realdoor-text-muted">
                  A rental assistance supplement to help individuals and families find and keep housing. Covers up to 70% of rent for eligible households.
                </p>
                <button className="w-full flex items-center justify-center gap-2 py-3 px-4 glass-btn-amber">
                  Apply Now
                  <ExternalLink size={16} />
                </button>
              </div>

              {/* Card 2 */}
              <div className="flex flex-col rounded-2xl p-6 h-full card-realdoor group hover:-translate-y-1 transition-transform duration-300">
                <div className="mb-5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold badge-success">
                    <Leaf size={14} />
                    Income within threshold
                  </span>
                </div>
                <h4 className="text-2xl font-bold mb-3 realdoor-text-forest">FHEPS</h4>
                <p className="text-sm flex-grow mb-8 leading-relaxed realdoor-text-muted">
                  Rent supplement for families with children who receive Cash Assistance and are facing eviction.
                </p>
                <button className="w-full flex items-center justify-center gap-2 py-3 px-4 glass-btn-secondary">
                  Learn More
                </button>
              </div>

              {/* Card 3 */}
              <div className="flex flex-col rounded-2xl p-6 h-full card-realdoor group hover:-translate-y-1 transition-transform duration-300">
                <div className="mb-5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold badge-warning">
                    <AlertCircle size={14} />
                    Income above threshold
                  </span>
                </div>
                <h4 className="text-2xl font-bold mb-3 realdoor-text-forest">Mitchell-Lama</h4>
                <p className="text-sm flex-grow mb-8 leading-relaxed realdoor-text-muted">
                  Affordable rental and cooperative housing for moderate- and middle-income families. Open waiting list status varies.
                </p>
                <button className="w-full flex items-center justify-center gap-2 py-3 px-4 glass-btn-secondary">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
