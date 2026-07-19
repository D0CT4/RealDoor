import { useGetPrograms } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ExternalLink, Info, Building, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Programs() {
  const { data: programs, isLoading, error } = useGetPrograms();
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="space-y-4">
          <h1 className="text-4xl font-serif font-bold text-foreground flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            {t("Housing Assistance Programs")}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
            {t("A complete directory of housing assistance programs available to New York City residents. Browse below to understand eligibility requirements and how to apply.")}
          </p>
        </div>

        {isLoading && (
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="bg-muted/20 pb-4">
                  <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                  <div className="h-4 bg-muted rounded w-4/6"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-6 rounded-lg border border-destructive/20 text-center">
            <AlertCircle className="h-10 w-10 mx-auto mb-4 opacity-80" />
            <h3 className="text-lg font-semibold">{t("Failed to load programs")}</h3>
            <p className="mt-2 text-sm opacity-80">{t("Please check your connection and try again.")}</p>
          </div>
        )}

        {programs && (
          <div className="grid gap-8">
            {programs.map(program => (
              <Card key={program.key} className="overflow-hidden border-t-4 border-t-secondary transition-shadow hover:shadow-md">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-muted/30 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Building className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="bg-white">{t(program.adminBody)}</Badge>
                      </div>
                      <CardTitle className="text-2xl mb-2">{t(program.name)}</CardTitle>
                      {program.amiThreshold && (
                        <div className="text-sm font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-md inline-block mt-3 border border-amber-200">
                          {t("AMI Limit: {threshold}", { threshold: program.amiThreshold })}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="md:w-2/3 p-6 flex flex-col">
                    <div className="space-y-4 flex-1">
                      <div>
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4" /> {t("About the Program")}
                        </h4>
                        <p className="text-foreground leading-relaxed">{t(program.description)}</p>
                      </div>
                      
                      <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/10">
                        <h4 className="font-semibold text-sm text-secondary mb-2">{t("Eligibility Summary")}</h4>
                        <p className="text-sm text-foreground/80">{t(program.eligibilitySummary)}</p>
                      </div>
                    </div>
                    
                    <div className="pt-6 mt-6 border-t flex justify-end">
                      <Button asChild>
                        <a href={program.applyUrl} target="_blank" rel="noopener noreferrer">
                          {t("Learn More & Apply")} <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
