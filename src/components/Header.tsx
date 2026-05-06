import { useLocation } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { MENU_ITEMS } from '@/constants';

export const Header = () => {
  const location = useLocation();
  const currentItem = MENU_ITEMS.find((item) => item.path === location.pathname);
  const pageTitle = currentItem?.label || '首页';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <nav className="flex items-center text-sm text-gray-500">
          <span className="text-gray-400">首页</span>
          {pageTitle !== '首页' && (
            <>
              <span className="mx-2">/</span>
              <span className="text-gray-700 font-medium">{pageTitle}</span>
            </>
          )}
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
          <div className="w-8 h-8 bg-[#4a90d9] rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-gray-700">工作人员</span>
        </div>
      </div>
    </header>
  );
};
