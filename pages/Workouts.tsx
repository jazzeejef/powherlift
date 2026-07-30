import React, { useState } from 'react';
import { Workout, ExerciseType, Page } from '../types';
import WorkoutCard from '../components/WorkoutCard';
import DateSelector from '../components/DateSelector';
import { Plus, X, LayoutDashboard, Sparkles, CalendarDays, Copy, History, Search, Share2, Check, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

interface PresetWorkout {
  title: string;
  exercises: {
    name: string;
    type: ExerciseType;
    sets: { reps: number; weight: number; completed: boolean }[];
    notes?: string;
    timeMinutes?: number;
    caloriesBurned?: number;
    completed?: boolean;
  }[];
}

const PRESET_WORKOUTS: Record<string, PresetWorkout> = {
  day1: {
    title: "Day 1: Glute Strength & Shelf Builder",
    exercises: [
      {
        name: "Barbell Romanian Deadlift",
        type: ExerciseType.STRENGTH,
        sets: [
          { reps: 10, weight: 0, completed: false },
          { reps: 10, weight: 0, completed: false },
          { reps: 8, weight: 0, completed: false },
          { reps: 8, weight: 0, completed: false }
        ],
        notes: "4 sets x 8-10 reps. Focus on hip hinge and stretch."
      },
      {
        name: "Booty Builder Hip Thrust",
        type: ExerciseType.STRENGTH,
        sets: [
          { reps: 15, weight: 0, completed: false }, 
          { reps: 12, weight: 0, completed: false },
          { reps: 10, weight: 0, completed: false },
          { reps: 8, weight: 0, completed: false }, 
          { reps: 8, weight: 0, completed: false }  
        ],
        notes: "Set 1: 15 reps warm-up, Set 2: 12 reps, Set 3: 10 reps, Set 4-5: 8 reps heavy."
      },
      {
        name: "Pendulum Hip Press",
        type: ExerciseType.STRENGTH,
        sets: [
          { reps: 12, weight: 0, completed: false },
          { reps: 12, weight: 0, completed: false },
          { reps: 12, weight: 0, completed: false },
          { reps: 12, weight: 0, completed: false }
        ],
        notes: "4 sets x 12 reps. Feet high on platform. Drive through heels."
      },
      {
        name: "Booty Builder Split Squat",
        type: ExerciseType.STRENGTH,
        sets: [
          { reps: 10, weight: 0, completed: false },
          { reps: 10, weight: 0, completed: false },
          { reps: 10, weight: 0, completed: false }
        ],
        notes: "3 sets x 10 each leg. Target the deep stretch."
      },
      {
        name: "Standing Abductor",
        type: ExerciseType.STRENGTH,
        sets: [
          { reps: 20, weight: 0, completed: false },
          { reps: 20, weight: 0, completed: false },
          { reps: 20, weight: 0, completed: false },
          { reps: 20, weight: 0, completed: false } 
        ],
        notes: "4 sets x 20 reps. Last set: drop set."
      },
      {
        name: "Cable Kickbacks",
        type: ExerciseType.STRENGTH,
        sets: [
          { reps: 15, weight: 0, completed: false },
          { reps: 15, weight: 0, completed: false },
          { reps: 15, weight: 0, completed: false }
        ],
        notes: "3 sets x 15 each leg."
      }
    ]
  },
  day2: {
    title: "Day 2: Hip Dip Filler & Roundness",
    exercises: [
      {
        name: "Standing Abductor",
        type: ExerciseType.STRENGTH,
        sets: [
          { reps: 20, weight: 0, completed: false },
          { reps: 20, weight: 0, completed: false },
          { reps: 20, weight: 0, completed: false },
          { reps: 20, weight: 0, completed: false },
          { reps: 20, weight: 0, completed: false }
        ],
        notes: "5 sets x 20 reps."
      },
      {
        name: "Step-Up Machine",
        type: ExerciseType.STRENGTH,
        sets: [
          { reps: 12, weight: 0, completed: false },
          { reps: 12, weight: 0, completed: false },
          { reps: 12, weight: 0, completed: false },
          { reps: 12, weight: 0, completed: false }
        ],
        notes: "4 sets x 12 each leg."
      },
      {
        name: "Standing Hip Thrust",
        type: ExerciseType.STRENGTH,
        sets: [
          { reps: 15, weight: 0, completed: false },
          { reps: 15, weight: 0, completed: false },
          { reps: 12, weight: 0, completed: false },
          { reps: 12, weight: 0, completed: false }
        ],
        notes: "4 sets x 12-15 reps."
      },
      {
        name: "Cable Side Leg Raises",
        type: ExerciseType.STRENGTH,
        sets: [
          { reps: 15, weight: 0, completed: false },
          { reps: 15, weight: 0, completed: false },
          { reps: 15, weight: 0, completed: false },
          { reps: 15, weight: 0, completed: false }
        ],
        notes: "4 sets x 15 each side."
      },
      {
        name: "Frog Pumps",
        type: ExerciseType.STRENGTH,
        sets: [
          { reps: 30, weight: 0, completed: false },
          { reps: 30, weight: 0, completed: false },
          { reps: 30, weight: 0, completed: false }
        ],
        notes: "3 sets x 30 reps."
      },
      {
        name: "Banded Abductions",
        type: ExerciseType.STRENGTH,
        sets: [
          { reps: 25, weight: 0, completed: false },
          { reps: 25, weight: 0, completed: false },
          { reps: 25, weight: 0, completed: false }
        ],
        notes: "3 sets x 25 reps."
      }
    ]
  },
  day3: {
    title: "Day 3: Glute Volume Day",
    exercises: [
      {
        name: "Stiff-Leg Deadlift",
        type: ExerciseType.STRENGTH,
        sets: [
          { reps: 12, weight: 0, completed: false },
          { reps: 10, weight: 0, completed: false },
          { reps: 10, weight: 0, completed: false }
        ],
        notes: "3 sets x 10-12 reps."
      },
      {
        name: "Hip Thrust",
        type: ExerciseType.STRENGTH,
        sets: [
          { reps: 12, weight: 0, completed: false },
          { reps: 12, weight: 0, completed: false },
          { reps: 12, weight: 0, completed: false },
          { reps: 12, weight: 0, completed: false }
        ],
        notes: "4 sets x 12 reps."
      },
      {
        name: "Pendulum Hip Press",
        type: ExerciseType.STRENGTH,
        sets: [
          { reps: 15, weight: 0, completed: false },
          { reps: 15, weight: 0, completed: false },
          { reps: 15, weight: 0, completed: false },
          { reps: 15, weight: 0, completed: false }
        ],
        notes: "4 sets x 15 reps."
      },
      {
        name: "Step-Up Machine",
        type: ExerciseType.STRENGTH,
        sets: [
          { reps: 15, weight: 0, completed: false },
          { reps: 15, weight: 0, completed: false },
          { reps: 15, weight: 0, completed: false }
        ],
        notes: "3 sets x 15 each leg."
      },
      {
        name: "Split Squat Machine",
        type: ExerciseType.STRENGTH,
        sets: [
          { reps: 12, weight: 0, completed: false },
          { reps: 12, weight: 0, completed: false },
          { reps: 12, weight: 0, completed: false }
        ],
        notes: "3 sets x 12 each leg."
      },
      {
        name: "Standing Abductor",
        type: ExerciseType.STRENGTH,
        sets: [
          { reps: 25, weight: 0, completed: false },
          { reps: 25, weight: 0, completed: false },
          { reps: 25, weight: 0, completed: false }
        ],
        notes: "3 sets x 25 reps."
      },
      {
        name: "Finisher: Hip Thrust Machine",
        type: ExerciseType.STRENGTH,
        sets: [
          { reps: 25, weight: 0, completed: false },
          { reps: 20, weight: 0, completed: false },
          { reps: 1, weight: 0, completed: false }
        ],
        notes: "Finisher - Set 1: 25 reps. Set 2: 20 pulses. Set 3: 30-second hold."
      }
    ]
  },
  treadmill: {
    title: "Cardio: Treadmill - Indoor Walk",
    exercises: [
      {
        name: "Treadmill - Indoor Walk",
        type: ExerciseType.CARDIO,
        sets: [],
        notes: "Focus on incline interval walk or comfortable jog.",
        timeMinutes: 30,
        caloriesBurned: 220,
        completed: false
      }
    ]
  },
  stair_stepper: {
    title: "Cardio: Stair Stepper",
    exercises: [
      {
        name: "Stair Stepper",
        type: ExerciseType.CARDIO,
        sets: [],
        notes: "Steady pace climb or intense interval climb.",
        timeMinutes: 20,
        caloriesBurned: 180,
        completed: false
      }
    ]
  },
  pilates: {
    title: "Toning: Pilates",
    exercises: [
      {
        name: "Pilates",
        type: ExerciseType.CARDIO,
        sets: [],
        notes: "Focus on core stability, flexibility, control and full body alignment.",
        timeMinutes: 45,
        caloriesBurned: 200,
        completed: false
      }
    ]
  }
};

interface WorkoutsPageProps {
  workouts: Workout[];
  setWorkouts: React.Dispatch<React.SetStateAction<Workout[]>>;
  onNavigate: (page: Page) => void;
  selectedDate?: Date;
  setSelectedDate?: React.Dispatch<React.SetStateAction<Date>>;
}

const Workouts: React.FC<WorkoutsPageProps> = ({ 
  workouts, 
  setWorkouts, 
  onNavigate,
  selectedDate: propSelectedDate,
  setSelectedDate: propSetSelectedDate
}) => {
  const [localCurrentDate, setLocalCurrentDate] = useState(new Date());
  const currentDate = propSelectedDate || localCurrentDate;
  const setCurrentDate = propSetSelectedDate || setLocalCurrentDate;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [newWorkoutTitle, setNewWorkoutTitle] = useState('');
  const [copySearch, setCopySearch] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Filter workouts for the selected date
  const dailyWorkouts = workouts.filter(w => {
    const wDate = new Date(w.date);
    return wDate.toDateString() === currentDate.toDateString();
  });

  const handleSelectPreset = (presetKey: string) => {
    if (!presetKey) return;
    const selectedPreset = PRESET_WORKOUTS[presetKey];
    if (!selectedPreset) return;

    // Check if duplicate title exists on selected date to avoid cluttering
    const exists = dailyWorkouts.some(dw => dw.title === selectedPreset.title);
    if (exists) {
      alert(`"${selectedPreset.title}" has already been added for today!`);
      return;
    }

    const newWorkout: Workout = {
      id: "preset-" + Date.now() + "-" + presetKey,
      title: selectedPreset.title,
      date: currentDate.toISOString(),
      durationMinutes: 60,
      completed: false,
      isPreset: true,
      exercises: selectedPreset.exercises.map((ex, exIdx) => ({
        id: `preset-ex-${Date.now()}-${exIdx}`,
        name: ex.name,
        type: ex.type,
        notes: ex.notes,
        timeMinutes: ex.timeMinutes,
        caloriesBurned: ex.caloriesBurned,
        completed: ex.completed || false,
        sets: ex.sets.map((s, sIdx) => ({
          id: `preset-set-${Date.now()}-${exIdx}-${sIdx}`,
          reps: s.reps,
          weight: s.weight,
          completed: s.completed
        }))
      }))
    };

    setWorkouts([newWorkout, ...workouts]);
  };

  // Generate a beautiful summary text of all daily workouts
  const generateShareSummary = () => {
    if (dailyWorkouts.length === 0) return '';
    
    const dateStr = currentDate.toLocaleDateString(undefined, { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    let summary = `👑 PowHER Lifts: Workout Report for ${dateStr} 👑\n`;
    summary += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    dailyWorkouts.forEach((workout, wIdx) => {
      const status = workout.completed ? '💪 COMPLETE' : '⏱️ SCHEDULED';
      summary += `Workout ${wIdx + 1}: ${workout.title.toUpperCase()} [${status}]\n`;
      if (workout.durationMinutes > 0) {
        summary += `⏱️ Duration: ${workout.durationMinutes} minutes\n`;
      }
      
      (workout.exercises || []).forEach((exercise, eIdx) => {
        summary += `  • ${exercise.name}\n`;
        const exerciseType = exercise.type || (exercise as any).exerciseType || ExerciseType.STRENGTH;
        if (exerciseType === ExerciseType.CARDIO || String(exerciseType).toLowerCase() === 'cardio') {
          const completedSymbol = exercise.completed ? '✅' : '⬜';
          const timeDetail = exercise.timeMinutes ? `${exercise.timeMinutes} mins` : '0 mins';
          const calDetail = exercise.caloriesBurned ? `${exercise.caloriesBurned} kcal` : '0 kcal';
          summary += `    ${completedSymbol} Cardio Log: ${timeDetail} | ${calDetail}\n`;
        } else {
          (exercise.sets || []).forEach((set, sIdx) => {
            const completedSymbol = set.completed ? '✅' : '⬜';
            const weightDetail = set.weight > 0 ? ` @ ${set.weight} lbs` : '';
            summary += `    [Set ${sIdx + 1}] ${completedSymbol} ${set.reps} reps${weightDetail}\n`;
          });
        }
      });
      summary += `\n`;
    });
    
    summary += `Tracked with PowHER Lifts ✨ Train, Track, Transform.`;
    return summary;
  };

  const handleWebShare = async () => {
    const text = generateShareSummary();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Workout Report - ${currentDate.toLocaleDateString()}`,
          text: text,
        });
      } catch (e) {
        console.error('Error sharing:', e);
      }
    }
  };

  // Get unique previous workouts for copying (most recent first)
  const uniquePastWorkouts = workouts
    .filter(w => new Date(w.date).toDateString() !== currentDate.toDateString())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter((v, i, a) => a.findIndex(t => t.title === v.title) === i);

  const filteredPastWorkouts = uniquePastWorkouts.filter(w => 
    w.title.toLowerCase().includes(copySearch.toLowerCase())
  );

  const handleToggleComplete = (id: string) => {
    setWorkouts(prev => prev.map(w => 
      w.id === id ? { ...w, completed: !w.completed } : w
    ));
  };

  const handleUpdateWorkout = (updatedWorkout: Workout) => {
    setWorkouts(prev => prev.map(w => w.id === updatedWorkout.id ? updatedWorkout : w));
  };

  const handleDeleteWorkout = (id: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  const handleCreateWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkoutTitle.trim()) return;

    const newWorkout: Workout = {
      id: Date.now().toString(),
      title: newWorkoutTitle,
      date: currentDate.toISOString(), 
      durationMinutes: 0,
      completed: false,
      exercises: [
        {
          id: 'ex-' + Date.now(),
          name: 'New Exercise',
          type: ExerciseType.STRENGTH,
          sets: [{ id: 's-' + Date.now(), reps: 10, weight: 0, completed: false }]
        }
      ]
    };

    setWorkouts([newWorkout, ...workouts]);
    setNewWorkoutTitle('');
    setIsModalOpen(false);
  };

  const handleCopyWorkout = (sourceWorkout: Workout) => {
    const clonedWorkout: Workout = {
      ...sourceWorkout,
      id: Date.now().toString(),
      date: currentDate.toISOString(),
      completed: false,
      // Deep clone exercises and sets with new IDs
      exercises: (sourceWorkout.exercises || []).map(ex => ({
        ...ex,
        id: 'ex-' + Math.random().toString(36).substr(2, 9),
        sets: (ex.sets || []).map(s => ({
          ...s,
          id: 's-' + Math.random().toString(36).substr(2, 9),
          completed: false
        }))
      }))
    };

    setWorkouts([clonedWorkout, ...workouts]);
    setIsCopyModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Your Workouts</h2>
            <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
               <Sparkles className="w-4 h-4 text-pink-500" /> Train, Track, Transform.
            </p>
        </div>
        <div className="flex flex-wrap gap-3">
            {dailyWorkouts.length > 0 && (
              <button 
                  onClick={() => {
                    setCopiedText(false);
                    setIsExportModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-5 py-3 rounded-2xl font-bold transition-all shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
                  title="Export reports for today's logs"
              >
                  <Share2 className="w-5 h-5" />
                  <span>Export Report</span>
              </button>
            )}
            <button 
                onClick={() => setIsCopyModalOpen(true)}
                className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 px-5 py-3 rounded-2xl font-bold transition-all shadow-sm"
            >
                <Copy className="w-5 h-5" />
                <span className="hidden sm:inline">Copy from History</span>
            </button>
            <button 
                onClick={() => onNavigate(Page.DASHBOARD)}
                className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 px-5 py-3 rounded-2xl font-bold transition-all shadow-sm"
            >
                <LayoutDashboard className="w-5 h-5" />
                <span className="hidden sm:inline">Dashboard</span>
            </button>
        </div>
      </div>

      <DateSelector currentDate={currentDate} onDateChange={setCurrentDate} />

      {/* Preset Workout Selection Dropdown */}
      <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent p-5 rounded-[2rem] border border-pink-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-pink-500 to-purple-500 text-white rounded-2xl shadow-md">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-lg">Load Premium Preset Workout</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Start Day 1, Day 2, or Day 3 glute builder routines instantly</p>
          </div>
        </div>
        <div className="w-full md:w-auto min-w-[300px]">
          <select
            onChange={(e) => {
              handleSelectPreset(e.target.value);
              e.target.value = ""; // Reset dropdown after selection
            }}
            defaultValue=""
            className="w-full bg-white border-2 border-pink-200/60 text-slate-700 hover:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-100 rounded-2xl px-5 py-3 font-bold transition-all shadow-sm cursor-pointer appearance-none pr-10 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20isPreset%3D%22true%22%20fill%3D%22%23ec4899%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.75em_auto] bg-[right_1.25rem_center] bg-no-repeat"
          >
            <option value="" disabled>Select Preset Routine...</option>
            <optgroup label="🍑 Glute Builder Routines">
              <option value="day1">Day 1: Glute Strength & Shelf Builder</option>
              <option value="day2">Day 2: Hip Dip Filler & Roundness</option>
              <option value="day3">Day 3: Glute Volume Day</option>
            </optgroup>
            <optgroup label="🏃‍♀️ Cardio & Toning Presets">
              <option value="treadmill">Treadmill - Indoor Walk</option>
              <option value="stair_stepper">Stair Stepper</option>
              <option value="pilates">Pilates</option>
            </optgroup>
          </select>
        </div>
      </div>

      {dailyWorkouts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {dailyWorkouts.map(workout => (
            <motion.div
                key={workout.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
            >
                <WorkoutCard 
                    workout={workout} 
                    history={workouts}
                    onToggleComplete={handleToggleComplete}
                    onUpdateWorkout={handleUpdateWorkout}
                    onDeleteWorkout={handleDeleteWorkout}
                />
            </motion.div>
            ))}
            
            <button 
                onClick={() => setIsModalOpen(true)}
                className="group flex flex-col items-center justify-center min-h-[300px] rounded-[2rem] border-2 border-dashed border-pink-200 hover:border-pink-400 hover:bg-pink-50/50 transition-all cursor-pointer"
            >
                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform mb-4">
                    <Plus className="w-8 h-8" />
                </div>
                <span className="text-pink-400 font-bold text-lg">Add Another Workout</span>
            </button>
        </div>
      ) : (
        <div className="text-center py-20 bg-white/60 rounded-[2.5rem] border border-pink-50 flex flex-col items-center shadow-lg shadow-pink-100/20">
           <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <CalendarDays className="w-10 h-10 text-pink-400" />
           </div>
           <h3 className="text-2xl font-black text-slate-800">Rest Day?</h3>
           <p className="text-slate-400 mt-2 font-medium max-w-md mx-auto">
             No workouts logged for {currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}. 
             Take a rest or crush a new goal!
           </p>
           <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl font-bold shadow-xl shadow-pink-200 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    New Plan
                </button>
                <button 
                    onClick={() => setIsCopyModalOpen(true)}
                    className="px-8 py-4 bg-white text-purple-600 border-2 border-purple-100 hover:bg-purple-50 rounded-2xl font-bold transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                    <History className="w-5 h-5" />
                    Copy from History
                </button>
           </div>
        </div>
      )}

      {/* New Workout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-purple-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl transform transition-all border border-pink-100 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-pink-50 flex justify-between items-center bg-gradient-to-r from-pink-50/50 to-white">
              <h3 className="text-2xl font-black text-slate-800">New Plan</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-pink-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateWorkout} className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">Workout Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Leg Day Destroyer 🍑" 
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all font-bold text-lg text-slate-800 placeholder-slate-300"
                    value={newWorkoutTitle}
                    onChange={(e) => setNewWorkoutTitle(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">Date</label>
                    <div className="px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-600 font-bold">
                        {currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </div>
              </div>
              <div className="mt-10 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3.5 rounded-2xl border-2 border-slate-100 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newWorkoutTitle.trim()}
                  className="flex-1 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold hover:shadow-lg hover:shadow-pink-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                >
                  Start Planning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Workout Summary Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-purple-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl transform transition-all border border-pink-100 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-pink-50 flex justify-between items-center bg-gradient-to-r from-pink-50/50 to-white">
              <div>
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <Share2 className="w-6 h-6 text-pink-500" /> Export Summary
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Ready to copy or share with your squad 👑
                </p>
              </div>
              <button onClick={() => setIsExportModalOpen(false)} className="text-slate-400 hover:text-pink-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="relative">
                <textarea
                  readOnly
                  value={generateShareSummary()}
                  className="w-full h-64 p-5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:outline-none focus:border-pink-300 font-mono text-sm text-slate-700 leading-relaxed resize-none custom-scrollbar shadow-inner"
                  style={{ whiteSpace: 'pre-wrap' }}
                />
                <div className="absolute bottom-4 right-4 text-[10px] text-slate-400 font-bold bg-white/80 backdrop-blur-sm border px-2.5 py-1 rounded-lg">
                  Markdown Format Supported 📝
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generateShareSummary());
                    setCopiedText(true);
                    setTimeout(() => setCopiedText(false), 2000);
                  }}
                  className={`flex-1 px-5 py-4 rounded-2xl font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm ${
                    copiedText 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white text-slate-700 border-2 border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  {copiedText ? (
                    <>
                      <Check className="w-5 h-5 animate-bounce" />
                      <span>Copied Successfully!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 text-slate-400" />
                      <span>Copy summary</span>
                    </>
                  )}
                </button>

                {typeof navigator !== 'undefined' && navigator.share && (
                  <button
                    type="button"
                    onClick={handleWebShare}
                    className="flex-1 px-5 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-extrabold flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-200/50"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>System Share</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copy Workout Modal */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 bg-purple-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg h-[80vh] flex flex-col shadow-2xl animate-fade-in border border-purple-100 overflow-hidden">
            <div className="p-6 border-b border-purple-50 flex justify-between items-center bg-purple-50/30">
              <div>
                <h3 className="text-2xl font-black text-slate-800">Copy Workout</h3>
                <p className="text-sm text-purple-400 font-bold">Repeat a previous routine</p>
              </div>
              <button onClick={() => setIsCopyModalOpen(false)} className="text-slate-400 hover:text-purple-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 border-b border-slate-50">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text"
                  placeholder="Search previous workouts..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-300 font-bold"
                  value={copySearch}
                  onChange={(e) => setCopySearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {filteredPastWorkouts.length > 0 ? (
                filteredPastWorkouts.map(workout => (
                  <button
                    key={workout.id}
                    onClick={() => handleCopyWorkout(workout)}
                    className="w-full text-left bg-white p-5 rounded-2xl border border-slate-100 hover:border-purple-300 hover:shadow-md hover:shadow-purple-50 transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-slate-800 text-lg group-hover:text-purple-600 transition-colors">{workout.title}</h4>
                        <div className="flex gap-4 mt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                           <span className="flex items-center gap-1"><History className="w-3 h-3" /> Last done {new Date(workout.date).toLocaleDateString()}</span>
                           <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> {workout.exercises.length} exercises</span>
                        </div>
                      </div>
                      <div className="p-2 bg-purple-50 text-purple-500 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-all">
                        <Plus className="w-5 h-5" />
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-12">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <History className="w-8 h-8 text-slate-200" />
                   </div>
                   <p className="text-slate-400 font-bold">No previous workouts found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workouts;