import React from "react";
import { 
  CheckCircle, 
  UploadCloud, 
  FileText, 
  File, 
  AlertCircle, 
  Clock, 
  Download,
  Info,
  ChevronRight,
  Shield,
  Edit2,
  Trash2,
  Globe,
  Check
} from "lucide-react";

export function ModernEditorial() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2825] selection:bg-[#E8D1CB] selection:text-[#2C2825] pb-24" style={{ fontFamily: "'Onest', sans-serif" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600&family=Sora:wght@400;500;600;700&display=swap');
        .font-sora { font-family: 'Sora', sans-serif; }
      `}} />
      
      {/* Header */}
      <header className="px-6 py-4 border-b border-[#EAE6DF] bg-white/70 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C65D47] text-white flex items-center justify-center font-sora font-bold text-sm shadow-sm">
              R
            </div>
            <div className="flex flex-col">
              <span className="font-sora font-bold text-lg leading-tight tracking-tight text-[#1A1816]">RealDoor</span>
              <span className="text-[10px] font-semibold text-[#8A837A] uppercase tracking-widest">Application Copilot</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-1 bg-[#F5F2EC] p-1 rounded-full border border-[#EAE6DF]">
            <button className="px-5 py-1.5 bg-white text-[#2C2825] rounded-full text-sm font-medium shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              Apply
            </button>
            <button className="px-5 py-1.5 text-[#7A746B] hover:text-[#2C2825] rounded-full text-sm font-medium transition-colors">
              Understand
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <button className="flex items-center gap-1.5 text-sm font-medium text-[#7A746B] hover:text-[#2C2825] transition-colors">
            <Globe className="w-4 h-4" />
            <span>English</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#EAE6DF] border-2 border-white flex items-center justify-center text-xs font-semibold text-[#5A544C] shadow-sm">
            MG
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Stepper / Progress */}
        <div className="mb-14">
          <h1 className="font-sora text-[2.5rem] font-semibold mb-10 text-[#1A1816] tracking-tight">
            Maria's Application
          </h1>
          
          <div className="flex items-center w-full max-w-2xl">
            {[
              { label: "Profile", status: "complete" },
              { label: "Documents", status: "current" },
              { label: "Review", status: "upcoming" },
              { label: "Submit", status: "upcoming" }
            ].map((step, idx, arr) => (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center relative z-10 group">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-medium text-sm transition-all duration-300 ${
                    step.status === "complete" ? "bg-[#4A6E53] text-white shadow-sm" :
                    step.status === "current" ? "bg-[#C65D47] text-white ring-4 ring-[#C65D47]/10 shadow-sm scale-110" :
                    "bg-white border border-[#DEDACD] text-[#8A837A]"
                  }`}>
                    {step.status === "complete" ? <Check className="w-4 h-4" /> : (idx + 1)}
                  </div>
                  <span className={`absolute top-12 text-[13px] font-medium whitespace-nowrap transition-colors ${
                    step.status === "current" ? "text-[#C65D47]" : 
                    step.status === "complete" ? "text-[#4A6E53]" : "text-[#8A837A]"
                  }`}>
                    {step.label}
                  </span>
                </div>
                {idx < arr.length - 1 && (
                  <div className="flex-1 flex items-center px-2">
                    <div className={`w-full h-[2px] rounded-full transition-colors ${
                      step.status === "complete" ? "bg-[#4A6E53]" : "bg-[#EAE6DF]"
                    }`} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Extraction & Files */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Extraction Section */}
            <section className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-[#F2EFEB]">
              <div className="mb-8">
                <h2 className="font-sora text-2xl font-semibold mb-2 text-[#1A1816]">Document Extraction</h2>
                <p className="text-[#7A746B] text-[15px] leading-relaxed">
                  Upload your pay stubs and ID. We'll securely read the required fields to prepare your packet automatically.
                </p>
              </div>

              {/* Upload Zone */}
              <div className="border-2 border-dashed border-[#DEDACD] bg-[#FDFCFB] rounded-[1.5rem] p-10 text-center hover:border-[#C65D47] hover:bg-[#FFF8F6] transition-all duration-300 cursor-pointer group">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#F2EFEB] group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud className="w-6 h-6 text-[#C65D47]" />
                </div>
                <p className="font-semibold text-[#2C2825] mb-1.5 text-[15px]">Drag and drop your files here</p>
                <p className="text-[13px] text-[#8A837A] mb-6">Accepts PDF, DOCX, JPG, PNG up to 10MB</p>
                <button className="px-6 py-2.5 bg-white border border-[#DEDACD] text-[#2C2825] text-[13px] font-semibold rounded-full shadow-sm hover:border-[#C65D47] hover:text-[#C65D47] transition-colors">
                  Browse files
                </button>
              </div>

              {/* File Chips */}
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-3 bg-[#FDFBF7] px-4 py-2.5 rounded-xl text-sm border border-[#EAE6DF] hover:border-[#DEDACD] transition-colors">
                  <FileText className="w-4 h-4 text-[#C65D47]" />
                  <span className="font-medium text-[#2C2825] max-w-[140px] truncate">Maria_Paystub_Oct.pdf</span>
                  <button className="text-[#8A837A] hover:text-[#C65D47] transition-colors ml-2"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center gap-3 bg-[#FDFBF7] px-4 py-2.5 rounded-xl text-sm border border-[#EAE6DF] hover:border-[#DEDACD] transition-colors">
                  <File className="w-4 h-4 text-[#C65D47]" />
                  <span className="font-medium text-[#2C2825] max-w-[140px] truncate">ID_Front_Scan.jpg</span>
                  <button className="text-[#8A837A] hover:text-[#C65D47] transition-colors ml-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="mt-10 flex justify-end border-t border-[#F2EFEB] pt-6">
                <button className="px-7 py-3.5 bg-[#C65D47] text-white font-semibold rounded-full shadow-[0_4px_14px_rgba(198,93,71,0.25)] hover:bg-[#B3523E] hover:shadow-[0_6px_20px_rgba(198,93,71,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2 text-[15px]">
                  Extract Fields
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </section>

            {/* Extracted Fields Review */}
            <section className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-[#F2EFEB]">
              <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row mb-8">
                <div>
                  <h3 className="font-sora text-xl font-semibold mb-1 text-[#1A1816]">Extracted Details</h3>
                  <p className="text-[#7A746B] text-[15px]">Review what we found in your documents.</p>
                </div>
                <div className="px-3.5 py-1.5 bg-[#ECF4E8] text-[#3D663C] text-[13px] font-semibold rounded-full flex items-center gap-1.5 shrink-0 border border-[#D5E6CF]">
                  <CheckCircle className="w-4 h-4" />
                  Processed
                </div>
              </div>

              <div className="overflow-hidden border border-[#EAE6DF] rounded-2xl bg-[#FDFCFB]">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-[#F5F2EC]/50 border-b border-[#EAE6DF]">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-[#5A544C] w-1/3">Field</th>
                      <th className="px-5 py-4 font-semibold text-[#5A544C] w-1/3">Value</th>
                      <th className="px-5 py-4 font-semibold text-[#5A544C]">Confidence</th>
                      <th className="px-5 py-4 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2EFEB] bg-white">
                    {[
                      { field: "Applicant Name", value: "Maria Gonzalez", conf: "High", confStyle: "text-[#3D663C] bg-[#ECF4E8] border-[#D5E6CF]" },
                      { field: "Employer", value: "Acme Staffing LLC", conf: "High", confStyle: "text-[#3D663C] bg-[#ECF4E8] border-[#D5E6CF]" },
                      { field: "Gross Pay", value: "$2,150.00", conf: "High", confStyle: "text-[#3D663C] bg-[#ECF4E8] border-[#D5E6CF]" },
                      { field: "Pay Frequency", value: "Biweekly", conf: "Medium", confStyle: "text-[#A66E24] bg-[#FFF4E5] border-[#F2DFBA]" },
                      { field: "Pay Date", value: "Oct 15, 2023", conf: "High", confStyle: "text-[#3D663C] bg-[#ECF4E8] border-[#D5E6CF]" },
                      { field: "Document Date", value: "Oct 15, 2023", conf: "High", confStyle: "text-[#3D663C] bg-[#ECF4E8] border-[#D5E6CF]" },
                      { field: "Document Type", value: "Pay Stub", conf: "Low", confStyle: "text-[#C65D47] bg-[#FFF0ED] border-[#FADCD5]" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-[#FDFBF7] transition-colors group">
                        <td className="px-5 py-4 font-medium text-[#1A1816]">{row.field}</td>
                        <td className="px-5 py-4 text-[#5A544C] font-medium">{row.value}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase border ${row.confStyle}`}>
                            {row.conf}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button className="text-[#8A837A] hover:text-[#C65D47] bg-white border border-[#EAE6DF] hover:border-[#C65D47] p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

          </div>

          {/* Right Column: Readiness & Checklist */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Readiness Banner */}
            <div className="bg-gradient-to-br from-[#FFF8ED] to-[#FFF4E5] rounded-[2rem] p-8 border border-[#F2DFBA] relative overflow-hidden shadow-[0_8px_30px_rgb(229,170,66,0.08)]">
              {/* Decorative blur blob */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#E5AA42] rounded-full blur-[60px] opacity-[0.15] -mr-10 -mt-10 pointer-events-none"></div>
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#F2DFBA] flex items-center justify-center shrink-0 shadow-sm">
                  <AlertCircle className="w-6 h-6 text-[#D48A1B]" />
                </div>
                <div>
                  <h3 className="font-sora text-[22px] font-bold text-[#8C6219] mb-2 tracking-tight">Needs Review</h3>
                  <p className="text-[#A67B27] text-[15px] mb-5 leading-relaxed font-medium">
                    You have 2 missing documents and 1 expired document before your application packet is ready.
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/60 rounded-lg border border-[#F2DFBA]/50">
                    <Info className="w-3.5 h-3.5 text-[#B88E3B]" />
                    <p className="text-[11px] font-bold text-[#B88E3B] uppercase tracking-widest">
                      Not an eligibility decision
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist Timeline */}
            <section className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-[#F2EFEB]">
              <h3 className="font-sora text-xl font-semibold mb-8 text-[#1A1816]">Required Documents</h3>
              
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute top-2 bottom-6 left-2.5 w-px bg-[#EAE6DF]"></div>

                <div className="space-y-7">
                  {[
                    { title: "Photo ID", desc: "Government issued, front and back", status: "complete", date: "Verified today" },
                    { title: "Social Security Cards", desc: "For all household members", status: "complete", date: "Verified yesterday" },
                    { title: "Pay Stubs", desc: "Last 4 consecutive stubs", status: "complete", date: "Verified today" },
                    { title: "Employment Letter", desc: "Signed by HR or Manager", status: "missing", date: "Required" },
                    { title: "Bank Statements", desc: "Last 2 months of all accounts", status: "expired", date: "Expired 3 days ago" },
                    { title: "Benefit Award Letter", desc: "SNAP, SSI, or TANF if applicable", status: "missing", date: "Required if applicable" }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 relative group">
                      <div className="shrink-0 bg-white z-10 pt-1">
                        {item.status === "complete" ? (
                          <div className="w-5 h-5 rounded-full bg-[#4A6E53] flex items-center justify-center ring-4 ring-white shadow-sm">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        ) : item.status === "missing" ? (
                          <div className="w-5 h-5 rounded-full border-2 border-dashed border-[#DEDACD] bg-[#FDFBF7] ring-4 ring-white"></div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#E5AA42] flex items-center justify-center ring-4 ring-white shadow-sm">
                            <Clock className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-semibold text-[15px] transition-colors ${item.status === 'missing' ? 'text-[#7A746B]' : 'text-[#1A1816]'}`}>
                            {item.title}
                          </h4>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${
                            item.status === 'complete' ? 'bg-[#ECF4E8] text-[#3D663C] border-[#D5E6CF]' :
                            item.status === 'expired' ? 'bg-[#FFF4E5] text-[#A66E24] border-[#F2DFBA]' :
                            'bg-[#F5F2EC] text-[#8A837A] border-[#EAE6DF]'
                          }`}>
                            {item.status === 'complete' ? 'Complete' : item.status === 'expired' ? 'Expired' : 'Missing'}
                          </span>
                        </div>
                        <p className="text-[13px] text-[#7A746B] mb-1.5 leading-snug">{item.desc}</p>
                        <p className={`text-[12px] font-medium ${item.status === 'expired' ? 'text-[#D48A1B]' : 'text-[#A8A29A]'}`}>
                          {item.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Actions & Trust */}
            <section className="pt-2">
              <button className="w-full py-4 bg-white border border-[#EAE6DF] text-[#1A1816] font-semibold rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#C65D47] hover:text-[#C65D47] hover:shadow-[0_4px_12px_rgba(198,93,71,0.08)] transition-all flex items-center justify-center gap-2 group mb-6 text-[15px]">
                <Download className="w-4 h-4 text-[#8A837A] group-hover:text-[#C65D47] transition-colors" />
                Download Current Packet
              </button>
              
              <div className="flex items-start gap-3 px-3 p-4 bg-[#FDFBF7] rounded-xl border border-[#F2EFEB]">
                <Shield className="w-4 h-4 shrink-0 text-[#C65D47]" />
                <p className="text-[13px] text-[#7A746B] leading-relaxed font-medium">
                  Only 7 allowlisted fields extracted. Raw text and images are never stored on our servers.{' '}
                  <a href="#" className="text-[#C65D47] hover:text-[#B3523E] underline decoration-[#FADCD5] hover:decoration-[#C65D47] transition-colors">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
