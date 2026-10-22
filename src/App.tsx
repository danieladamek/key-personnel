import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from '@/components/Layout';
import { ThemeProvider } from '@/lib/theme';
import { NotepadProvider } from '@/lib/notepad-context';
import { TermDrawerProvider } from '@/components/ui/TermDrawer';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';

// Route-level code splitting keeps each surface light; KaTeX, the chart library and the search index load only where used.
const MapPage = lazy(() => import('@/pages/Map'));
const Stages = lazy(() => import('@/pages/Stages'));
const StagePage = lazy(() => import('@/pages/StagePage'));
const Constraints = lazy(() => import('@/pages/Constraints'));
const ConstraintPage = lazy(() => import('@/pages/ConstraintPage'));
const Levers = lazy(() => import('@/pages/Levers'));
const LeverPage = lazy(() => import('@/pages/LeverPage'));
const Gates = lazy(() => import('@/pages/Gates'));
const GatePage = lazy(() => import('@/pages/GatePage'));
const States = lazy(() => import('@/pages/States'));
const StatePage = lazy(() => import('@/pages/StatePage'));
const Enablers = lazy(() => import('@/pages/Enablers'));
const Benchmarks = lazy(() => import('@/pages/Benchmarks'));
const Controversies = lazy(() => import('@/pages/Controversies'));
const DecisionRecord = lazy(() => import('@/pages/DecisionRecord'));
const Changes = lazy(() => import('@/pages/Changes'));
const Read = lazy(() => import('@/pages/Read'));
const Glossary = lazy(() => import('@/pages/Glossary'));
const Concepts = lazy(() => import('@/pages/Concepts'));
const Concept = lazy(() => import('@/pages/Concept'));
const Notes = lazy(() => import('@/pages/Notes'));
const Figures = lazy(() => import('@/pages/Figures'));
const Figure = lazy(() => import('@/pages/Figure'));
const References = lazy(() => import('@/pages/References'));
const Methods = lazy(() => import('@/pages/Methods'));
const About = lazy(() => import('@/pages/About'));

const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function App() {
  return (
    <ThemeProvider>
      <NotepadProvider>
        <BrowserRouter basename={basename}>
          <TermDrawerProvider>
            <Layout>
              <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-12 bx-muted min-h-[80vh]" role="status">Loading…</div>}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/stages" element={<Stages />} />
                  <Route path="/stages/:id" element={<StagePage />} />
                  <Route path="/constraints" element={<Constraints />} />
                  <Route path="/constraints/:id" element={<ConstraintPage />} />
                  <Route path="/levers" element={<Levers />} />
                  <Route path="/levers/:id" element={<LeverPage />} />
                  <Route path="/gates" element={<Gates />} />
                  <Route path="/gates/:id" element={<GatePage />} />
                  <Route path="/states" element={<States />} />
                  <Route path="/states/:id" element={<StatePage />} />
                  <Route path="/enablers" element={<Enablers />} />
                  <Route path="/benchmarks" element={<Benchmarks />} />
                  <Route path="/controversies" element={<Controversies />} />
                  <Route path="/record" element={<DecisionRecord />} />
                  <Route path="/changes" element={<Changes />} />
                  <Route path="/read" element={<Read />} />
                  <Route path="/glossary" element={<Glossary />} />
                  <Route path="/concepts" element={<Concepts />} />
                  <Route path="/concepts/:id" element={<Concept />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/figures" element={<Figures />} />
                  <Route path="/figures/:id" element={<Figure />} />
                  <Route path="/references" element={<References />} />
                  <Route path="/methods" element={<Methods />} />
                  <Route path="/about" element={<About />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Layout>
          </TermDrawerProvider>
        </BrowserRouter>
      </NotepadProvider>
    </ThemeProvider>
  );
}
