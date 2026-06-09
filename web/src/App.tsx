import { Suspense, lazy, useState } from "react";

import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle, Skeleton } from "@/components/ui/misc";
import { useLang } from "@/i18n/LanguageProvider";
import { useData } from "@/lib/DataProvider";

const Overview = lazy(() => import("@/sections/Overview").then((m) => ({ default: m.Overview })));
const Model = lazy(() => import("@/sections/Model").then((m) => ({ default: m.Model })));
const Lagrangian = lazy(() =>
  import("@/sections/Lagrangian").then((m) => ({ default: m.Lagrangian })),
);
const Sqp = lazy(() => import("@/sections/Sqp").then((m) => ({ default: m.Sqp })));
const Comparison = lazy(() =>
  import("@/sections/Comparison").then((m) => ({ default: m.Comparison })),
);

export function App() {
  const { t, dir } = useLang();
  const { ok, error } = useData();
  const [tab, setTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main"
        className="sr-only rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-30"
      >
        {t.header.skipToContent}
      </a>
      <Header />
      <main id="main" className="mx-auto max-w-6xl px-4 py-6">
        {!ok ? (
          <Alert className="mb-4">
            <AlertTitle>{t.common.noData}</AlertTitle>
            <AlertDescription className="ltr-island">{error}</AlertDescription>
          </Alert>
        ) : null}

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList dir={dir} className="mb-6 w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">{t.nav.overview}</TabsTrigger>
            <TabsTrigger value="model">{t.nav.model}</TabsTrigger>
            <TabsTrigger value="lagrangian">{t.nav.lagrangian}</TabsTrigger>
            <TabsTrigger value="sqp">{t.nav.sqp}</TabsTrigger>
            <TabsTrigger value="comparison">{t.nav.comparison}</TabsTrigger>
          </TabsList>

          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <TabsContent value="overview">
              <Overview />
            </TabsContent>
            <TabsContent value="model">
              <Model />
            </TabsContent>
            <TabsContent value="lagrangian">
              <Lagrangian />
            </TabsContent>
            <TabsContent value="sqp">
              <Sqp />
            </TabsContent>
            <TabsContent value="comparison">
              <Comparison />
            </TabsContent>
          </Suspense>
        </Tabs>
      </main>
    </div>
  );
}
