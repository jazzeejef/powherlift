import React, { useMemo, useState } from 'react';
import { Workout, DailyNutrition, WeightEntry, Page } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, LineChart, Line
} from 'recharts';
import { 
  Flame, Trophy, TrendingUp, Calendar, Clock, Medal, History, Scale, Plus, X, 
  TrendingDown, Share2, Heart, Sparkles, ChevronLeft, ChevronRight, Dumbbell, Utensils, CheckCircle
} from 'lucide-react';

interface DashboardProps {
  workouts: Workout[];
  nutritionHistory: DailyNutrition[];
  weightHistory: WeightEntry[];
  setWeightHistory: React.Dispatch<React.SetStateAction<WeightEntry[]>>;
  selectedDate?: Date;
  setSelectedDate?: React.Dispatch<React.SetStateAction<Date>>;
  onNavigate?: (page: Page) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const WeightTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className="bg-slate-900 border border-slate-800/80 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex flex-col gap-1.5 animate-scale-in"
        role="tooltip"
        aria-live="polite"
      >
        <div className="text-slate-400 font-bold flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="text-sm font-black whitespace-nowrap text-slate-100">
            {payload[0].value} <span className="text-xs font-normal text-slate-400">lbs</span>
          </span>
        </div>
      </div>
    );
  }
  return null;
};

interface WeightDotProps {
  cx?: number;
  cy?: number;
  payload?: any;
  value?: number;
}

const WeightDot: React.FC<WeightDotProps> = ({ cx, cy, payload, value }) => {
  if (cx === undefined || cy === undefined || !payload) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      stroke="#ffffff"
      strokeWidth={2}
      fill="#818cf8"
      className="weight-chart-dot cursor-pointer focus:outline-none"
      tabIndex={0}
      role="img"
      aria-label={`Weight entry on ${payload.date}: ${value} lbs`}
    />
  );
};

