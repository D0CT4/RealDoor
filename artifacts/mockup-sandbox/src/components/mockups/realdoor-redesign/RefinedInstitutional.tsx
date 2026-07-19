import React from 'react';
import { 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  Clock, 
  X, 
  ChevronDown, 
  Globe, 
  Pencil, 
  Download, 
  ShieldCheck,
  Search,
  Check,
  AlertTriangle,
  Building
} from 'lucide-react';

export function RefinedInstitutional() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans" style={{ fontFamily: "'Onest', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600&family=Sora:wght@400;500;600;700&display=swap');
        .font-sora { font-family: 'Sora', sans-serif; }
      `}} />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex flex-col justify-center">
                <span className="font-sora font-bold text-xl text-[#0A192F] tracking-tight flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#0A192F] rounded-md flex items-center justify-center">
                    <Building className="w-4 h-4 text-white" />
                  </div>
                  RealDoor
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-0.5">Application readiness copilot</span>
              </div>

              <nav className="hidden md:flex items-center space-x-2 ml-4 border-l border-slate-200 pl-8">
                <button className="px-4 py-2 text-sm font-medium text-teal-800 bg-teal-50 rounded-md border border-teal-100">
                  Apply
                </button>
                <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-colors border border-transparent">
                  Understand
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#0A192F] transition-colors p-2 rounded-md hover:bg-slate-50">
                <Globe className="w-4 h-4" />
                English
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8 border-b border-slate-200 pb-6">
          <h1 className="font-sora text-3xl font-semibold text-[#0A192F] tracking-tight">Prepare your application</h1>
          <p className="text-slate-600 mt-2 text-lg">Upload your documents and verify the extracted information before submission.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column (Main forms) */}
          <div className="flex-1 space-y-8 min-w-0 w-full">
            
            {/* Document Extraction Section */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-white px-6 py-5 flex items-center justify-between">
                <div>
                  <h2 className="font-sora text-lg font-semibold text-[#0A192F]">Document Extraction</h2>
                  <p className="text-sm text-slate-500 mt-1">Upload income and identity documents for automated processing.</p>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Upload Zone */}
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-[#F8FAFC] hover:bg-slate-50 hover:border-teal-500/50 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-white rounded-full border border-slate-200 shadow-sm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-6 h-6 text-teal-600" />
                  </div>
                  <p className="text-sm font-medium text-[#0A192F]">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500 mt-1">PDF, DOCX, or images (max. 10MB)</p>
                </div>

                {/* File Chips */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-3 px-3 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-sm group hover:border-slate-300 transition-colors">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span className="font-medium text-slate-700">maria_gonzalez_paystub_oct.pdf</span>
                    <button className="text-slate-400 hover:text-rose-600 ml-2 p-0.5 rounded transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-sm group hover:border-slate-300 transition-colors">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span className="font-medium text-slate-700">acme_offer_letter.docx</span>
                    <button className="text-slate-400 hover:text-rose-600 ml-2 p-0.5 rounded transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button className="bg-[#0A192F] hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 flex items-center gap-2">
                    <Search className="w-4 h-4 text-teal-400" />
                    Extract Fields
                  </button>
                </div>
              </div>

              {/* Extracted Fields Table */}
              <div className="border-t border-slate-200 bg-[#F8FAFC]">
                <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-[#0A192F] uppercase tracking-wider">Review Extracted Data</h3>
                  <span className="text-xs font-medium text-slate-500 bg-slate-200/50 px-2.5 py-1 rounded-full">7 fields identified</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3.5 font-semibold">Field</th>
                        <th className="px-6 py-3.5 font-semibold">Extracted Value</th>
                        <th className="px-6 py-3.5 font-semibold">Confidence</th>
                        <th className="px-6 py-3.5 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {[
                        { label: "Applicant Name", value: "Maria Gonzalez", conf: "High" },
                        { label: "Employer", value: "Acme Staffing LLC", conf: "High" },
                        { label: "Gross Pay", value: "$2,150.00", conf: "Medium", confClass: "bg-amber-50 text-amber-700 ring-amber-600/20" },
                        { label: "Pay Frequency", value: "Biweekly", conf: "High" },
                        { label: "Pay Date", value: "Oct 15, 2023", conf: "High" },
                        { label: "Document Date", value: "Oct 17, 2023", conf: "High" },
                        { label: "Document Type", value: "Uncertain", conf: "Low", italic: true, confClass: "bg-rose-50 text-rose-700 ring-rose-600/20" },
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 font-medium text-[#0A192F]">{row.label}</td>
                          <td className={`px-6 py-4 text-slate-700 ${row.italic ? 'italic text-slate-500' : ''}`}>{row.value}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${row.confClass || 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'}`}>
                              {row.conf}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-slate-400 hover:text-teal-700 transition-colors p-1.5 rounded-md hover:bg-teal-50 border border-transparent hover:border-teal-100">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Checklist Section */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-5 flex items-center justify-between">
                <div>
                  <h2 className="font-sora text-lg font-semibold text-[#0A192F]">Checklist</h2>
                  <p className="text-sm text-slate-500 mt-1">Required application documents.</p>
                </div>
                <div className="text-sm font-medium text-slate-700 bg-[#F8FAFC] px-3 py-1.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                  4 of 6 Complete
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {[
                  { title: "Government Photo ID", sub: "Verified on Oct 10", status: "Complete", icon: Check, color: "emerald" },
                  { title: "Social Security Cards", sub: "Household of 1", status: "Complete", icon: Check, color: "emerald" },
                  { title: "Recent Pay Stubs", sub: "Last 4 consecutive", status: "Complete", icon: Check, color: "emerald" },
                  { title: "Employment Letter", sub: "Acme Staffing LLC", status: "Complete", icon: Check, color: "emerald" },
                  { title: "Bank Statements", sub: "Past 6 months required", status: "Missing", icon: Clock, color: "slate" },
                  { title: "Benefit Letter (SNAP/TANF)", sub: "Document is over 120 days old", status: "Expired", icon: AlertCircle, color: "rose", subColor: "text-rose-600" },
                ].map((item, idx) => (
                  <div key={idx} className={`px-6 py-4 flex items-center justify-between transition-colors ${item.status === 'Expired' ? 'bg-rose-50/30 hover:bg-rose-50/50' : 'hover:bg-slate-50/50'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                        item.color === 'emerald' ? 'bg-emerald-50 border-emerald-100' :
                        item.color === 'slate' ? 'bg-slate-100 border-slate-200' :
                        'bg-rose-100 border-rose-200'
                      }`}>
                        <item.icon className={`w-4 h-4 ${
                          item.color === 'emerald' ? 'text-emerald-600' :
                          item.color === 'slate' ? 'text-slate-400' :
                          'text-rose-600'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#0A192F]">{item.title}</p>
                        <p className={`text-xs mt-0.5 ${item.subColor || 'text-slate-500'}`}>{item.sub}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      item.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' :
                      item.color === 'slate' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                      'bg-rose-50 text-rose-700 border-rose-200/50'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column (Sticky Rail) */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0 relative">
            <div className="sticky top-24 space-y-6">
              
              {/* Readiness Banner */}
              <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                <div className="p-6 pl-7">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h3 className="font-sora font-semibold text-[#0A192F] tracking-tight">NEEDS REVIEW</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                    Your packet requires attention before counselor review.
                  </p>
                  <ul className="space-y-3 mb-6 text-sm text-slate-700 font-medium">
                    <li className="flex items-start gap-2.5">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                      Confirm document type for file 1
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                      Upload missing bank statements
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                      Provide updated benefit letter
                    </li>
                  </ul>
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">
                      This is not an eligibility decision. Final determination is made by the housing authority.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action & Trust */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center space-y-5">
                <div>
                  <h3 className="font-sora font-semibold text-[#0A192F]">Application Packet</h3>
                  <p className="text-sm text-slate-500 mt-1 mb-4">Generate a structured summary.</p>
                </div>
                
                <button className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-[#0A192F] font-medium py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-teal-500 focus:outline-none focus:border-transparent">
                  <Download className="w-4 h-4 text-teal-600" />
                  Download packet
                </button>

                <div className="pt-5 border-t border-slate-100 flex items-start gap-3 text-left">
                  <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    <strong className="text-slate-700 font-medium block mb-0.5">Privacy Guaranteed</strong> 
                    Only 7 allowlisted fields extracted. Raw text never stored.
                  </p>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
