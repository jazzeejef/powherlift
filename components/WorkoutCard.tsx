import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { Workout, ExerciseType, Set as WorkoutSet, Exercise, ExerciseDefinition } from '../types';
import { Clock, CheckCircle2, Circle, Edit2, Plus, Trash2, X, Trophy, Sparkles, TrendingUp, Share2, ArrowRight, Zap, PartyPopper, Timer, Heart, Dumbbell, Flame } from 'lucide-react';
import ExerciseLibrary from './ExerciseLibrary';

interface WorkoutCardProps {
  workout: Workout;
  history?: Workout[];
  onToggleComplete: (id: string) => void;
  onUpdateWorkout: (updatedWorkout: Workout) => void;
  onDeleteWorkout: (id: string) => void;
}

const ConfettiPiece: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
  const randomX = (Math.random() - 0.5) * 400; // -200 to 200px
  const randomY = (Math.random() - 0.5) * 400; // -200 to 200px
  const randomRotate = Math.random() * 360;

  const style = {
    '--tx': `${randomX}px`,
    '--ty': `${randomY}px`,
    '--rot': `${randomRotate}deg`,
    animationDelay: `${delay}ms`,
    backgroundColor: color,
  } as React.CSSProperties;

  return <div className="confetti-particle" style={style} />;
};

