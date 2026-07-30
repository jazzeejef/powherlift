import React, { useState } from 'react';
import { exerciseLibrary } from '../data/exercises';
import { ExerciseDefinition } from '../types';
import { Search, Filter, Info, ChevronDown, ChevronUp, Plus, Dumbbell, Activity, Video } from 'lucide-react';

interface ExerciseLibraryProps {
  onSelect?: (exercise: ExerciseDefinition) => void;
  className?: string;
}

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ onSelect, className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const muscleGroups = ['All', ...Array.from(new Set(exerciseLibrary.map(e => e.muscleGroup)))];

  const filteredExercises = exerciseLibrary.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-[2rem] overflow-hidden ${className}`}>
      {/* Header & Search */}
      <div className="p-6 border-b border-pink-50 bg-white z-10 sticky top-0">
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search exercises (e.g., Squat, Chest)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all font-bold text-slate-700 placeholder-slate-400"
          />
          <Search className="w-5 h-5 text-pink-400 absolute left-4 top-4.5" />
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {muscleGroups.map(group => (
            <button
              key={group}
              onClick={() => setSelectedMuscle(group)}
              className={`
                px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border
                ${selectedMuscle === group 
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-200 border-pink-500' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-pink-300 hover:text-pink-500'}
              `}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {filteredExercises.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-sm">
                <Dumbbell className="w-8 h-8 text-pink-200" />
            </div>
            <p className="font-bold">No exercises found matching your criteria.</p>
          </div>
        ) : (
          filteredExercises.map(exercise => (
            <div 
              key={exercise.id} 
              className={`bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${expandedId === exercise.id ? 'ring-2 ring-pink-100 border-pink-200' : ''}`}
            >
              <div 
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-pink-50/30 transition-colors"
                onClick={() => toggleExpand(exercise.id)}
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 relative shadow-inner">
                   <img 
                      src={exercise.imageUrl} 
                      alt={exercise.name} 
                      className="w-full h-full object-cover"
                   />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-slate-800 truncate text-base">{exercise.name}</h3>
                    {exercise.difficulty === 'Beginner' && <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-black uppercase tracking-wide">Easy</span>}
                    {exercise.difficulty === 'Intermediate' && <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-black uppercase tracking-wide">Med</span>}
                    {exercise.difficulty === 'Advanced' && <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-black uppercase tracking-wide">Hard</span>}
                  </div>
                  <p className="text-xs text-slate-400 font-bold flex items-center gap-2">
                    <span className="flex items-center gap-1 text-pink-500"><Activity className="w-3 h-3" /> {exercise.muscleGroup}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>{exercise.type || (exercise as any).exerciseType || 'Strength'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                   {onSelect && (
                     <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(exercise);
                        }}
                        className="p-2.5 bg-pink-50 text-pink-500 hover:bg-pink-500 hover:text-white rounded-full transition-all shadow-sm"
                        title="Add to Workout"
                     >
                       <Plus className="w-5 h-5" />
                     </button>
                   )}
                   <button className={`p-2 rounded-full transition-transform duration-300 ${expandedId === exercise.id ? 'rotate-180 bg-slate-100' : ''}`}>
                     <ChevronDown className="w-5 h-5 text-slate-400" />
                   </button>
                </div>
              </div>

              {/* Details Expand */}
              {expandedId === exercise.id && (
                <div className="px-5 pb-6 pt-2 bg-white border-t border-slate-50 animate-fade-in">
                  <div className="mb-5 rounded-2xl overflow-hidden shadow-lg shadow-pink-100/50 h-48 md:h-64 relative group mt-2">
                    <img src={exercise.imageUrl} alt="Demonstration" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="bg-white/30 backdrop-blur-md p-4 rounded-full text-white border border-white/40">
                           <Video className="w-8 h-8 fill-white" />
                        </div>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</h4>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">{exercise.description}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Form Check</h4>
                      <ul className="space-y-3">
                        {exercise.instructions.map((step, idx) => (
                          <li key={idx} className="flex gap-4 text-sm text-slate-600 font-medium items-start">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold mt-0.5">{idx + 1}</span>
                            <span className="flex-1">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {onSelect && (
                    <button
                      onClick={() => onSelect(exercise)}
                      className="w-full mt-8 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-pink-200 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                    >
                      <Plus className="w-5 h-5" /> Add to Workout
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExerciseLibrary;