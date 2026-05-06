import { NavLink } from 'react-router-dom';
import { 
  Home, 
  CalendarPlus, 
  ClipboardList, 
  FileSpreadsheet, 
  BarChart3, 
  GraduationCap, 
  Settings 
} from 'lucide-react';
import { MENU_ITEMS } from '@/constants';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  CalendarPlus,
  ClipboardList,
  FileSpreadsheet,
  BarChart3,
  GraduationCap,
  Settings,
};

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-[#1e3a5f] text-white flex flex-col shadow-lg z-50">
      <div className="p-4 border-b border-white/10">
        <h1 className="text-lg font-bold tracking-wide">街道工作管理系统</h1>
        <p className="text-xs text-white/60 mt-1">Street Work System</p>
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {MENU_ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-white/20 text-white font-medium'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    )
                  }
                >
                  {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-white/50 text-center">
          © 2024 街道工作管理系统
        </p>
      </div>
    </aside>
  );
};
