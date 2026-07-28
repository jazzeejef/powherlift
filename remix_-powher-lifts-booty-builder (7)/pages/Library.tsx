import React from 'react';
import ExerciseLibrary from '../components/ExerciseLibrary';
import { Page } from '../types';
import { LayoutDashboard, BookOpen } from 'lucide-react';

interface LibraryPageProps {
  onNavigate: (page: Page) => void;
}

const Library: React.FC<LibraryPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 flex-shrink-0">
           <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Exercise Library</h2>
              <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                 <BookOpen className="w-4 h-4 text-purple-400" /> Browse exercises, learn proper form.
              </p>
           </div>
           <button 
                onClick={() => onNavigate(Page.DASHBOARD)}
                className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 px-5 py-3 rounded-2xl font-bold transition-all shadow-sm"
            >
                <LayoutDashboard className="w-5 h-5" />
                <span className="hidden sm:inline">Dashboard</span>
            </button>
       </div>

       <div className="flex-1 min-h-0 bg-white rounded-[2.5rem] shadow-xl shadow-pink-100/50 overflow-hidden border border-pink-50">
          <ExerciseLibrary className="h-full rounded-none shadow-none border-none" />
       </div>
    </div>
  );
};

export default Library;