import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelect } from "@/components/layout/LanguageSelect";
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCheckEligibility, EligibilityInputBorough, ProgramResultEligibility } from "@workspace/api-client-react";
import { HeartHandshake, Home as HomeIcon, AlertCircle, Building, CheckCircle2, ChevronRight, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export default function Home() {
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    monthlyIncome: "",
    householdSize: "1",
    monthlyRent: "",
    bedrooms: "1",
    borough: "brooklyn" as EligibilityInputBorough
  });

  const checkEligibility = useCheckEligibility();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.monthlyIncome || !formData.monthlyRent) return;
    
    checkEligibility.mutate({
      data: {
        monthlyIncome: Number(formData.monthlyIncome),
        householdSize: Number(formData.householdSize),
        monthlyRent: Number(formData.monthlyRent),
        bedrooms: Number(formData.bedrooms),
        borough: formData.borough,
      }
    });
  };

  const data = checkEligibility.data;
  
  const getBurdenColor = (percent: number) => {
    if (percent < 30) return "bg-success";
    if (percent <= 50) return "bg-warning";
    return "bg-destructive";
  };
  
  const getEligibilityBadgeVariant = (eligibility: ProgramResultEligibility) => {
    switch (eligibility) {
      case "likely_eligible": return "success";
      case "may_qualify": return "warning";
      case "income_likely_too_high": return "destructive";
      case "needs_review": return "secondary";
      default: return "outline";
    }
  };

  const getProgramIcon = (key: string) => {
    switch (key) {
      case "section8": return <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">S8</div>;
      case "nycha": return <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">NY</div>;
      case "cityfheps": return <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">CF</div>;
      case "housing_connect": return <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">HC</div>;
      default: return <Building className="w-8 h-8 text-muted-foreground" />;
    }
  };

  return (
    <div className="w-full flex-1">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-sm mb-2 backdrop-blur">
              <span className="flex h-2 w-2 rounded-full bg-success mr-2"></span>
              {t("Multilingual Assistance Tool")}
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
              {t("home.hero.title")}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl">
              {t("home.hero.subtitle")}
            </p>
            
            <div className="pt-4 flex items-center justify-center md:justify-start gap-4">
              <span className="text-sm font-medium">Language / Idioma:</span>
              <LanguageSelect onDark />
            </div>
          </div>
          
          <div className="w-full max-w-md">
            <Card className="shadow-2xl border-0">
              <CardHeader className="bg-muted/30 pb-4 border-b">
                <CardTitle className="text-xl">{t("home.form.submit")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monthlyIncome">{t("home.form.income")}</Label>
                      <Input 
                        id="monthlyIncome"
                        type="number" 
                        min="0"
                        required
                        value={formData.monthlyIncome}
                        onChange={(e) => setFormData({...formData, monthlyIncome: e.target.value})}
                        placeholder="e.g. 4000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyRent">{t("home.form.rent")}</Label>
                      <Input 
                        id="monthlyRent"
                        type="number" 
                        min="0"
                        required
                        value={formData.monthlyRent}
                        onChange={(e) => setFormData({...formData, monthlyRent: e.target.value})}
                        placeholder="e.g. 1500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="householdSize">{t("home.form.size")}</Label>
                      <Select 
                        id="householdSize"
                        value={formData.householdSize}
                        onChange={(e) => setFormData({...formData, householdSize: e.target.value})}
                      >
                        {[1,2,3,4,5,6].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">{t("home.form.bedrooms")}</Label>
                      <Select 
                        id="bedrooms"
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                      >
                        <option value="0">{t("bedrooms.studio")}</option>
                        <option value="1">{t("bedrooms.1")}</option>
                        <option value="2">{t("bedrooms.2")}</option>
                        <option value="3">{t("bedrooms.3")}</option>
                        <option value="4">{t("bedrooms.4")}</option>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pb-2">
                    <Label htmlFor="borough">{t("home.form.borough")}</Label>
                    <Select 
                      id="borough"
                      value={formData.borough}
                      onChange={(e) => setFormData({...formData, borough: e.target.value as EligibilityInputBorough})}
                    >
                      <option value="bronx">{t("borough.bronx")}</option>
                      <option value="brooklyn">{t("borough.brooklyn")}</option>
                      <option value="manhattan">{t("borough.manhattan")}</option>
                      <option value="queens">{t("borough.queens")}</option>
                      <option value="statenisland">{t("borough.statenisland")}</option>
                    </Select>
                  </div>
                  
                  <Button type="submit" className="w-full text-lg h-12" disabled={checkEligibility.isPending}>
                    {checkEligibility.isPending ? t("home.form.loading") : t("home.form.submit")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <div id="results" className="container mx-auto px-4 py-16 scroll-mt-16">
        {checkEligibility.isPending ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground font-medium">{t("home.form.loading")}</p>
          </div>
        ) : data ? (
          <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-700">
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-bold text-foreground mb-2">{t("home.results.title")}</h2>
              <div className="h-1 w-20 bg-secondary mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Burden Status */}
              <Card className="border-t-4 border-t-primary shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    {t("home.results.burden_title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-serif font-bold tracking-tighter">
                      {data.burdenPercent.toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground mb-1 block">of income</span>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Gauge */}
                    <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex">
                      <div className="bg-success h-full" style={{ width: '30%' }}></div>
                      <div className="bg-warning h-full" style={{ width: '20%' }}></div>
                      <div className="bg-destructive h-full" style={{ width: '50%' }}></div>
                    </div>
                    {/* Pointer */}
                    <div className="relative w-full h-2">
                      <div 
                        className="absolute top-0 -ml-2 w-4 h-4 rounded-full bg-foreground border-2 border-background shadow-sm transition-all duration-1000"
                        style={{ left: `${Math.min(data.burdenPercent, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs font-medium text-muted-foreground pt-2">
                      <span className="text-success">{t("home.results.burden_affordable")}</span>
                      <span className="text-warning">{t("home.results.burden_burdened")}</span>
                      <span className="text-destructive">{t("home.results.burden_severe")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FMR Comparison */}
              <Card className="border-t-4 border-t-secondary shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-muted-foreground" />
                    {t("home.results.fmr_title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {t("home.results.fmr_desc", { 
                      bedrooms: formData.bedrooms === "0" ? t("bedrooms.studio") : formData.bedrooms, 
                      borough: t(`borough.${formData.borough}`),
                      fmr: data.fmr, 
                      rent: formData.monthlyRent 
                    })}
                  </p>
                  
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Your Rent</span>
                        <span className="font-semibold">${formData.monthlyRent}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min((Number(formData.monthlyRent) / Math.max(data.fmr, Number(formData.monthlyRent))) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Fair Market Rent</span>
                        <span className="font-semibold">${data.fmr}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="bg-secondary h-full rounded-full" style={{ width: `${Math.min((data.fmr / Math.max(data.fmr, Number(formData.monthlyRent))) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Programs Timeline */}
            <div className="bg-card rounded-xl border p-8 shadow-sm">
              <h3 className="text-2xl font-serif font-bold mb-8 flex items-center gap-3">
                <CheckCircle2 className="text-success h-6 w-6" />
                {t("home.programs.title")}
              </h3>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
                {data.programs.map((prog, index) => (
                  <div key={prog.key} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Marker */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 overflow-hidden">
                      {getProgramIcon(prog.key)}
                    </div>
                    
                    {/* Card */}
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-background shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h4 className="font-bold text-lg font-serif">{prog.name}</h4>
                        <Badge variant={getEligibilityBadgeVariant(prog.eligibility)} className="whitespace-nowrap">
                          {t(`home.programs.${prog.eligibility}`)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-2">
                        {prog.description}
                      </p>
                      <div className="flex items-center justify-between">
                        {prog.notes && <span className="text-xs text-muted-foreground italic">{prog.notes}</span>}
                        <Button variant="ghost" size="sm" className="ml-auto text-primary hover:text-primary hover:bg-primary/5" asChild>
                          <a href={prog.applyUrl} target="_blank" rel="noopener noreferrer">
                            {t("home.programs.apply")} <ChevronRight className="h-4 w-4 ml-1" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contacts CTA */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-8 text-center space-y-4">
              <HeartHandshake className="h-12 w-12 text-destructive mx-auto" />
              <h3 className="text-2xl font-serif font-bold text-foreground">{t("home.contacts.title")}</h3>
              <p className="text-muted-foreground max-w-lg mx-auto">
                {t("home.contacts.desc")}
              </p>
              <Button variant="destructive" size="lg" className="mt-4">
                {t("home.contacts.link")}
              </Button>
            </div>
            
          </div>
        ) : (
          <div className="max-w-3xl mx-auto text-center py-20 opacity-50">
            <HomeIcon className="h-24 w-24 mx-auto text-muted-foreground mb-6 opacity-20" />
            <h2 className="text-2xl font-serif text-muted-foreground">{t("Fill out the form above to see your customized rent analysis and eligible programs.")}</h2>
          </div>
        )}
      </div>
    </div>
  );
}
