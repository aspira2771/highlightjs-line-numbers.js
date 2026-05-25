import { NavLink } from 'react-router-dom';
import { Calendar, Heart, Home, Notebook, User } from 'lucide-react';
import { cn } from '@/utils/cn';

const tabs = [
  { to: '/', label: '홈', icon: Home },
  { to: '/records', label: '기록', icon: Notebook },
  { to: '/calendar', label: '캘린더', icon: Calendar },
  { to: '/community', label: '커뮤니티', icon: Heart },
  { to: '/mypet', label: '마이펫', icon: User },
];

export function BottomTab() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center border-t border-line bg-surface/95 backdrop-blur">
      <div className="flex w-full max-w-md items-center justify-between px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 rounded-soft py-1.5 text-[11px] font-semibold transition',
                isActive ? 'text-primary' : 'text-gray-400',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  className={cn(isActive && 'animate-pop')}
                  strokeWidth={isActive ? 2.4 : 2}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
