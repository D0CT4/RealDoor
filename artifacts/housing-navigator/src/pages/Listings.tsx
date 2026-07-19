import { useGetListings, GetListingsBorough } from "@workspace/api-client-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Calendar, Users, Filter, DollarSign, ExternalLink, Home as HomeIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Listings() {
  const { t } = useLanguage();

  const [filters, setFilters] = useState({
    borough: "" as GetListingsBorough | "",
    bedrooms: "",
    maxRent: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    borough: undefined as GetListingsBorough | undefined,
    bedrooms: undefined as number | undefined,
    maxRent: undefined as number | undefined,
  });

  const { data: listings, isLoading, error } = useGetListings({
    borough: appliedFilters.borough,
    bedrooms: appliedFilters.bedrooms,
    maxRent: appliedFilters.maxRent
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedFilters({
      borough: filters.borough ? filters.borough : undefined,
      bedrooms: filters.bedrooms ? Number(filters.bedrooms) : undefined,
      maxRent: filters.maxRent ? Number(filters.maxRent) : undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": return <Badge variant="success">{t("Open")}</Badge>;
      case "lottery": return <Badge variant="warning">{t("Lottery")}</Badge>;
      case "waitlist": return <Badge variant="secondary">{t("Waitlist")}</Badge>;
      case "closed": return <Badge variant="destructive">{t("Closed")}</Badge>;
      default: return <Badge variant="outline">{t(status)}</Badge>;
    }
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="container mx-auto px-4 py-8 flex-1 flex flex-col md:flex-row gap-8">
      
      {/* Filters Sidebar */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="sticky top-24">
          <h2 className="text-xl font-serif font-bold flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5" /> {t("Filters")}
          </h2>
          
          <form onSubmit={handleSearch} className="space-y-5 bg-card border rounded-xl p-5 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="borough">{t("Borough")}</Label>
              <Select 
                id="borough"
                value={filters.borough}
                onChange={(e) => setFilters({...filters, borough: e.target.value as GetListingsBorough | ""})}
              >
                <option value="">{t("Any Borough")}</option>
                <option value="bronx">{t("Bronx")}</option>
                <option value="brooklyn">{t("Brooklyn")}</option>
                <option value="manhattan">{t("Manhattan")}</option>
                <option value="queens">{t("Queens")}</option>
                <option value="statenisland">{t("Staten Island")}</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bedrooms">{t("Bedrooms")}</Label>
              <Select 
                id="bedrooms"
                value={filters.bedrooms}
                onChange={(e) => setFilters({...filters, bedrooms: e.target.value})}
              >
                <option value="">{t("Any Size")}</option>
                <option value="0">{t("Studio")}</option>
                <option value="1">{t("1 Bedroom")}</option>
                <option value="2">{t("2 Bedrooms")}</option>
                <option value="3">{t("3 Bedrooms")}</option>
                <option value="4">{t("4+ Bedrooms")}</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxRent">{t("Max Rent ($)")}</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="maxRent"
                  type="number"
                  placeholder={t("e.g. 2000")}
                  className="pl-9"
                  value={filters.maxRent}
                  onChange={(e) => setFilters({...filters, maxRent: e.target.value})}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              <Search className="h-4 w-4 mr-2" /> {t("Apply Filters")}
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-6">
        <div className="flex justify-between items-end border-b pb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">{t("Affordable Listings")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("Find open lotteries, waitlists, and available units.")}
            </p>
          </div>
          {listings && (
            <div className="text-sm font-medium bg-muted px-3 py-1 rounded-full">
              {t("{count} results", { count: listings.length })}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl border p-6 flex flex-col md:flex-row gap-6 animate-pulse">
                <div className="w-full md:w-32 h-32 bg-muted rounded-lg shrink-0"></div>
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between">
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                    <div className="h-6 bg-muted rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="pt-4 flex justify-between">
                    <div className="h-8 bg-muted rounded w-24"></div>
                    <div className="h-8 bg-muted rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive bg-destructive/5 rounded-xl border border-destructive/20">
            <p>{t("Failed to load listings. Please try again.")}</p>
          </div>
        ) : listings?.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
            <HomeIcon className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-serif font-semibold text-foreground">{t("No listings found")}</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              {t("We couldn't find any listings matching your current filters. Try adjusting your search criteria or removing filters.")}
            </p>
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => {
                setFilters({ borough: "", bedrooms: "", maxRent: "" });
                setAppliedFilters({ borough: undefined, bedrooms: undefined, maxRent: undefined });
              }}
            >
              {t("Clear all filters")}
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {listings?.map(listing => (
              <Card key={listing.id} className="overflow-hidden transition-all hover:shadow-md border-transparent hover:border-primary/20 ring-1 ring-border">
                <div className="md:flex">
                  
                  {/* Info Section */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-medium">{t(capitalize(listing.borough))}</span>
                          {listing.neighborhood && (
                            <>
                              <span>•</span>
                              <span>{t(listing.neighborhood)}</span>
                            </>
                          )}
                        </div>
                        <CardTitle className="text-xl font-serif text-primary leading-tight">
                          {t(listing.name)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 truncate">{listing.address}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        {getStatusBadge(listing.status)}
                        {listing.deadline && (
                          <div className="text-xs text-muted-foreground mt-2 flex items-center justify-end gap-1">
                            <Calendar className="h-3 w-3" /> {t("Due: {deadline}", { deadline: listing.deadline })}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {listing.description && (
                      <p className="text-sm text-foreground/80 my-4 line-clamp-2 leading-relaxed">
                        {t(listing.description)}
                      </p>
                    )}
                    
                    <div className="mt-auto pt-4 flex flex-wrap gap-y-4 justify-between items-end border-t border-border/50">
                      <div className="flex gap-6">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> {t("Rent Range")}
                          </p>
                          <p className="font-semibold text-lg text-foreground">
                            ${listing.minRent} - ${listing.maxRent}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1 flex items-center gap-1">
                            <HomeIcon className="h-3 w-3" /> {t("Types")}
                          </p>
                          <p className="font-medium text-foreground">
                            {listing.bedroomTypes.map(b => b === 0 ? t("Studio") : t("{count} BR", { count: b })).join(", ")}
                          </p>
                        </div>
                        {listing.amiRange && (
                          <div className="hidden sm:block">
                            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1 flex items-center gap-1">
                              <Users className="h-3 w-3" /> {t("AMI Target")}
                            </p>
                            <p className="font-medium text-foreground">{listing.amiRange}</p>
                          </div>
                        )}
                      </div>
                      
                      <Button asChild variant="default" className="shrink-0 w-full sm:w-auto">
                        <a href={listing.applicationUrl} target="_blank" rel="noopener noreferrer">
                          {t("Apply Now")} <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
