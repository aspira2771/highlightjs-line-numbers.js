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
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center pb-3">
      <div className="pointer-events-auto mx-3 flex w-full max-w-md items-center justify-between rounded-card border border-line bg-surface/95 px-3 py-2 shadow-card backdrop-blur">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-0.5 rounded-soft py-1.5 text-[11px] font-medium transition',
                isActive ? 'text-primary' : 'text-muted',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  className={cn(isActive && 'animate-pop')}
                  strokeWidth={isActive ? 2.2 : 1.6}
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