const CelebrationOverlay = () => {
  const [progress, setProgress] = useState(0);
  const colors = ['#ec4899', '#f472b6', '#a855f7', '#fb7185', '#34d399']; // Pink, Rose, Purple, Teal

  useEffect(() => {
    // Animate progress bar
    const timer = setTimeout(() => setProgress(100), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md rounded-[2rem] animate-fade-in overflow-hidden border border-pink-100">
      <style>
        {`
          @keyframes confetti-burst {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            70% { opacity: 1; }
            100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(var(--rot)); opacity: 0; }
          }
          .confetti-particle {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: confetti-burst 1.5s ease-out forwards;
            pointer-events: none;
          }
        `}
      </style>
      
      {/* Confetti Explosion */}
      {Array.from({ length: 40 }).map((_, i) => (
        <ConfettiPiece 
          key={i} 
          delay={Math.random() * 200} 
          color={colors[Math.floor(Math.random() * colors.length)]} 
        />
      ))}

      <div className="relative z-10 flex flex-col items-center animate-bounce-in text-center p-6">
        <div className="relative mb-6">
           <Trophy className="w-24 h-24 text-yellow-400 fill-yellow-200 drop-shadow-xl animate-bounce" />
           <Sparkles className="absolute -top-4 -right-4 w-10 h-10 text-pink-500 animate-pulse" />
           <Heart className="absolute -bottom-2 -left-4 w-8 h-8 text-rose-500 fill-rose-500 animate-pulse delay-150" />
        </div>
        
        <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-2">
           SLAYED IT!
        </h3>
        <p className="text-slate-500 font-bold mb-6">Another workout crushed, queen! 👑</p>

        {/* Progress/Sync Bar */}
        <div className="w-64 space-y-2">
            <div className="flex justify-between text-xs font-bold text-pink-300 uppercase tracking-wider">
                <span>Saving Gains</span>
                <span>{progress === 100 ? '✨ Done' : 'Syncing...'}</span>
            </div>
            <div className="h-3 bg-pink-50 rounded-full overflow-hidden shadow-inner border border-pink-100">
                <div 
                    className="h-full bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-1000 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
      </div>
    </div>
  );
};

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, history = [], onToggleComplete, onUpdateWorkout, onDeleteWorkout }) => {
  const isPreset = workout.isPreset === true;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(workout.title);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Timer State
  const [restTimer, setRestTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerEnded, setTimerEnded] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerActive && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            setTimerEnded(true);
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, restTimer]);

  useEffect(() => {
    if (timerEnded) {
      const dismissTimer = setTimeout(() => {
        setIsTimerActive(false);
        setTimerEnded(false);
      }, 8000); // Auto-dismiss after 8 seconds of vibrant completion feedback
      return () => clearTimeout(dismissTimer);
    }
  }, [timerEnded]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRestTimer = (seconds: number = 90) => {
    setRestTimer(seconds);
    setIsTimerActive(true);
    setTimerEnded(false);
  };

  const adjustTimer = (seconds: number) => {
    setRestTimer(prev => {
      const newVal = Math.max(0, prev + seconds);
      if (newVal > 0) {
        setTimerEnded(false);
      }
      return newVal;
    });
  };

  const saveTitle = () => {
    onUpdateWorkout({ ...workout, title: editedTitle });
    setIsEditingTitle(false);
  };

  const handleToggleClick = () => {
    if (!workout.completed) {
        setShowCelebration(true);
        // Extended duration for the elaborate animation
        setTimeout(() => {
            setShowCelebration(false);
            onToggleComplete(workout.id);
        }, 3000); 
    } else {
        onToggleComplete(workout.id);
    }
  };

  const handleShare = async () => {
    const text = `I just crushed my "${workout.title}" workout on PowHER Lifts! 💪✨\nDuration: ${workout.durationMinutes} mins\n#PowHERLifts #FitnessGoal`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PowHER Lifts Workout',
          text: text,
          url: window.location.href // Optional: link to the app
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Workout summary copied to clipboard! Ready to share on your socials. 🚀');
    }
  };

  // Exercise Handlers
  const handleUpdateExerciseName = (exIndex: number, name: string) => {
    const updatedExercises = [...workout.exercises];
    updatedExercises[exIndex].name = name;
    onUpdateWorkout({ ...workout, exercises: updatedExercises });
  };

  const handleDeleteExercise = (exIndex: number) => {
    const updatedExercises = workout.exercises.filter((_, i) => i !== exIndex);
    onUpdateWorkout({ ...workout, exercises: updatedExercises });
  };

  const handleUpdateExerciseCardio = (exIndex: number, field: 'timeMinutes' | 'caloriesBurned', value: number) => {
    const updatedExercises = [...workout.exercises];
    updatedExercises[exIndex][field] = value;
    onUpdateWorkout({ ...workout, exercises: updatedExercises });
  };

  const handleToggleExerciseComplete = (exIndex: number) => {
    const updatedExercises = [...workout.exercises];
    updatedExercises[exIndex].completed = !updatedExercises[exIndex].completed;
    onUpdateWorkout({ ...workout, exercises: updatedExercises });
  };

  const handleSelectExercise = (exerciseDef: ExerciseDefinition) => {
    const exerciseType = exerciseDef.type || (exerciseDef as any).exerciseType || ExerciseType.STRENGTH;
    const isCardio = exerciseType === ExerciseType.CARDIO || String(exerciseType).toLowerCase() === 'cardio';
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseDef.name,
      type: exerciseType,
      sets: isCardio ? [] : [
        { id: Date.now().toString() + '-1', reps: 10, weight: 0, completed: false }
      ],
      notes: exerciseDef.description,
      timeMinutes: isCardio ? 30 : undefined,
      caloriesBurned: isCardio ? 200 : undefined,
      completed: isCardio ? false : undefined
    };
    onUpdateWorkout({ ...workout, exercises: [...(workout.exercises || []), newExercise] });
    setIsLibraryOpen(false);
  };

  const handleAddCustomExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: 'New Exercise',
      type: ExerciseType.STRENGTH,
      sets: [
        { id: Date.now().toString() + '-1', reps: 10, weight: 0, completed: false }
      ]
    };
    onUpdateWorkout({ ...workout, exercises: [...workout.exercises, newExercise] });
    setIsLibraryOpen(false);
  };

  // Set Handlers
  const handleUpdateSet = (exIndex: number, setIndex: number, field: keyof WorkoutSet, value: number) => {
    const updatedExercises = [...workout.exercises];
    // @ts-ignore
    updatedExercises[exIndex].sets[setIndex][field] = value;
    onUpdateWorkout({ ...workout, exercises: updatedExercises });
  };

  const handleToggleSetComplete = (exIndex: number, setIndex: number) => {
    const updatedExercises = [...workout.exercises];
    const isNowComplete = !updatedExercises[exIndex].sets[setIndex].completed;
    updatedExercises[exIndex].sets[setIndex].completed = isNowComplete;
    
    onUpdateWorkout({ ...workout, exercises: updatedExercises });

    // Auto-start rest timer on completion
    if (isNowComplete) {
      startRestTimer(90);
    }
  };

  const handleAddSet = (exIndex: number) => {
    const updatedExercises = [...workout.exercises];
    const previousSet = updatedExercises[exIndex].sets[updatedExercises[exIndex].sets.length - 1];
    updatedExercises[exIndex].sets.push({
      id: Date.now().toString(),
      reps: previousSet ? previousSet.reps : 10,
      weight: previousSet ? previousSet.weight : 0,
      completed: false
    });
    onUpdateWorkout({ ...workout, exercises: updatedExercises });
  };

  const handleDeleteSet = (exIndex: number, setIndex: number) => {
    const updatedExercises = [...workout.exercises];
    if (updatedExercises[exIndex].sets.length > 1) {
      updatedExercises[exIndex].sets.splice(setIndex, 1);
      onUpdateWorkout({ ...workout, exercises: updatedExercises });
    }
  };

  const applySuggestion = (exIndex: number, weight: number, reps: number) => {
    const updatedExercises = [...workout.exercises];
    updatedExercises[exIndex].sets = updatedExercises[exIndex].sets.map(s => ({
        ...s,
        weight: weight,
        reps: reps
    }));
    onUpdateWorkout({ ...workout, exercises: updatedExercises });
  };

  // Logic to find previous best stats
  const getPreviousStats = (exerciseName: string) => {
    if (!history.length) return null;
    
    // Sort history by date descending to find the most recent
    const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Find the most recent COMPLETED workout that contains this exercise
    const previousWorkout = sortedHistory.find(h => 
        h.id !== workout.id && 
        h.completed &&
        (h.exercises || []).some(e => e.name.trim().toLowerCase() === exerciseName.trim().toLowerCase())
    );

    if (!previousWorkout) return null;

    const previousExercise = (previousWorkout.exercises || []).find(e => e.name.trim().toLowerCase() === exerciseName.trim().toLowerCase());
    
    let maxWeight = 0;
    let maxReps = 0;

    if (previousExercise) {
        (previousExercise.sets || []).forEach(s => {
            if (s.completed && s.weight > maxWeight) {
                maxWeight = s.weight;
                maxReps = s.reps;
            }
        });
    }
    
    if (maxWeight > 0) {
        return { weight: maxWeight, reps: maxReps };
    }
    return null;
  };

  // Find detailed previous history of an exercise including date and weights used
  const getPreviousHistory = (exerciseName: string) => {
    if (!history || !history.length) return null;

    const currentWorkoutDate = new Date(workout.date);

    // Filter completed workouts before current date that contain this exercise
    const previousWorkouts = history
      .filter(w => {
        const wDate = new Date(w.date);
        return w.id !== workout.id && 
               w.completed && 
               wDate.getTime() < currentWorkoutDate.getTime() &&
               (w.exercises || []).some(e => e.name.trim().toLowerCase() === exerciseName.trim().toLowerCase());
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (previousWorkouts.length === 0) return null;

    const prevWorkout = previousWorkouts[0];
    const prevEx = (prevWorkout.exercises || []).find(e => e.name.trim().toLowerCase() === exerciseName.trim().toLowerCase());
    
    if (!prevEx || !prevEx.sets || prevEx.sets.length === 0) return null;

    const prevDate = new Date(prevWorkout.date);
    const dateFormatted = prevDate.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });

    const setDetails = prevEx.sets.map((s, idx) => `S${idx + 1}: ${s.weight} lbs`).join(', ');
    const maxWeight = Math.max(...prevEx.sets.map(s => s.weight));

    return {
      date: dateFormatted,
      setDetails,
      maxWeight,
      workoutTitle: prevWorkout.title
    };
  };

  return (
    <div className={`relative bg-white rounded-[2rem] shadow-xl shadow-pink-100/50 border border-pink-100 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-200/50 ${workout.completed ? 'border-pink-200 bg-pink-50/30' : ''}`}>
      
      {/* Celebration Overlay */}
      {showCelebration && <CelebrationOverlay />}

      {/* Floating Rest Timer using Portal to prevent transform container clipping */}
      {isTimerActive && typeof document !== 'undefined' && createPortal(
        timerEnded ? (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [1, 1.05, 0.98, 1.03, 1],
              rotate: [0, -2, 2, -1, 1, 0],
              boxShadow: [
                '0 20px 25px -5px rgba(236, 72, 153, 0.3)',
                '0 25px 30px -5px rgba(236, 72, 153, 0.6)',
                '0 20px 25px -5px rgba(236, 72, 153, 0.3)'
              ]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-5 rounded-3xl shadow-2xl z-50 flex items-center gap-6 border-2 border-pink-300"
          >
              <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2.5 rounded-2xl animate-ping absolute"></div>
                  <div className="bg-white/20 p-2.5 rounded-2xl relative">
                      <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300 animate-bounce" />
                  </div>
                  <div className="flex flex-col">
                      <span className="text-[10px] text-pink-100 font-black uppercase tracking-widest leading-none">Rest Over!</span>
                      <span className="text-lg font-extrabold tracking-tight mt-0.5">Time to Slay! 👑💪</span>
                  </div>
              </div>
              <button 
                onClick={() => {
                  setIsTimerActive(false);
                  setTimerEnded(false);
                }}
                className="bg-white text-pink-600 hover:bg-pink-50 px-4 py-2 rounded-2xl text-xs font-black tracking-wider uppercase transition-all shadow-md active:scale-95 whitespace-nowrap"
              >
                Got It!
              </button>
          </motion.div>
        ) : (
          <div className="fixed bottom-6 right-6 bg-slate-900/95 backdrop-blur-md text-white p-5 rounded-3xl shadow-2xl z-50 flex items-center gap-6 animate-bounce-in border border-slate-700">
              <div className="flex flex-col">
                  <span className="text-[10px] text-pink-300 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Timer className="w-3 h-3" /> Rest Timer
                  </span>
                  <span className="text-3xl font-mono font-bold text-white tabular-nums leading-none mt-1">{formatTime(restTimer)}</span>
              </div>
              <div className="flex items-center gap-2">
                  <button 
                    onClick={() => adjustTimer(-10)} 
                    className="px-3 py-1.5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-300 transition-colors"
                  >
                    -10s
                  </button>
                  <button 
                    onClick={() => adjustTimer(30)} 
                    className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 rounded-xl text-xs font-bold text-white transition-colors shadow-lg shadow-pink-500/30"
                  >
                    +30s
                  </button>
                  <div className="w-px h-6 bg-white/10 mx-1"></div>
                  <button 
                    onClick={() => {
                      setIsTimerActive(false);
                      setTimerEnded(false);
                    }} 
                    className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                    title="Stop Timer"
                  >
                    <X className="w-5 h-5" />
                  </button>
              </div>
          </div>
        ),
        document.body
      )}

      {/* Header */}
      <div className={`flex justify-between items-start mb-6 ${workout.completed && !showCelebration ? 'opacity-75' : ''}`}>
        <div className="flex-1 mr-4">
          {isEditingTitle && !isPreset ? (
            <input 
              autoFocus
              type="text" 
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
              className="text-xl font-black text-slate-900 bg-transparent border-b-2 border-pink-500 focus:outline-none w-full"
            />
          ) : (
            <div className="flex items-center gap-2 group">
              <h3 
                className={`text-xl font-black text-slate-900 transition-colors ${!isPreset ? 'cursor-pointer group-hover:text-pink-600' : ''}`}
                onClick={() => !isPreset && setIsEditingTitle(true)}
              >
                {workout.title}
              </h3>
              {!isPreset && (
                <Edit2 
                  className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-pink-400" 
                  onClick={() => setIsEditingTitle(true)}
                />
              )}
            </div>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-bold">
             <span className="flex items-center gap-1 bg-pink-50 text-pink-600 px-3 py-1.5 rounded-full border border-pink-100">
               <Clock className="w-3 h-3" /> {workout.durationMinutes > 0 ? `${workout.durationMinutes} min` : 'Plan'}
             </span>
             <span className="flex items-center gap-1 bg-purple-50 text-purple-600 px-3 py-1.5 rounded-full border border-purple-100">
               <Dumbbell className="w-3 h-3" /> {(workout.exercises || []).length} Exercises
             </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Manual Timer Toggle */}
          <button 
            onClick={() => isTimerActive ? setIsTimerActive(false) : startRestTimer(90)}
            className={`p-2.5 rounded-full transition-all ${isTimerActive ? 'bg-pink-100 text-pink-600' : 'text-slate-400 hover:text-pink-600 hover:bg-pink-50'}`}
            title={isTimerActive ? "Stop Timer" : "Start 90s Rest"}
          >
            <Timer className="w-5 h-5" />
          </button>

          {workout.completed && (
            <button 
              onClick={handleShare}
              className="p-2.5 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-all"
              title="Share Workout"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={handleToggleClick}
            className={`
              flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 transform active:scale-95
              ${workout.completed 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200' 
                : 'bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-400'}
            `}
          >
            {workout.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
          </button>
          <button 
            onClick={() => onDeleteWorkout(workout.id)}
            className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
          >
             <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      {/* Exercises List */}
      <div className={`space-y-6 ${workout.completed && !showCelebration ? 'opacity-50 pointer-events-none select-none grayscale-[0.2]' : ''}`}>
        {(workout.exercises || []).map((exercise, exIndex) => {
          const exerciseType = exercise.type || (exercise as any).exerciseType || ExerciseType.STRENGTH;
          const isCardio = exerciseType === ExerciseType.CARDIO || String(exerciseType).toLowerCase() === 'cardio';
          const prevStats = getPreviousStats(exercise.name);
          const suggestion = prevStats ? { weight: prevStats.weight + 5, reps: prevStats.reps } : null;
          const prevHist = getPreviousHistory(exercise.name);
          
          return (
            <div key={exercise.id} className="space-y-3">
              <div className="flex justify-between items-center border-b border-pink-50 pb-2">
                 <div className="flex flex-col w-full">
                   <input 
                     type="text"
                     value={exercise.name}
                     onChange={(e) => handleUpdateExerciseName(exIndex, e.target.value)}
                     className={`font-bold text-slate-800 bg-transparent focus:outline-none focus:text-pink-600 w-full text-sm sm:text-base placeholder-slate-300 ${isPreset ? 'cursor-default pointer-events-none outline-none' : ''}`}
                     placeholder="Exercise Name"
                     readOnly={isPreset}
                   />
                   
                   {/* Detailed History Badge: previous weight used and day used */}
                   {prevHist ? (
                     <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] font-semibold text-purple-600">
                       <span className="bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 flex items-center gap-1 shadow-sm">
                         <History className="w-3 h-3 text-purple-500" />
                         <span>Prev: <strong className="font-extrabold">{prevHist.maxWeight} lbs</strong> on {prevHist.date}</span>
                       </span>
                       <span className="text-slate-400 font-normal">
                         ({prevHist.setDetails})
                       </span>
                     </div>
                   ) : (
                     <div className="text-[10px] text-slate-400 font-medium mt-1">
                       No previous logs found for this exercise.
                     </div>
                   )}

                   {!isPreset && suggestion && !workout.completed && (
                     <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-[10px] text-purple-600 font-bold animate-pulse">
                            <TrendingUp className="w-3 h-3" />
                            Goal: {suggestion.weight}lbs x {suggestion.reps}
                        </div>
                        <button 
                            onClick={() => applySuggestion(exIndex, suggestion.weight, suggestion.reps)}
                            className="flex items-center gap-1 px-2 py-0.5 text-[10px] bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-full transition-colors font-bold"
                            title="Apply to all sets"
                        >
                            Apply <ArrowRight className="w-2 h-2" />
                        </button>
                     </div>
                   )}
                 </div>
                 {!isPreset && (
                   <button onClick={() => handleDeleteExercise(exIndex)} className="text-slate-300 hover:text-rose-400 p-1">
                      <X className="w-4 h-4" />
                   </button>
                 )}
              </div>

              {isCardio ? (
                <div className="bg-gradient-to-br from-pink-50/20 via-purple-50/20 to-white p-5 rounded-2xl border border-pink-100/40 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-pink-500" /> Time (Minutes)
                      </label>
                      <input 
                        type="number" 
                        value={exercise.timeMinutes === 0 ? '' : (exercise.timeMinutes || '')} 
                        placeholder="e.g. 30"
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleUpdateExerciseCardio(exIndex, 'timeMinutes', Number(e.target.value))}
                        className="w-full bg-white hover:bg-slate-100/50 border border-slate-200/60 rounded-xl py-2 px-3 text-sm font-bold focus:ring-2 focus:ring-pink-200 focus:border-pink-300 focus:outline-none transition-all text-slate-700"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> Calories Burned
                      </label>
                      <input 
                        type="number" 
                        value={exercise.caloriesBurned === 0 ? '' : (exercise.caloriesBurned || '')} 
                        placeholder="e.g. 250"
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleUpdateExerciseCardio(exIndex, 'caloriesBurned', Number(e.target.value))}
                        className="w-full bg-white hover:bg-slate-100/50 border border-slate-200/60 rounded-xl py-2 px-3 text-sm font-bold focus:ring-2 focus:ring-pink-200 focus:border-pink-300 focus:outline-none transition-all text-slate-700"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-pink-100/30">
                    <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Status</span>
                    <button
                      onClick={() => handleToggleExerciseComplete(exIndex)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-sm active:scale-95 border ${
                        exercise.completed 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent' 
                          : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {exercise.completed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>Completed</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4 text-slate-400" />
                          <span>Mark Completed</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-10 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-1">
                     <div className="col-span-2">Set</div>
                     <div className="col-span-3">Lbs</div>
                     <div className="col-span-3">Reps</div>
                     <div className="col-span-2">Done</div>
                  </div>
                  {exercise.sets.map((set, setIndex) => {
                    // Determine if this set is an "Overload" set (better than previous best)
                    const isOverload = set.completed && prevStats && (
                      set.weight > prevStats.weight || 
                      (set.weight === prevStats.weight && set.reps > prevStats.reps)
                    );

                    return (
                      <div 
                          key={set.id} 
                          className={`grid grid-cols-10 gap-2 items-center rounded-xl p-1 transition-colors ${isOverload ? 'bg-yellow-50/80 ring-1 ring-yellow-100' : ''}`}
                      >
                          <div className="col-span-2 flex justify-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isOverload ? 'bg-yellow-100 text-yellow-600' : 'bg-pink-50 text-pink-400'}`}>
                              {setIndex + 1}
                          </div>
                          </div>
                          <div className="col-span-3">
                          <input 
                              type="number" 
                              value={set.weight === 0 ? '' : set.weight}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => handleUpdateSet(exIndex, setIndex, 'weight', Number(e.target.value))}
                              className={`w-full bg-slate-50 hover:bg-white rounded-lg py-1.5 px-2 text-center text-sm font-bold focus:ring-2 focus:ring-pink-200 focus:outline-none transition-all ${isOverload ? 'text-yellow-600' : 'text-slate-700'}`}
                          />
                          </div>
                          <div className="col-span-3">
                          <input 
                              type="number" 
                              value={set.reps === 0 ? '' : set.reps}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => handleUpdateSet(exIndex, setIndex, 'reps', Number(e.target.value))}
                              className={`w-full text-center text-sm font-bold rounded-lg py-1.5 px-2 transition-all ${
                                isPreset 
                                  ? 'bg-pink-50/60 text-pink-700 border-none outline-none cursor-default' 
                                  : 'bg-slate-50 hover:bg-white text-slate-700 focus:ring-2 focus:ring-pink-200 focus:outline-none'
                              }`}
                              readOnly={isPreset}
                          />
                          </div>
                          <div className="col-span-2 flex justify-center gap-1 group/set relative">
                          {isOverload && (
                             <div className="absolute -left-6 top-1 animate-pulse" title="Progressive Overload!">
                                <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                             </div>
                          )}
                          <button 
                              onClick={() => handleToggleSetComplete(exIndex, setIndex)}
                              className={`
                              w-7 h-7 rounded-lg flex items-center justify-center transition-all
                              ${set.completed ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200' : 'bg-slate-100 text-slate-300 hover:bg-pink-100 hover:text-pink-400'}
                              `}
                          >
                              <CheckCircle2 className="w-4 h-4" />
                          </button>
                          {!isPreset && (
                            <button 
                                onClick={() => handleDeleteSet(exIndex, setIndex)}
                                className="opacity-0 group-hover/set:opacity-100 text-slate-300 hover:text-rose-400 transition-opacity absolute -right-5"
                            >
                                <X className="w-4 h-4" />
                            </button>
                          )}
                          </div>
                      </div>
                    );
                  })}
                  {!isPreset && (
                    <button 
                      onClick={() => handleAddSet(exIndex)}
                      className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-pink-300 hover:text-pink-500 hover:bg-pink-50 rounded-xl border border-dashed border-pink-100 hover:border-pink-300 transition-all mt-2"
                    >
                       <Plus className="w-3 h-3" /> Add Set
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button 
         onClick={() => setIsLibraryOpen(true)}
         className={`w-full mt-6 py-3.5 flex items-center justify-center gap-2 font-bold text-pink-500 bg-pink-50/50 hover:bg-pink-50 hover:text-pink-600 hover:shadow-md hover:shadow-pink-100 rounded-2xl border border-pink-100 transition-all ${(workout.completed || isPreset) ? 'hidden' : ''}`}
      >
        <Plus className="w-5 h-5" /> Add Exercise
      </button>

      {/* Exercise Picker Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 bg-purple-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[2rem] w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl animate-fade-in relative overflow-hidden border border-pink-100">
              <button 
                onClick={() => setIsLibraryOpen(false)} 
                className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-400 hover:text-pink-500 shadow-sm border border-pink-50 transition-colors"
              >
                 <X className="w-5 h-5" />
              </button>
              
              <div className="p-6 border-b border-pink-50 flex-shrink-0 bg-gradient-to-r from-pink-50/50 to-white">
                  <h3 className="text-2xl font-black text-slate-800">Select Exercise</h3>
                  <p className="text-sm text-pink-400 font-bold">Build your perfect workout</p>
              </div>

              <div className="flex-1 overflow-hidden">
                 <ExerciseLibrary onSelect={handleSelectExercise} />
              </div>

              <div className="p-4 border-t border-pink-50 flex-shrink-0 bg-pink-50/30">
                 <button 
                   onClick={handleAddCustomExercise}
                   className="w-full py-3 bg-white border-2 border-pink-100 hover:border-pink-300 hover:text-pink-600 text-slate-500 rounded-xl font-bold transition-all shadow-sm"
                 >
                    Can't find it? Add custom exercise
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutCard;