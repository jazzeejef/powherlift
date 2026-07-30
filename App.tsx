import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import Nutrition from './pages/Nutrition';
import AICoach from './pages/AICoach';
import Library from './pages/Library';
import { BackupModal } from './components/BackupModal';
import { Page, Workout, DailyNutrition, WeightEntry } from './types';
import { storageService } from './services/storageService';
import { RefreshCw, Heart } from 'lucide-react';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Persistence States
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [nutritionHistory, setNutritionHistory] = useState<DailyNutrition[]>([]);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  
  const [isHydrated, setIsHydrated] = useState(false);
  const [hydrationError, setHydrationError] = useState<string | null>(null);

  // Map URL pathname to Page enum
  const getPageFromPath = (pathname: string): Page => {
    if (pathname.startsWith('/workouts') || pathname.startsWith('/workout') || pathname.startsWith('/history')) {
      return Page.WORKOUTS;
    }
    if (pathname.startsWith('/nutrition')) {
      return Page.NUTRITION;
    }
    if (pathname.startsWith('/library')) {
      return Page.LIBRARY;
    }
    if (pathname.startsWith('/coach')) {
      return Page.COACH;
    }
    return Page.DASHBOARD;
  };

  const currentPage = getPageFromPath(location.pathname);

  const handleNavigate = (page: Page) => {
    switch (page) {
      case Page.WORKOUTS:
        navigate('/workouts');
        break;
      case Page.NUTRITION:
        navigate('/nutrition');
        break;
      case Page.LIBRARY:
        navigate('/library');
        break;
      case Page.COACH:
        navigate('/coach');
        break;
      case Page.DASHBOARD:
      default:
        navigate('/dashboard');
        break;
    }
  };

  // Hydrate states from IndexedDB / localStorage on startup
  const hydrateAppData = useCallback(async () => {
    try {
      setHydrationError(null);
      const [savedWorkouts, savedNutrition, savedWeight] = await Promise.all([
        storageService.getItem<Workout[]>('powher_workouts', []),
        storageService.getItem<DailyNutrition[]>('powher_nutrition_history', []),
        storageService.getItem<WeightEntry[]>('powher_weight_history', [])
      ]);

      setWorkouts(Array.isArray(savedWorkouts) ? savedWorkouts : []);
      setNutritionHistory(Array.isArray(savedNutrition) ? savedNutrition : []);
      setWeightHistory(Array.isArray(savedWeight) ? savedWeight : []);
    } catch (err) {
      console.error('[App] Failed to hydrate data from IndexedDB:', err);
      setHydrationError((err as Error).message);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    hydrateAppData();
  }, [hydrateAppData]);

  // Sync state updates back to storage immediately after hydration
  useEffect(() => {
    if (isHydrated) {
      storageService.setItem('powher_workouts', workouts);
    }
  }, [workouts, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      storageService.setItem('powher_nutrition_history', nutritionHistory);
    }
  }, [nutritionHistory, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      storageService.setItem('powher_weight_history', weightHistory);
    }
  }, [weightHistory, isHydrated]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="bg-gradient-to-br from-pink-400 to-purple-500 p-4 rounded-3xl shadow-xl shadow-pink-200">
            <Heart className="w-10 h-10 text-white fill-white animate-pulse" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black text-slate-800">PowHER Lifts</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Initializing Storage...</p>
          </div>
          <RefreshCw className="w-6 h-6 text-pink-500 animate-spin mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white font-sans text-slate-800">
      <Navigation 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onOpenBackup={() => setIsBackupModalOpen(true)}
      />
      
      <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 w-full max-w-7xl mx-auto transition-all">
        {hydrationError && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-semibold flex items-center justify-between">
            <span>Storage loaded with fallback notice: {hydrationError}</span>
            <button onClick={hydrateAppData} className="underline font-bold text-amber-900 ml-2">Retry</button>
          </div>
        )}

        <Routes>
          <Route 
            path="/dashboard" 
            element={
              <Dashboard 
                workouts={workouts} 
                nutritionHistory={nutritionHistory} 
                weightHistory={weightHistory}
                setWeightHistory={setWeightHistory}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                onNavigate={handleNavigate}
              />
            } 
          />
          <Route 
            path="/workouts" 
            element={
              <Workouts 
                workouts={workouts} 
                setWorkouts={setWorkouts} 
                onNavigate={handleNavigate}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            } 
          />
          <Route 
            path="/workout" 
            element={
              <Workouts 
                workouts={workouts} 
                setWorkouts={setWorkouts} 
                onNavigate={handleNavigate}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            } 
          />
          <Route 
            path="/history" 
            element={
              <Workouts 
                workouts={workouts} 
                setWorkouts={setWorkouts} 
                onNavigate={handleNavigate}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            } 
          />
          <Route 
            path="/nutrition" 
            element={
              <Nutrition 
                history={nutritionHistory} 
                setHistory={setNutritionHistory} 
                onNavigate={handleNavigate}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            } 
          />
          <Route path="/library" element={<Library onNavigate={handleNavigate} />} />
          <Route path="/coach" element={<AICoach />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataRestored={hydrateAppData}
        workoutCount={workouts.length}
      />
    </div>
  );
};

export default App;
