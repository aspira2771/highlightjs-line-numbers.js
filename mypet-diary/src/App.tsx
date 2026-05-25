import { useEffect, lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { BottomTab } from '@/components/common/BottomTab';
import { LoginPage } from '@/features/auth/LoginPage';
import { useAuthStore, initAuth } from '@/stores/authStore';
import { useCareReminder } from '@/hooks/useCareReminder';

// Code-split the tab pages so heavy deps (Leaflet, Recharts) load on demand.
const HomePage = lazy(() =>
  import('@/pages/Home').then((m) => ({ default: m.HomePage })),
);
const RecordsPage = lazy(() =>
  import('@/pages/Records').then((m) => ({ default: m.RecordsPage })),
);
const CalendarPage = lazy(() =>
  import('@/pages/Calendar').then((m) => ({ default: m.CalendarPage })),
);
const CommunityPage = lazy(() =>
  import('@/pages/Community').then((m) => ({ default: m.CommunityPage })),
);
const MyPetPage = lazy(() =>
  import('@/pages/MyPet').then((m) => ({ default: m.MyPetPage })),
);

function Splash() {
  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-surface text-4xl">
      <span className="animate-bounceSoft">🐾</span>
    </div>
  );
}

function App() {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);

  useEffect(() => {
    initAuth();
  }, []);

  useCareReminder();

  // Brief splash while the initial session check runs.
  if (!initialized) return <Splash />;

  // Login is the first screen; pet care starts only after sign-in.
  if (!user) return <LoginPage />;

  return (
    <div className="app-shell relative">
      <Suspense fallback={<Splash />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/mypet" element={<MyPetPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <BottomTab />
    </div>
  );
}

export default App;
