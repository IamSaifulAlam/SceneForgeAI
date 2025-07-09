import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GenerationsChart, LanguagePieChart } from "@/components/admin/analytics-charts";
import { BarChart3, Languages, Clapperboard, Sparkles, Users } from "lucide-react";
import * as AnalyticsService from '@/services/analytics-service';

export default async function AnalyticsPage() {
  // Fetch all data in parallel
  const [
    overview,
    weeklyGenerations,
    languageDistribution,
    favoriteVisualStyle
  ] = await Promise.all([
    AnalyticsService.getAnalyticsOverview(),
    AnalyticsService.getWeeklyGenerations(),
    AnalyticsService.getLanguageDistribution(),
    AnalyticsService.getFavoriteVisualStyle()
  ]);

  const chartConfig = {
    generations: { label: "Generations", color: "hsl(var(--primary))" },
    ...languageDistribution.reduce((acc, lang) => {
      acc[lang.name.toLowerCase()] = { label: lang.label, color: `hsl(var(--chart-${lang.chartColor}))` };
      return acc;
    }, {} as any)
  };
  
  const mostPopularLanguage = languageDistribution.length > 0 ? languageDistribution[0] : { name: 'N/A', label: 'N/A', value: 0 };

  return (
    <div className="flex-1 space-y-4">
       <div className="border-b pb-4">
         <h1 className="text-3xl font-bold tracking-tighter font-headline">Analytics Dashboard</h1>
         <p className="text-muted-foreground">An overview of user engagement and content trends.</p>
       </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
                  <Clapperboard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{overview.totalGenerations.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Total scenes generated
                  </p>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Most Popular Language</CardTitle>
                  <Languages className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{mostPopularLanguage.label}</div>
                  <p className="text-xs text-muted-foreground">
                    {mostPopularLanguage.value}% of all prompts
                  </p>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Favorite Visual Style</CardTitle>
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{favoriteVisualStyle.name}</div>
                   <p className="text-xs text-muted-foreground">
                    Used in {favoriteVisualStyle.count} generations
                   </p>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                   <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{overview.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Total unique users this session
                  </p>
              </CardContent>
          </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
              <CardHeader>
                  <CardTitle>Generations This Week</CardTitle>
                  <CardDescription>A look at the total scenes generated each day.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                  <GenerationsChart data={weeklyGenerations} config={chartConfig} />
              </CardContent>
          </Card>
          <Card className="lg:col-span-3">
              <CardHeader>
                  <CardTitle>Language Distribution</CardTitle>
                  <CardDescription>The breakdown of prompt languages used.</CardDescription>
              </CardHeader>
              <CardContent>
                  <LanguagePieChart data={languageDistribution} config={chartConfig} />
              </CardContent>
          </Card>
      </div>
    </div>
  )
}
