import { Navigate, Route, Routes } from 'react-router-dom';
import { BottomTab } from '@/components/common/BottomTab';
import { HomePage } from '@/pages/Home';
import { RecordsPage } from '@/pages/Records';
import { CalendarPage } from '@/pages/Calendar';
import { CommunityPage } from '@/pages/Community';
import { MyPetPage } from '@/pages/MyPet';
import { useCareReminder } from '@/hooks/useCareReminder';

function App() {
  useCareReminder();

  return (
    <div className="app-shell relative">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/mypet" element={<MyPetPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomTab />
    </div>
  );
}

export default App;
