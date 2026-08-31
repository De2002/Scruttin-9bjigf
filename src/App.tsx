import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { StreamProvider } from '@/stores/streamContext';
import AmbientBackground from '@/components/layout/AmbientBackground';
import BottomNav from '@/components/layout/BottomNav';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/auth/AuthPage';
import MusicPlayer from '@/components/features/MusicPlayer';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import StreamPage from '@/pages/StreamPage';
import DivePage from '@/pages/DivePage';
import ScrutinAsksPage from '@/pages/ScrutinAsksPage';
import FromTheCrowdPage from '@/pages/FromTheCrowdPage';
import StatementsPage from '@/pages/StatementsPage';
import TaggedPage from '@/pages/TaggedPage';
import MePage from '@/pages/MePage';
import ConversationPage from '@/pages/ConversationPage';
import AdminPage from '@/pages/admin/AdminPage';
import NotFound from '@/pages/NotFound';

function AppShell({ children }: { children: React.ReactNode }) {
  const [tracks, setTracks] = useState<{ id: string; title: string; artist?: string; url: string }[]>([]);
  useEffect(() => {
    supabase.from('music_tracks').select('id, title, artist, url').eq('is_active', true).then(({ data }) => setTracks(data ?? []));
  }, []);

  useEffect(() => {
    const syncOverlayState = () => {
      const sheetIsOpen = Boolean(document.querySelector('[data-sheet-overlay], [data-radix-dialog-content][data-state="open"], [data-radix-dialog-overlay][data-state="open"]'));
      document.documentElement.classList.toggle('sheet-active', sheetIsOpen);
    };
    syncOverlayState();
    const observer = new MutationObserver(syncOverlayState);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-state'] });
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove('sheet-active');
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-scruttin-base text-scruttin-text font-sans">
      <AmbientBackground />
      <MusicPlayer tracks={tracks} />
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
        <BottomNav />
      </div>
    </div>
  );
}

/** Auth gate — redirect to /auth if not signed in */
function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StreamProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: { background: 'rgba(20,20,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' },
            }}
          />
          <Routes>
            {/* Public landing */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Public browsing (read-only) */}
            <Route path="/stream" element={<AppShell><StreamPage /></AppShell>} />
            <Route path="/dive" element={<AppShell><DivePage /></AppShell>} />
            <Route path="/dive/scruttin-asks" element={<AppShell><ScrutinAsksPage /></AppShell>} />
            <Route path="/dive/crowd" element={<AppShell><FromTheCrowdPage /></AppShell>} />
            <Route path="/dive/statements" element={<AppShell><StatementsPage /></AppShell>} />
            <Route path="/conversation/:id" element={<AppShell><ConversationPage /></AppShell>} />
            <Route path="/questions/:id" element={<AppShell><ConversationPage /></AppShell>} />
            <Route path="/tagged" element={<AppShell><TaggedPage /></AppShell>} />
            <Route path="/open" element={<Navigate to="/tagged" replace />} />

            {/* Auth required */}
            <Route path="/me" element={<AppShell><Protected><MePage /></Protected></AppShell>} />
            <Route path="/admin" element={<Protected><AdminPage /></Protected>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </StreamProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