const Dashboard: React.FC<DashboardProps> = ({ 
  workouts, 
  nutritionHistory, 
  weightHistory, 
  setWeightHistory,
  selectedDate: propSelectedDate,
  setSelectedDate: propSetSelectedDate,
  onNavigate
}) => {
  const [localSelectedDate, setLocalSelectedDate] = useState(new Date());
  const selectedDate = propSelectedDate || localSelectedDate;
  const setSelectedDate = propSetSelectedDate || setLocalSelectedDate;

  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date(selectedDate));
  const [activeDashboardTab, setActiveDashboardTab] = useState<'overview' | 'calendar'>('overview');
  const [prTab, setPrTab] = useState<'peak' | 'predicted' | 'milestones'>('peak');

  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  // --- Calendar View Helpers ---
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const getYYYYMMDD = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const daysInCalendar = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); 
    const totalDays = new Date(year, month + 1, 0).getDate();

    const gridDays: { date: Date, isCurrentMonth: boolean }[] = [];

    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      gridDays.push({
        date: new Date(year, month - 1, prevMonthTotalDays - i),
        isCurrentMonth: false
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      gridDays.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    const remainingCells = 42 - gridDays.length;
    for (let i = 1; i <= remainingCells; i++) {
      gridDays.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return gridDays;
  }, [calendarMonth]);

  const handlePrevMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCalendarMonth(today);
    setSelectedDate(today);
  };

  // --- Derived Statistics ---
  const completedWorkouts = workouts.filter(w => w.completed);
  const totalWorkoutsCount = completedWorkouts.length;
  
  const totalMinutes = useMemo(() => {
    let minutes = 0;
    completedWorkouts.forEach(w => {
      const cardioTime = (w.exercises || []).reduce((sum, ex) => {
        const exType = ex.type || (ex as any).exerciseType || ExerciseType.STRENGTH;
        return sum + (exType === 'cardio' || exType === 'Cardio' || exType === ExerciseType.CARDIO ? (ex.timeMinutes || 0) : 0);
      }, 0);
      if (cardioTime > 0) {
        minutes += cardioTime;
      } else {
        minutes += w.durationMinutes;
      }
    });
    return minutes;
  }, [completedWorkouts]);

  const averageDuration = totalWorkoutsCount > 0 ? Math.round(totalMinutes / totalWorkoutsCount) : 0;
  
  // Dynamic completed workouts streak logic
  const streak = useMemo(() => {
    if (completedWorkouts.length === 0) return 0;
    
    const completedDates = new Set(
      completedWorkouts.map(w => {
        const d = new Date(w.date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })
    );

    let currentStreak = 0;
    const checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    const todayStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    
    const yesterday = new Date(checkDate);
    yesterday.setDate(checkDate.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    let startCheckingFrom = checkDate;
    if (!completedDates.has(todayStr)) {
      if (completedDates.has(yesterdayStr)) {
        startCheckingFrom = yesterday;
      } else {
        return 0;
      }
    }

    const iterDate = new Date(startCheckingFrom);
    while (true) {
      const iterStr = `${iterDate.getFullYear()}-${String(iterDate.getMonth() + 1).padStart(2, '0')}-${String(iterDate.getDate()).padStart(2, '0')}`;
      if (completedDates.has(iterStr)) {
        currentStreak++;
        iterDate.setDate(iterDate.getDate() - 1);
      } else {
        break;
      }
    }

    return currentStreak;
  }, [completedWorkouts]);

  // Dynamic Average Daily Protein Calculation
  const avgProtein = useMemo(() => {
    if (nutritionHistory.length === 0) return 0;
    const totalProtein = nutritionHistory.reduce((sum, day) => {
      return sum + day.meals.reduce((mSum, m) => mSum + m.macros.protein, 0);
    }, 0);
    return Math.round(totalProtein / nutritionHistory.length);
  }, [nutritionHistory]);

  // Weight Stats
  const sortedWeight = [...weightHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const currentEntry = sortedWeight.length > 0 ? sortedWeight[sortedWeight.length - 1] : null;
  const startEntry = sortedWeight.length > 0 ? sortedWeight[0] : null;

  const currentWeight = currentEntry ? currentEntry.weight : 0;
  const startWeight = startEntry ? startEntry.weight : 0;
  const weightDiff = currentWeight - startWeight;
  
  const weightData = sortedWeight.map(w => ({
    date: new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    weight: w.weight
  }));

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;
    
    const entry: WeightEntry = {
      id: Date.now().toString(),
      date: selectedDate.toISOString(),
      weight: Number(newWeight)
    };

    setWeightHistory(prev => [...prev, entry]);
    setNewWeight('');
    setIsWeightModalOpen(false);
  };

  // Advanced Personal Records (PRs) Calculation from entire Workout History
  const detailedPRs = useMemo(() => {
    const prMap: Record<string, {
      exerciseName: string;
      maxWeight: number;
      maxWeightReps: number;
      maxWeightDate: string;
      maxWeightWorkoutTitle: string;
      estimated1RM: number;
      totalSetsDone: number;
      maxVolumeSet: number;
    }> = {};

    workouts.forEach(workout => {
      (workout.exercises || []).forEach(exercise => {
        (exercise.sets || []).forEach(set => {
          if (set.completed && set.weight > 0) {
            const name = exercise.name;
            const weight = set.weight;
            const reps = set.reps;
            // Epley 1-Rep Max formula
            const est1RM = reps === 1 ? weight : Math.round(weight * (1 + reps / 30) * 10) / 10;
            const volume = weight * reps;
            
            if (!prMap[name]) {
              prMap[name] = {
                exerciseName: name,
                maxWeight: weight,
                maxWeightReps: reps,
                maxWeightDate: workout.date,
                maxWeightWorkoutTitle: workout.title,
                estimated1RM: est1RM,
                totalSetsDone: 1,
                maxVolumeSet: volume,
              };
            } else {
              const current = prMap[name];
              current.totalSetsDone += 1;
              
              if (weight > current.maxWeight) {
                current.maxWeight = weight;
                current.maxWeightReps = reps;
                current.maxWeightDate = workout.date;
                current.maxWeightWorkoutTitle = workout.title;
              }
              
              if (est1RM > current.estimated1RM) {
                current.estimated1RM = est1RM;
              }
              
              if (volume > current.maxVolumeSet) {
                current.maxVolumeSet = volume;
              }
            }
          }
        });
      });
    });

    return Object.values(prMap).sort((a, b) => b.maxWeight - a.maxWeight);
  }, [workouts]);

  // Backwards compatibility layer for sharing/legacy code
  const personalBests = useMemo(() => {
    return detailedPRs.map(pr => [pr.exerciseName, pr.maxWeight]).slice(0, 5);
  }, [detailedPRs]);

  // Dynamic Milestone / Achievements system from real workout, weight, and nutrition history
  const milestones = useMemo(() => {
    const totalCompletedWorkouts = completedWorkouts.length;
    
    // Check for weight >= 100 lbs PR
    const highestWeightLifted = detailedPRs.length > 0 ? Math.max(...detailedPRs.map(p => p.maxWeight)) : 0;
    
    // Check for volume >= 500 lbs PR
    const highestSetVolume = detailedPRs.length > 0 ? Math.max(...detailedPRs.map(p => p.maxVolumeSet)) : 0;
    
    // Check for >= 2000 ml water
    const maxWaterLogged = nutritionHistory.length > 0 ? Math.max(...nutritionHistory.map(n => n.waterIntakeMl)) : 0;
    
    // Check for >= 100g Protein in a day
    const maxProteinLogged = nutritionHistory.length > 0 
      ? Math.max(...nutritionHistory.map(n => n.meals.reduce((acc, m) => acc + m.macros.protein, 0))) 
      : 0;

    const loggedWeightsCount = weightHistory.length;

    return [
      {
        id: 'completed_workouts',
        title: 'Consistent Queen',
        description: 'Complete at least 3 workouts to build strong lifting habits',
        unlocked: totalCompletedWorkouts >= 3,
        current: totalCompletedWorkouts,
        target: 3,
        unit: 'workouts',
        category: 'fitness'
      },
      {
        id: 'century_lifter',
        title: 'Century Lifter',
        description: 'Lift 100+ lbs in any completed single set',
        unlocked: highestWeightLifted >= 100,
        current: Math.round(highestWeightLifted),
        target: 100,
        unit: 'lbs',
        category: 'power'
      },
      {
        id: 'volume_overlord',
        title: 'Volume Champion',
        description: 'Hit over 500 lbs total volume in a single set',
        unlocked: highestSetVolume >= 500,
        current: Math.round(highestSetVolume),
        target: 500,
        unit: 'lbs',
        category: 'power'
      },
      {
        id: 'hydration_royalty',
        title: 'Hydration Royalty',
        description: 'Drink 2,000+ ml of water in a single nutrition day',
        unlocked: maxWaterLogged >= 2000,
        current: maxWaterLogged,
        target: 2000,
        unit: 'ml',
        category: 'nutrition'
      },
      {
        id: 'protein_powered',
        title: 'Protein Goddess',
        description: 'Reach 100g+ protein in a single logged day',
        unlocked: maxProteinLogged >= 100,
        current: Math.round(maxProteinLogged),
        target: 100,
        unit: 'g',
        category: 'nutrition'
      },
      {
        id: 'weight_tracker',
        title: 'Progress Devotee',
        description: 'Log 3+ weight tracking transformation entries',
        unlocked: loggedWeightsCount >= 3,
        current: loggedWeightsCount,
        target: 3,
        unit: 'entries',
        category: 'wellness'
      }
    ];
  }, [completedWorkouts, detailedPRs, nutritionHistory, weightHistory]);

  const handleSharePBs = async () => {
    if (detailedPRs.length === 0) return;

    const pbList = detailedPRs.slice(0, 5).map((pr, idx) => `${idx + 1}. ${pr.exerciseName}: ${pr.maxWeight} lbs (Est. 1RM: ${pr.estimated1RM} lbs)`).join('\n');
    const text = `Hit new Personal Bests on PowHER Lifts! 🏆💪\n\n${pbList}\n\n#PowHERLifts #StrongerEveryDay`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Personal Bests',
          text: text,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Personal Bests copied to clipboard! Share your gains! 🌟');
    }
  };

  // Activity Data for Chart (Calculated based on actual weekdays of the currently selected week)
  const activityData = useMemo(() => {
    const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const today = new Date(selectedDate);
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday ...
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const weekWorkouts = completedWorkouts.filter(w => {
      const wDate = new Date(w.date);
      const diffTime = wDate.getTime() - monday.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays < 7;
    });

    return orderedDays.map((dayName, idx) => {
      const targetDayOfWeek = idx === 6 ? 0 : idx + 1;
      const dayMinutes = weekWorkouts
        .filter(w => new Date(w.date).getDay() === targetDayOfWeek)
        .reduce((sum, w) => sum + w.durationMinutes, 0);
      return { day: dayName, minutes: dayMinutes };
    });
  }, [completedWorkouts, selectedDate]);

  // Dynamic Calorie trend data source for the last 7 days
  const calorieData = useMemo(() => {
    const result = [];
    const baseDate = new Date(selectedDate);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayData = nutritionHistory.find(n => n.date === dateStr);
      const calories = dayData ? dayData.meals.reduce((sum, m) => sum + m.macros.calories, 0) : 0;
      const protein = dayData ? dayData.meals.reduce((sum, m) => sum + m.macros.protein, 0) : 0;
      
      result.push({
        date: d.toLocaleDateString(undefined, { weekday: 'short' }),
        calories,
        protein
      });
    }
    return result;
  }, [nutritionHistory, selectedDate]);

  const StatCard = ({ title, value, icon: Icon, colorClass, subtext }: any) => (
    <div className="bg-white p-6 rounded-[2rem] shadow-lg shadow-pink-100/40 border border-pink-50 flex items-start justify-between transform hover:scale-[1.02] transition-transform">
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-800">{value}</h3>
        {subtext && <p className="text-xs text-pink-400 font-bold mt-2 flex items-center gap-1">{subtext}</p>}
      </div>
      <div className={`p-3.5 rounded-2xl ${colorClass} shadow-md`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <style>{`
        .weight-chart-dot {
          transition: r 0.25s cubic-bezier(0.4, 0, 0.2, 1), fill 0.25s cubic-bezier(0.4, 0, 0.2, 1), stroke-width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .weight-chart-dot:hover, .weight-chart-dot:focus {
          r: 8px !important;
          fill: #4f46e5 !important;
          stroke-width: 3px !important;
          outline: none;
        }
      `}</style>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Hello, Gorgeous! ✨</h2>
          <p className="text-slate-500 mt-2 font-medium">Ready to glow and grow today?</p>
          
          {/* Mobile Current Focus Badge */}
          <div className="mt-3.5 inline-flex flex-col md:hidden bg-gradient-to-r from-pink-50/80 to-purple-50/80 border border-pink-100/60 px-4 py-2 rounded-2xl">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Current Focus</span>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 font-black text-base">Strength & Toning</span>
          </div>
        </div>
        <div className="text-right hidden md:block">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Focus</p>
           <p className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 font-black text-xl">Strength & Toning</p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex bg-pink-100/30 p-1.5 rounded-2xl w-full sm:w-fit gap-1 border border-pink-100/45 backdrop-blur-sm shadow-inner">
        <button
          onClick={() => setActiveDashboardTab('overview')}
          className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl font-extrabold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
            activeDashboardTab === 'overview'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-200/50'
              : 'text-slate-600 hover:text-pink-500'
          }`}
        >
          <History className="w-4 h-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveDashboardTab('calendar')}
          className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl font-extrabold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
            activeDashboardTab === 'calendar'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-200/50'
              : 'text-slate-600 hover:text-pink-500'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Interactive Calendar
        </button>
      </div>

      {activeDashboardTab === 'overview' ? (
        <>
          {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Weekly Workouts" 
          value={totalWorkoutsCount} 
          icon={Trophy} 
          colorClass="bg-gradient-to-br from-yellow-400 to-orange-400" 
          subtext="Keep grinding!"
        />
        <StatCard 
          title="Active Minutes" 
          value={totalMinutes} 
          icon={Flame} 
          colorClass="bg-gradient-to-br from-pink-500 to-rose-500" 
          subtext="Total burn time"
        />
        <StatCard 
          title="Current Streak" 
          value={`${streak} Days`} 
          icon={Calendar} 
          colorClass="bg-gradient-to-br from-purple-500 to-indigo-500" 
          subtext="You're on fire!"
        />
        <StatCard 
          title="Avg Protein" 
          value={`${avgProtein}g`} 
          icon={TrendingUp} 
          colorClass="bg-gradient-to-br from-teal-400 to-emerald-400" 
          subtext="Daily Average"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Chart */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-pink-100/50 border border-pink-50">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" /> Activity Overview
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fdf2f8" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <RechartsTooltip 
                  cursor={{ fill: '#fdf2f8' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(236, 72, 153, 0.1)' }}
                />
                <Bar 
                  dataKey="minutes" 
                  fill="url(#barGradient)" 
                  radius={[8, 8, 8, 8]} 
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nutrition Chart */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-pink-100/50 border border-pink-50">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
             <Heart className="w-5 h-5 text-rose-400 fill-rose-400" /> Nutrition Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={calorieData}>
                <defs>
                  <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fdf2f8" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10} 
                />
                <YAxis hide />
                <RechartsTooltip 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(236, 72, 153, 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="#ec4899" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorCalories)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weight Tracker Section */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-pink-100/50 border border-pink-50 overflow-hidden">
        <div className="p-6 border-b border-pink-50 flex justify-between items-center bg-gradient-to-r from-pink-50/30 to-white">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-500 shadow-sm">
                    <Scale className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="font-bold text-slate-800">Weight Tracker</h3>
                   <p className="text-xs text-slate-400 font-medium">Your transformation journey</p>
                </div>
            </div>
            <button 
              onClick={() => setIsWeightModalOpen(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200"
            >
                <Plus className="w-4 h-4" /> Log Weight
            </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
                <div className="bg-slate-50 p-5 rounded-2xl flex items-center justify-between border border-slate-100">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current</p>
                        <p className="text-3xl font-black text-slate-800">{currentWeight} <span className="text-sm font-bold text-slate-400">lbs</span></p>
                        {currentEntry && (
                            <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(currentEntry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                        )}
                    </div>
                    {weightDiff !== 0 && (
                        <div className={`flex items-center text-sm font-bold px-3 py-1 rounded-full ${weightDiff < 0 ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-500'}`}>
                           {weightDiff < 0 ? <TrendingDown className="w-4 h-4 mr-1" /> : <TrendingUp className="w-4 h-4 mr-1" />}
                           {Math.abs(weightDiff).toFixed(1)} lbs
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start</p>
                        <p className="text-xl font-black text-slate-600">{startWeight} lbs</p>
                        {startEntry && (
                            <p className="text-[10px] text-slate-400 font-bold mt-1">
                                {new Date(startEntry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                            </p>
                        )}
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lost</p>
                         <p className={`text-xl font-black ${weightDiff < 0 ? 'text-green-500' : 'text-slate-600'}`}>
                             {startWeight - currentWeight > 0 ? (startWeight - currentWeight).toFixed(1) : 0} lbs
                         </p>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fdf2f8" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                            dy={10} 
                        />
                        <YAxis 
                            domain={['dataMin - 5', 'dataMax + 5']} 
                            hide 
                        />
                        <RechartsTooltip 
                            content={<WeightTooltip />}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="weight" 
                            stroke="#818cf8" 
                            strokeWidth={4} 
                            dot={<WeightDot />}
                            activeDot={{ r: 8, stroke: '#ffffff', strokeWidth: 3, fill: '#4f46e5', className: 'weight-chart-dot' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* History & Records Section */}
      <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-800 pt-4 flex items-center gap-2">
             <History className="w-6 h-6 text-purple-400" /> History & Records
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Lifetime Stats */}
              <div className="bg-white p-6 rounded-[2rem] shadow-lg shadow-pink-100/40 border border-pink-50 space-y-6">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-pink-500" /> Lifetime Stats
                  </h3>
                  
                  <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-slate-500 text-sm font-semibold">Total Workouts</span>
                          <span className="text-xl font-black text-slate-800">{totalWorkoutsCount}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-slate-500 text-sm font-semibold">Avg Duration</span>
                          <span className="text-xl font-black text-slate-800">{averageDuration} min</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-slate-500 text-sm font-semibold">Total Volume</span>
                          <span className="text-xl font-black text-slate-800">
                             {(completedWorkouts.reduce((acc, w) => 
                                 acc + (w.exercises || []).reduce((eAcc, e) => 
                                     eAcc + (e.sets || []).reduce((sAcc, s) => sAcc + (s.completed ? s.weight * s.reps : 0), 0), 0
                                 ), 0) / 1000).toFixed(1)}k lbs
                          </span>
                      </div>
                  </div>
              </div>

              {/* Personal Records & Achievements Locker */}
              <div className="bg-white p-6 rounded-[2rem] shadow-lg shadow-pink-100/40 border border-pink-50 flex flex-col justify-between">
                  <div>
                      <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-slate-800 flex items-center gap-2">
                              <Trophy className="w-5 h-5 text-yellow-400 fill-yellow-100" /> Records & Achievements
                          </h3>
                          {detailedPRs.length > 0 && prTab !== 'milestones' && (
                              <button 
                                onClick={handleSharePBs}
                                className="text-pink-300 hover:text-pink-500 transition-colors p-1"
                                title="Share PRs"
                              >
                                <Share2 className="w-5 h-5" />
                              </button>
                          )}
                      </div>

                      {/* Record Sub-Tabs */}
                      <div className="flex bg-slate-100 p-1 rounded-xl mb-4 text-xs font-bold text-slate-500 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setPrTab('peak')}
                            className={`flex-1 py-1.5 rounded-lg transition-all duration-200 outline-none ${
                              prTab === 'peak' 
                                ? 'bg-white text-pink-600 shadow-sm font-black' 
                                : 'hover:text-pink-500'
                            }`}
                          >
                            Peak Lifts
                          </button>
                          <button
                            type="button"
                            onClick={() => setPrTab('predicted')}
                            className={`flex-1 py-1.5 rounded-lg transition-all duration-200 outline-none ${
                              prTab === 'predicted' 
                                ? 'bg-white text-indigo-600 shadow-sm font-black' 
                                : 'hover:text-indigo-500'
                            }`}
                          >
                            Predicted 1RM
                          </button>
                          <button
                            type="button"
                            onClick={() => setPrTab('milestones')}
                            className={`flex-1 py-1.5 rounded-lg transition-all duration-200 outline-none ${
                              prTab === 'milestones' 
                                ? 'bg-white text-purple-600 shadow-sm font-black' 
                                : 'hover:text-purple-500'
                            }`}
                          >
                            Achievements
                          </button>
                      </div>

                      {/* Tab Contents */}
                      {prTab === 'peak' && (
                        detailedPRs.length > 0 ? (
                          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                            {detailedPRs.slice(0, 5).map((pr, index) => (
                              <div key={index} className="bg-slate-50 hover:bg-pink-50/40 p-3 rounded-2xl border border-slate-100/75 transition-all flex items-center justify-between gap-2.5">
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className={`
                                    flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-xl text-xs font-black shadow-sm
                                    ${index === 0 ? 'bg-yellow-100 text-yellow-600 border border-yellow-200' : 
                                      index === 1 ? 'bg-slate-200 text-slate-700 border border-slate-300' : 
                                      index === 2 ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-pink-100 text-purple-600'}
                                  `}>
                                    {index + 1}
                                  </span>
                                  <div className="min-w-0">
                                    <h4 className="text-slate-800 font-extrabold text-xs truncate uppercase tracking-wide">{pr.exerciseName}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5 whitespace-nowrap">
                                      {pr.maxWeightReps} reps • {new Date(pr.maxWeightDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <span className="font-extrabold text-slate-800 bg-white border border-slate-100 px-2.5 py-1 rounded-xl text-xs shadow-sm whitespace-nowrap">{pr.maxWeight} lbs</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-slate-400 text-sm font-medium">
                            Complete exercises with weight to log peak lifting PRs!
                          </div>
                        )
                      )}

                      {prTab === 'predicted' && (
                        detailedPRs.length > 0 ? (
                          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                            <p className="text-[10px] text-slate-400 font-semibold mb-2 leading-relaxed bg-pink-50/30 p-2.5 rounded-xl border border-pink-100/30">
                              💡 <strong>Predicted 1-Rep Max (1RM)</strong> calculates your theoretical maximal strength potential using the scientific Epley formula.
                            </p>
                            {detailedPRs.slice(0, 5).map((pr, index) => (
                              <div key={index} className="bg-slate-50 hover:bg-pink-50/40 p-3 rounded-2xl border border-slate-100/75 transition-all flex items-center justify-between gap-2.5">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="p-1.5 bg-pink-100/40 rounded-lg text-purple-500">
                                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-slate-800 font-extrabold text-xs truncate uppercase tracking-wide">{pr.exerciseName}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5 whitespace-nowrap">
                                      Based on: {pr.maxWeight} lbs x {pr.maxWeightReps} reps
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <span className="font-black text-indigo-600 bg-indigo-50 border border-indigo-100/30 px-2.5 py-1 rounded-xl text-xs shadow-sm whitespace-nowrap">{pr.estimated1RM} lbs</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-slate-400 text-sm font-medium">
                            Complete weighted sets to unlock predicted 1RM estimation!
                          </div>
                        )
                      )}

                      {prTab === 'milestones' && (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                          {milestones.map((ms) => {
                            const pct = Math.min(100, Math.round((ms.current / ms.target) * 100));
                            return (
                              <div 
                                key={ms.id} 
                                className={`
                                  p-3 rounded-2xl border transition-all relative overflow-hidden
                                  ${ms.unlocked 
                                    ? 'bg-gradient-to-br from-pink-50/50 to-purple-50/30 border-pink-200/50 shadow-inner' 
                                    : 'bg-slate-50 border-slate-100'}
                                `}
                              >
                                <div 
                                  className="absolute top-0 left-0 bottom-0 bg-pink-500/5 transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                ></div>

                                <div className="flex items-start justify-between gap-2 relative z-10">
                                  <div className="min-w-0 w-full">
                                    <div className="flex items-center gap-1.5">
                                      <h4 className="text-slate-800 font-extrabold text-xs uppercase tracking-wide truncate">
                                        {ms.title}
                                      </h4>
                                      {ms.unlocked && (
                                        <span className="text-[8px] bg-pink-500 text-white font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap scale-90">
                                          Gains! 👑
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-snug">{ms.description}</p>
                                    
                                    <div className="flex items-center gap-2 mt-2">
                                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full transition-all duration-300 ${ms.unlocked ? 'bg-pink-500' : 'bg-slate-400'}`} 
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                      <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap min-w-[50px] text-right">
                                        {ms.current}/{ms.target} {ms.unit}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                  </div>
              </div>

              {/* Recent History List */}
              <div className="bg-white p-6 rounded-[2rem] shadow-lg shadow-pink-100/40 border border-pink-50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5 text-purple-400" /> Recent History
                  </h3>
                  
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {completedWorkouts.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(workout => (
                          <div key={workout.id} className="relative pl-6 py-2 group">
                              <div className="absolute left-0 top-3 w-1.5 h-1.5 rounded-full bg-pink-300 group-hover:scale-150 transition-transform"></div>
                              <div className="absolute left-0.5 top-5 w-0.5 h-full bg-pink-100 -z-10 last:hidden"></div>
                              <h4 className="font-bold text-slate-800 text-sm">{workout.title}</h4>
                              <div className="flex gap-4 mt-1 text-xs text-slate-400 font-semibold">
                                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(workout.date).toLocaleDateString()}</span>
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {workout.durationMinutes} min</span>
                              </div>
                          </div>
                      ))}
                      {completedWorkouts.length === 0 && (
                          <div className="text-center py-12 text-slate-400 text-sm font-medium">
                              No completed workouts yet.
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>
        </>
      ) : (
        /* Calendar UI Block */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Calendar Grid card */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-pink-100/50 border border-pink-50">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-100/60 text-pink-600 rounded-2xl shadow-sm">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Explore your history</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToday}
                  className="px-4 py-2 text-xs font-black text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-xl transition-all shadow-sm"
                >
                  Today
                </button>
                <button
                  onClick={handlePrevMonth}
                  aria-label="Previous Month"
                  className="p-2 text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-colors border border-slate-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  aria-label="Next Month"
                  className="p-2 text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-colors border border-slate-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Weekdays indicator row */}
            <div className="grid grid-cols-7 gap-2 text-center font-bold text-xs text-slate-400 uppercase tracking-widest mb-4">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {daysInCalendar.map(({ date: day, isCurrentMonth }, idx) => {
                const dayStr = getYYYYMMDD(day);
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                
                // Fetch stats for this day
                const dayWorkouts = workouts.filter(w => isSameDay(new Date(w.date), day));
                const completedCount = dayWorkouts.filter(w => w.completed).length;
                const totalCount = dayWorkouts.length;
                
                const dayNutrition = nutritionHistory.find(n => n.date.split('T')[0] === dayStr);
                const hasNutrition = dayNutrition && dayNutrition.meals.length > 0;
                
                const hasWeight = weightHistory.some(w => isSameDay(new Date(w.date), day));

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDate(day);
                      // If the day belongs to prev or next month, keep calendar in sync
                      if (day.getMonth() !== calendarMonth.getMonth()) {
                        setCalendarMonth(new Date(day.getFullYear(), day.getMonth(), 1));
                      }
                    }}
                    className={`
                      relative aspect-square flex flex-col items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-pink-100/50
                      ${isCurrentMonth ? 'bg-slate-50/50 text-slate-800' : 'bg-transparent text-slate-300'}
                      ${isSelected ? 'bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-400 font-extrabold shadow-sm' : 'border border-slate-100'}
                      ${isToday ? 'border-2 border-purple-500/80' : ''}
                      hover:bg-pink-50/40 hover:border-pink-200
                    `}
                    aria-label={`Date: ${day.toLocaleDateString()}. Workouts: ${totalCount}, Nutrition: ${hasNutrition ? 'logged' : 'none'}, Weight: ${hasWeight ? 'logged' : 'none'}`}
                  >
                    <span className={`text-sm tracking-tight ${isSelected ? 'text-pink-600 font-black' : isToday ? 'text-purple-600 font-black' : 'font-bold'}`}>
                      {day.getDate()}
                    </span>

                    {/* Indicator Dots */}
                    <div className="flex gap-1 justify-center items-center mt-1 w-full overflow-hidden">
                      {totalCount > 0 && (
                        <div 
                          className={`w-1.5 h-1.5 rounded-full ${completedCount === totalCount ? 'bg-pink-500' : 'bg-pink-300'}`} 
                          title={`${completedCount}/${totalCount} workouts completed`}
                        />
                      )}
                      {hasNutrition && (
                        <div 
                          className="w-1.5 h-1.5 rounded-full bg-amber-500" 
                          title="Nutrition logged"
                        />
                      )}
                      {hasWeight && (
                        <div 
                          className="w-1.5 h-1.5 rounded-full bg-indigo-500" 
                          title="Weight tracked"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details side cards */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-[2rem] shadow-xl border border-slate-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
              <p className="text-pink-400 font-bold text-xs uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Medal className="w-3.5 h-3.5 text-pink-400" /> Active Selection
              </p>
              <h3 className="text-xl font-black text-slate-100 tracking-tight leading-snug">
                {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </h3>
              {isSameDay(selectedDate, new Date()) && (
                <span className="inline-block mt-2 px-3 py-1 bg-pink-500 text-white text-[10px] font-black rounded-lg uppercase tracking-wider shadow-sm animate-pulse">
                  Today
                </span>
              )}
            </div>

            {/* Selected Date Summary Logs */}
            <div className="space-y-6">
              {/* Workouts Log */}
              <div className="bg-white p-6 rounded-3xl shadow-lg shadow-pink-100/30 border border-pink-50 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-pink-50/50">
                  <h4 className="font-extrabold text-slate-800 flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-pink-500" />
                    <span>Workouts</span>
                  </h4>
                  {workouts.filter(w => isSameDay(new Date(w.date), selectedDate)).length > 0 && onNavigate && (
                    <button 
                      onClick={() => onNavigate(Page.WORKOUTS)} 
                      className="text-xs font-bold text-pink-500 hover:text-pink-600 hover:underline"
                    >
                      View Logs
                    </button>
                  )}
                </div>

                {(() => {
                  const dayWorkouts = workouts.filter(w => isSameDay(new Date(w.date), selectedDate));
                  if (dayWorkouts.length === 0) {
                    return (
                      <div className="py-4 text-center">
                        <p className="text-slate-400 text-sm font-medium">Rest Day! 🧘‍♀️</p>
                        <p className="text-[11px] text-slate-300 mt-1">Enjoy high-protein foods to support recovery.</p>
                        {onNavigate && (
                          <button
                            onClick={() => {
                              setSelectedDate(selectedDate);
                              onNavigate(Page.WORKOUTS);
                            }}
                            className="mt-3.5 px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-600 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 mx-auto shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" /> Plan Workout
                          </button>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {dayWorkouts.map(workout => (
                        <div key={workout.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 hover:border-pink-200 transition-colors">
                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <h5 className="font-extrabold text-slate-800 text-sm">{workout.title}</h5>
                              <p className="text-[11px] text-slate-400 font-bold mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {workout.durationMinutes} min • {(workout.exercises || []).length} exercises
                              </p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${workout.completed ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                              {workout.completed ? 'Completed' : 'Scheduled'}
                            </span>
                          </div>
                          
                          {/* Exercises info */}
                          <div className="space-y-1 pl-1.5 border-l-2 border-slate-200">
                            {(workout.exercises || []).map(ex => (
                              <div key={ex.id} className="text-xs text-slate-500 font-semibold flex items-center justify-between">
                                <span className="truncate max-w-[150px]">{ex.name}</span>
                                <span className="text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-100">
                                  {(ex.sets || []).length} {(ex.sets || []).length > 1 ? 'sets' : 'set'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Nutrition Log */}
              <div className="bg-white p-6 rounded-3xl shadow-lg shadow-pink-100/30 border border-pink-50 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-pink-50/50">
                  <h4 className="font-extrabold text-slate-800 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-amber-500" />
                    <span>Nutrition</span>
                  </h4>
                  {nutritionHistory.some(n => n.date.split('T')[0] === getYYYYMMDD(selectedDate)) && onNavigate && (
                    <button 
                      onClick={() => onNavigate(Page.NUTRITION)} 
                      className="text-xs font-bold text-amber-500 hover:text-amber-600 hover:underline"
                    >
                      View Details
                    </button>
                  )}
                </div>

                {(() => {
                  const dayNutrition = nutritionHistory.find(n => n.date.split('T')[0] === getYYYYMMDD(selectedDate));
                  if (!dayNutrition || dayNutrition.meals.length === 0) {
                    return (
                      <div className="py-4 text-center">
                        <p className="text-slate-400 text-sm font-medium">No meals logged yet. 🥗</p>
                        <p className="text-[11px] text-slate-300 mt-1">Keep a log to track macro balances.</p>
                        {onNavigate && (
                          <button
                            onClick={() => {
                              setSelectedDate(selectedDate);
                              onNavigate(Page.NUTRITION);
                            }}
                            className="mt-3.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 mx-auto shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" /> Log Meals
                          </button>
                        )}
                      </div>
                    );
                  }

                  const calories = dayNutrition.meals.reduce((acc, m) => acc + m.macros.calories, 0);
                  const protein = dayNutrition.meals.reduce((acc, m) => acc + m.macros.protein, 0);
                  const carbs = dayNutrition.meals.reduce((acc, m) => acc + m.macros.carbs, 0);
                  const fats = dayNutrition.meals.reduce((acc, m) => acc + m.macros.fats, 0);

                  return (
                    <div className="space-y-4">
                      {/* Calories badge & brief meal list */}
                      <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-amber-700/60 uppercase tracking-widest">Total Fuel</p>
                          <p className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">
                            {calories} <span className="text-xs font-bold text-slate-400">kcal</span>
                          </p>
                        </div>
                        <div className="text-right text-[10px] font-bold text-slate-500 space-y-0.5">
                          <div className="flex justify-between gap-3 bg-white px-2 py-0.5 rounded border border-amber-100/50">
                            <span>Protein:</span> <span className="font-extrabold text-teal-600">{protein}g</span>
                          </div>
                          <div className="flex justify-between gap-3 bg-white px-2 py-0.5 rounded border border-amber-100/50">
                            <span>Carbs:</span> <span className="font-extrabold text-yellow-600">{carbs}g</span>
                          </div>
                          <div className="flex justify-between gap-3 bg-white px-2 py-0.5 rounded border border-amber-100/50">
                            <span>Fats:</span> <span className="font-extrabold text-rose-500">{fats}g</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1.5 custom-scrollbar font-sans">
                        {dayNutrition.meals.map(meal => (
                          <div key={meal.id} className="flex justify-between items-center text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div>
                              <span className="font-bold text-slate-800">{meal.name}</span>
                              <span className="text-[10px] text-slate-400 block font-semibold">{meal.time} • {meal.category}</span>
                            </div>
                            <span className="font-black text-amber-600 whitespace-nowrap">{meal.macros.calories} kcal</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Weight Log */}
              <div className="bg-white p-6 rounded-3xl shadow-lg shadow-pink-100/30 border border-pink-50 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-pink-50/50">
                  <h4 className="font-extrabold text-slate-800 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-indigo-500" />
                    <span>Weight Record</span>
                  </h4>
                  <button 
                    onClick={() => setIsWeightModalOpen(true)} 
                    className="text-xs font-bold text-indigo-500 hover:text-indigo-600 hover:underline"
                  >
                    Log Weight
                  </button>
                </div>

                {(() => {
                  const dayWeight = weightHistory.find(w => isSameDay(new Date(w.date), selectedDate));
                  if (!dayWeight) {
                    return (
                      <p className="text-slate-400 text-xs font-semibold py-2 text-center">
                        No weight entry recorded for this day.
                      </p>
                    );
                  }

                  return (
                    <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-indigo-700/60 uppercase tracking-widest">Weight Logged</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">
                          {dayWeight.weight} <span className="text-xs font-bold text-slate-400">lbs</span>
                        </p>
                      </div>
                      <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl">
                        <Scale className="w-5 h-5" />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Weight Modal */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 bg-purple-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl animate-fade-in border border-pink-100 overflow-hidden">
            <div className="p-6 border-b border-pink-50 flex justify-between items-center bg-pink-50/30">
              <h3 className="text-xl font-black text-slate-800">Log Weight</h3>
              <button onClick={() => setIsWeightModalOpen(false)} className="text-slate-400 hover:text-pink-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddWeight} className="p-8">
               <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide text-center">Current Weight</label>
               <div className="relative max-w-[160px] mx-auto">
                 <input 
                    autoFocus
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    className="w-full px-4 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 text-3xl font-black text-center text-slate-800"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">lbs</span>
               </div>
               
               <button 
                 type="submit"
                 disabled={!newWeight}
                 className="w-full mt-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 transform hover:scale-[1.02] active:scale-95"
               >
                 Save Entry
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;