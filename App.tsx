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
import { RefreshCw, Heart, Sparkles } from 'lucide-react';

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
  const [lastHydratedAt, setLastHydratedAt] = useState<string | null>(null);

  // Non-blocking PWA SW update trigger
  const [swUpdateCallback, setSwUpdateCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    const handleSwUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.applyUpdate === 'function') {
        setSwUpdateCallback(() => customEvent.detail.applyUpdate);
      }
    };
    window.addEventListener('swUpdateAvailable', handleSwUpdate);
    return () => window.removeEventListener('swUpdateAvailable', handleSwUpdate);
  }, []);

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

  // Sanitizer/Normalizer for workout records retrieved from storage
  const sanitizeWorkouts = (rawWorkouts: any[]): Workout[] => {
    if (!Array.isArray(rawWorkouts)) return [];
    return rawWorkouts.filter(w => w && typeof w === 'object').map(w => ({
      id: String(w.id || Date.now() + Math.random()),
      title: String(w.title || 'Workout'),
      date: String(w.date || new Date().toISOString()),
      durationMinutes: Number(w.durationMinutes) || 0,
      completed: Boolean(w.completed),
      exercises: Array.isArray(w.exercises)
        ? w.exercises.filter((ex: any) => ex && typeof ex === 'object').map((ex: any) => {
            const rawType = ex.type || ex.exerciseType || ex.category || ex.movementType || 'Strength';
            const type = (rawType === 'Cardio' || rawType === 'cardio' || rawType === 'CARDIO')
              ? 'Cardio' as any
              : 'Strength' as any;
            return {
              id: String(ex.id || Date.now() + Math.random()),
              name: String(ex.name || 'Exercise'),
              type,
              sets: Array.isArray(ex.sets)
                ? ex.sets.filter((s: any) => s && typeof s === 'object').map((s: any) => ({
                    id: String(s.id || Date.now() + Math.random()),
                    reps: Number(s.reps) || 0,
                    weight: Number(s.weight) || 0,
                    completed: Boolean(s.completed)
                  }))
                : [],
              notes: ex.notes ? String(ex.notes) : undefined,
              timeMinutes: ex.timeMinutes !== undefined ? Number(ex.timeMinutes) || 0 : undefined,
              caloriesBurned: ex.caloriesBurned !== undefined ? Number(ex.caloriesBurned) || 0 : undefined,
              completed: ex.completed !== undefined ? Boolean(ex.completed) : undefined,
            };
          })
        : []
    }));
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

      setWorkouts(sanitizeWorkouts(savedWorkouts));
      setNutritionHistory(Array.isArray(savedNutrition) ? savedNutrition : []);
      setWeightHistory(Array.isArray(savedWeight) ? savedWeight : []);
      
      const now = new Date();
      setLastHydratedAt(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (' + now.toLocaleDateString() + ')');
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
    <div className="flex min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white font-sans text-slate-800 relative">
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

      {/* Non-blocking update notice banner */}
      {swUpdateCallback && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 animate-bounce max-w-sm">
          <Sparkles className="w-6 h-6 text-pink-400 flex-shrink-0 animate-pulse" />
          <div className="text-xs">
            <p className="font-bold text-pink-300">App Update Ready (v1.2.2)</p>
            <p className="text-[11px] text-slate-300">A new build was downloaded in background.</p>
          </div>
          <button
            onClick={() => swUpdateCallback()}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white text-xs font-black px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap ml-auto"
          >
            Update Now
          </button>
        </div>
      )}

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataRestored={hydrateAppData}
        workoutCount={workouts.length}
        lastHydratedAt={lastHydratedAt}
      />
    </div>
  );
};

export default App;
