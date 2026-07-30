import React from 'react';
import { Page } from '../types';
import { LayoutDashboard, Dumbbell, Utensils, Sparkles, BookOpen, Heart, Database, Settings, Menu, X } from 'lucide-react';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  onOpenBackup?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  currentPage, 
  onNavigate, 
  isMobileOpen, 
  setIsMobileOpen,
  onOpenBackup
}) => {
  
  const navItems = [
    { page: Page.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
    { page: Page.WORKOUTS, icon: Dumbbell, label: 'Workouts' },
    { page: Page.NUTRITION, icon: Utensils, label: 'Nutrition' },
    { page: Page.LIBRARY, icon: BookOpen, label: 'Exercise Library' },
    { page: Page.COACH, icon: Sparkles, label: 'AI Coach' },
  ];

  const handleNavClick = (page: Page) => {
    onNavigate(page);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md z-50 px-4 py-2.5 flex items-center justify-between shadow-sm border-b border-pink-100">
         <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavClick(Page.DASHBOARD)}>
            <div className="bg-gradient-to-br from-pink-400 to-purple-500 p-2 rounded-xl shadow-md shadow-pink-200">
                <Heart className="w-5 h-5 text-white fill-white animate-pulse" />
            </div>
            <div>
                <h1 className="text-xl font-black tracking-tight text-slate-800 leading-none">
                Pow<span className="text-pink-500">HER</span>
                </h1>
                <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Lifts & Lifestyle</p>
            </div>
         </div>

         <div className="flex items-center gap-1">
            {onOpenBackup && (
              <button 
                onClick={onOpenBackup}
                className="p-2 text-slate-600 hover:text-pink-500 transition-colors rounded-full hover:bg-pink-50"
                title="Backup & Settings"
              >
                <Database className="w-5 h-5 text-pink-500" />
              </button>
            )}
            <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 text-slate-600 hover:text-pink-500 transition-colors">
                {isMobileOpen ? <X /> : <Menu />}
            </button>
         </div>
      </div>

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white/90 backdrop-blur-xl shadow-2xl shadow-pink-100/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:shadow-none lg:bg-transparent lg:border-r border-pink-100
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="hidden lg:flex items-center gap-3 px-2 mb-8 cursor-pointer group" onClick={() => handleNavClick(Page.DASHBOARD)}>
            <div className="bg-gradient-to-br from-pink-400 to-purple-500 p-2.5 rounded-2xl shadow-lg shadow-pink-200 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-800">
                Pow<span className="text-pink-500">HER</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Lifts & Lifestyle</p>
            </div>
          </div>
          
          <div className="mt-4 lg:mt-0 flex-1 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleNavClick(item.page)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group font-bold ${
                  currentPage === item.page
                    ? 'bg-gradient-to-r from-pink-50 to-purple-50 text-pink-600 shadow-sm border border-pink-100'
                    : 'text-slate-500 hover:bg-pink-50 hover:text-pink-500'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${currentPage === item.page ? 'text-pink-500' : 'text-slate-300 group-hover:text-pink-400'}`} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-pink-50 space-y-3">
             <div className="bg-gradient-to-br from-pink-500 to-rose-400 rounded-3xl p-5 text-white shadow-xl shadow-pink-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                <h4 className="font-bold relative z-10 text-sm">Offline Storage Active</h4>
                <p className="text-[11px] text-pink-100 mt-1 relative z-10 opacity-90">Your workout data is stored safely on device.</p>
                <div className="mt-3 flex items-center justify-between relative z-10">
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">v1.2.0</span>
                  {onOpenBackup && (
                    <button 
                      onClick={onOpenBackup}
                      className="bg-white text-pink-600 text-xs font-bold py-1.5 px-3 rounded-full shadow-sm hover:bg-pink-50 transition-colors"
                    >
                      Backup & Settings
                    </button>
                  )}
                </div>
             </div>
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-purple-900/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;
