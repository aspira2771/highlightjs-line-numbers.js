import { Navigate, Route, Routes } from 'react-router-dom';
import { BottomTab } from '@/components/common/BottomTab';
import { HomePage } from '@/pages/Home';
import { CarePage } from '@/pages/Care';
import { WalkPage } from '@/pages/Walk';
import { CommunityPage } from '@/pages/Community';
import { MyPetPage } from '@/pages/MyPet';
import { useCareReminder } from '@/hooks/useCareReminder';

function App() {
  useCareReminder();

  return (
    <div className="app-shell relative">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/care" element={<CarePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/walk" element={<WalkPage />} />
        <Route path="/mypet" element={<MyPetPage />} />
        {/* Legacy routes → merged 케어 tab */}
        <Route path="/records" element={<Navigate to="/care" replace />} />
        <Route path="/calendar" element={<Navigate to="/care" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomTab />
    </div>
  );
}

export default App;
