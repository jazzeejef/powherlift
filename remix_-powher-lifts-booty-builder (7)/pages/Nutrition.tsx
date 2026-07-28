import React, { useState } from 'react';
import { Meal, DailyNutrition, MealCategory, Page } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Coffee, Sun, Moon, Apple, X, ChevronDown, LayoutDashboard, Utensils, Trash2, Copy, History, Search, Clock } from 'lucide-react';
import { generateMealIdea } from '../services/geminiService';
import DateSelector from '../components/DateSelector';
import { motion } from 'motion/react';

interface NutritionProps {
  history: DailyNutrition[];
  setHistory: React.Dispatch<React.SetStateAction<DailyNutrition[]>>;
  onNavigate: (page: Page) => void;
  selectedDate?: Date;
  setSelectedDate?: React.Dispatch<React.SetStateAction<Date>>;
}

const Nutrition: React.FC<NutritionProps> = ({ 
  history, 
  setHistory, 
  onNavigate,
  selectedDate: propSelectedDate,
  setSelectedDate: propSetSelectedDate
}) => {
  const [localSelectedDate, setLocalSelectedDate] = useState(new Date());
  const selectedDate = propSelectedDate || localSelectedDate;
  const setSelectedDate = propSetSelectedDate || setLocalSelectedDate;
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copySearch, setCopySearch] = useState('');

  const getFormattedDate = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const d = new Date(date.getTime() - (offset*60*1000));
    return d.toISOString().split('T')[0];
  };

  const currentDateString = getFormattedDate(selectedDate);
  const dayEntry = history.find(d => d.date.split('T')[0] === currentDateString) || { date: currentDateString, meals: [], waterIntakeMl: 0 };

  const totalCalories = dayEntry.meals.reduce((acc, m) => acc + m.macros.calories, 0);
  const totalProtein = dayEntry.meals.reduce((acc, m) => acc + m.macros.protein, 0);
  const totalCarbs = dayEntry.meals.reduce((acc, m) => acc + m.macros.carbs, 0);
  const totalFats = dayEntry.meals.reduce((acc, m) => acc + m.macros.fats, 0);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const [newMeal, setNewMeal] = useState<{
    name: string;
    category: MealCategory;
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
  }>({
    name: '',
    category: 'Breakfast',
    calories: '',
    protein: '',
    carbs: '',
    fats: ''
  });

  // Get unique past meals
  const uniquePastMeals = history
    .flatMap(day => day.meals)
    .filter((v, i, a) => a.findIndex(t => t.name === v.name) === i)
    .sort((a, b) => b.id.localeCompare(a.id)); // Simple sorting

  const filteredPastMeals = uniquePastMeals.filter(m => 
    m.name.toLowerCase().includes(copySearch.toLowerCase())
  );

  const getAiSuggestion = async () => {
    setIsAiLoading(true);
    setAiSuggestion(null);
    try {
        const suggestion = await generateMealIdea(500, 'lunch');
        setAiSuggestion(suggestion);
    } catch (e) {
        setAiSuggestion("Could not generate recipe.");
    } finally {
        setIsAiLoading(false);
    }
  };

  const handleAddMealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeal.name || !newMeal.calories) return;

    const mealToAdd: Meal = {
        id: Date.now().toString(),
        name: newMeal.name,
        category: newMeal.category,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        macros: {
            calories: Number(newMeal.calories),
            protein: Number(newMeal.protein) || 0,
            carbs: Number(newMeal.carbs) || 0,
            fats: Number(newMeal.fats) || 0
        },
        ingredients: []
    };
    
    addMealToState(mealToAdd);
    setNewMeal({ name: '', category: 'Breakfast', calories: '', protein: '', carbs: '', fats: '' });
    setIsMealModalOpen(false);
  };

  const addMealToState = (meal: Meal) => {
    const exists = history.find(h => h.date.split('T')[0] === currentDateString);
    if (exists) {
        setHistory(prev => prev.map(h => 
            h.date.split('T')[0] === currentDateString ? { ...h, meals: [...h.meals, meal] } : h
        ));
    } else {
        setHistory([...history, { date: currentDateString, meals: [meal], waterIntakeMl: 0 }]);
    }
  };

  const handleCopyMeal = (sourceMeal: Meal) => {
    const clonedMeal: Meal = {
      ...sourceMeal,
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    addMealToState(clonedMeal);
    setIsCopyModalOpen(false);
  };

  const handleDeleteMeal = (mealId: string) => {
    setHistory(prev => prev.map(day => {
        if (day.date.split('T')[0] === currentDateString) {
            return {
                ...day,
                meals: day.meals.filter(m => m.id !== mealId)
            };
        }
        return day;
    }));
  };

  const macroData = [
    { name: 'Protein', value: totalProtein, color: '#2dd4bf' },
    { name: 'Carbs', value: totalCarbs, color: '#facc15' },
    { name: 'Fats', value: totalFats, color: '#fb7185' },
  ];

  const chartData = macroData.every(d => d.value === 0) 
    ? [{ name: 'Empty', value: 1, color: '#f3f4f6' }] 
    : macroData;

  const categories: MealCategory[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  return (
    <div className="space-y-6 relative">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
           <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Nutrition Log</h2>
              <p className="text-slate-500 mt-1 font-medium">Fuel your body right. 🌱</p>
           </div>
           <div className="flex gap-3">
              <button 
                  onClick={() => setIsCopyModalOpen(true)}
                  className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 px-5 py-3 rounded-2xl font-bold transition-all shadow-sm"
              >
                  <Copy className="w-5 h-5" />
                  <span className="hidden sm:inline">Copy Previous</span>
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

       <DateSelector currentDate={selectedDate} onDateChange={setSelectedDate} />

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
             <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-pink-100/50 border border-pink-50 flex flex-col items-center">
                <h3 className="text-xl font-black text-slate-800 w-full text-left mb-6 flex items-center gap-2">
                   <Utensils className="w-5 h-5 text-pink-400" /> Daily Calories
                </h3>
                <div className="w-56 h-56 relative">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie
                           data={chartData}
                           innerRadius={70}
                           outerRadius={90}
                           paddingAngle={5}
                           dataKey="value"
                           stroke="none"
                           cornerRadius={8}
                         >
                           {chartData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                         </Pie>
                         <Tooltip />
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                      <span className="text-4xl font-black text-slate-800">{totalCalories}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">kcal</span>
                   </div>
                </div>
                <div className="w-full mt-8 space-y-4">
                   <div className="flex justify-between items-center text-sm p-3 bg-teal-50 rounded-xl border border-teal-100">
                      <span className="flex items-center gap-2 text-teal-700 font-bold">
                        <div className="w-3 h-3 rounded-full bg-teal-400"></div> Protein
                      </span>
                      <span className="font-black text-teal-800">{totalProtein}g</span>
                   </div>
                   <div className="flex justify-between items-center text-sm p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                      <span className="flex items-center gap-2 text-yellow-700 font-bold">
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div> Carbs
                      </span>
                      <span className="font-black text-yellow-800">{totalCarbs}g</span>
                   </div>
                   <div className="flex justify-between items-center text-sm p-3 bg-rose-50 rounded-xl border border-rose-100">
                      <span className="flex items-center gap-2 text-rose-700 font-bold">
                        <div className="w-3 h-3 rounded-full bg-rose-400"></div> Fats
                      </span>
                      <span className="font-black text-rose-800">{totalFats}g</span>
                   </div>
                </div>
             </div>

             <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-200">
                <h3 className="font-black text-xl mb-2">Need Inspiration? 💡</h3>
                <p className="text-indigo-100 text-sm mb-6 font-medium">Let our AI Chef suggest a perfect high-protein meal for you.</p>
                <button 
                  onClick={getAiSuggestion}
                  disabled={isAiLoading}
                  className="w-full bg-white text-indigo-600 hover:bg-indigo-50 py-3 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                   {isAiLoading ? 'Thinking...' : 'Get Recipe Idea'}
                </button>
                {aiSuggestion && (
                    <div className="mt-6 p-4 bg-black/20 rounded-xl text-xs leading-relaxed max-h-48 overflow-y-auto custom-scrollbar font-medium">
                        {aiSuggestion}
                    </div>
                )}
             </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
              <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-slate-800">Meals</h3>
                  <button 
                    onClick={() => setIsMealModalOpen(true)}
                    className="bg-pink-100 hover:bg-pink-200 text-pink-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                  >
                      <Plus className="w-4 h-4" /> Log Meal
                  </button>
              </div>

              <div className="space-y-8">
                  {categories.map((category) => {
                    const mealsInCategory = dayEntry.meals.filter(m => m.category === category);
                    return (
                      <div key={category} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className={`w-3 h-3 rounded-full ${category === 'Breakfast' ? 'bg-orange-300' : category === 'Lunch' ? 'bg-yellow-300' : category === 'Dinner' ? 'bg-indigo-300' : 'bg-pink-300'}`}></span>
                          <span className="text-slate-500 font-bold text-sm uppercase tracking-widest">{category}</span>
                        </div>
                        
                        {mealsInCategory.length === 0 ? (
                           <div className="border-2 border-dashed border-slate-100 rounded-2xl p-6 text-center text-slate-300 text-sm font-bold">
                              No {category.toLowerCase()} logged yet.
                           </div>
                        ) : (
                          <div className="space-y-3">
                             {mealsInCategory.map((meal) => (
                                <motion.div 
                                    key={meal.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, ease: 'easeOut' }}
                                    className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-between group hover:border-pink-200 hover:shadow-md hover:shadow-pink-50 transition-all"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-pink-50 group-hover:text-pink-500 transition-colors">
                                            <UtensilIconForTime category={meal.category} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">{meal.name}</h4>
                                            <p className="text-xs text-slate-400 font-bold mt-1">{meal.time} • <span className="text-pink-500">{meal.macros.calories} kcal</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="hidden sm:flex gap-3 text-xs font-bold text-slate-500">
                                            <div className="text-center min-w-[60px] p-2 bg-slate-50 rounded-xl">
                                                <span className="block text-teal-500 text-sm">{meal.macros.protein}g</span>
                                                <span className="text-[10px] text-slate-300">PRO</span>
                                            </div>
                                            <div className="text-center min-w-[60px] p-2 bg-slate-50 rounded-xl">
                                                <span className="block text-yellow-500 text-sm">{meal.macros.carbs}g</span>
                                                <span className="text-[10px] text-slate-300">CARB</span>
                                            </div>
                                            <div className="text-center min-w-[60px] p-2 bg-slate-50 rounded-xl">
                                                <span className="block text-rose-500 text-sm">{meal.macros.fats}g</span>
                                                <span className="text-[10px] text-slate-300">FAT</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteMeal(meal.id)}
                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors ml-2"
                                            title="Delete Meal"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                             ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
          </div>
       </div>

       {/* Meal Modal */}
       {isMealModalOpen && (
         <div className="fixed inset-0 bg-purple-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl animate-fade-in border border-pink-100 overflow-hidden">
             <div className="p-6 border-b border-pink-50 flex justify-between items-center bg-pink-50/30">
               <h3 className="text-xl font-black text-slate-800">Log Meal</h3>
               <button onClick={() => setIsMealModalOpen(false)} className="text-slate-400 hover:text-pink-500 transition-colors">
                 <X className="w-6 h-6" />
               </button>
             </div>
             <form onSubmit={handleAddMealSubmit} className="p-8">
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                        <div className="relative">
                          <select 
                             value={newMeal.category}
                             onChange={(e) => setNewMeal({ ...newMeal, category: e.target.value as MealCategory })}
                             className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-400 appearance-none bg-white font-bold text-slate-700"
                          >
                            <option value="Breakfast">Breakfast ☀️</option>
                            <option value="Lunch">Lunch 🥗</option>
                            <option value="Dinner">Dinner 🌙</option>
                            <option value="Snack">Snack 🍎</option>
                          </select>
                          <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
                        </div>
                      </div>
                   </div>

                   <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Meal Name</label>
                     <input 
                       required
                       type="text"
                       placeholder="e.g. Avocado Toast"
                       className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-400 font-bold text-slate-700 placeholder-slate-300"
                       value={newMeal.name}
                       onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                     />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Calories</label>
                       <input 
                         required
                         type="number"
                         placeholder="0"
                         className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-400 font-bold text-slate-700"
                         value={newMeal.calories}
                         onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-teal-400 uppercase tracking-widest mb-2">Protein (g)</label>
                       <input 
                         type="number"
                         placeholder="0"
                         className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-400 font-bold text-slate-700"
                         value={newMeal.protein}
                         onChange={(e) => setNewMeal({ ...newMeal, protein: e.target.value })}
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-yellow-400 uppercase tracking-widest mb-2">Carbs (g)</label>
                       <input 
                         type="number"
                         placeholder="0"
                         className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-yellow-100 focus:border-yellow-400 font-bold text-slate-700"
                         value={newMeal.carbs}
                         onChange={(e) => setNewMeal({ ...newMeal, carbs: e.target.value })}
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-rose-400 uppercase tracking-widest mb-2">Fats (g)</label>
                       <input 
                         type="number"
                         placeholder="0"
                         className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-400 font-bold text-slate-700"
                         value={newMeal.fats}
                         onChange={(e) => setNewMeal({ ...newMeal, fats: e.target.value })}
                       />
                     </div>
                   </div>
                </div>
                <div className="mt-10">
                   <button 
                     type="submit"
                     className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-pink-200 transition-all transform hover:-translate-y-0.5"
                   >
                     Add Meal
                   </button>
                </div>
             </form>
           </div>
         </div>
       )}

       {/* Copy Meal Modal */}
       {isCopyModalOpen && (
         <div className="fixed inset-0 bg-teal-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[2rem] w-full max-w-lg h-[80vh] flex flex-col shadow-2xl animate-fade-in border border-teal-100 overflow-hidden">
             <div className="p-6 border-b border-teal-50 flex justify-between items-center bg-teal-50/30">
               <div>
                 <h3 className="text-2xl font-black text-slate-800">Copy Meal</h3>
                 <p className="text-sm text-teal-400 font-bold">Repeat a previous favorite</p>
               </div>
               <button onClick={() => setIsCopyModalOpen(false)} className="text-slate-400 hover:text-teal-500 transition-colors">
                 <X className="w-6 h-6" />
               </button>
             </div>
             
             <div className="p-6 border-b border-slate-50">
               <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                 <input 
                   type="text"
                   placeholder="Search previous meals..."
                   className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-300 font-bold"
                   value={copySearch}
                   onChange={(e) => setCopySearch(e.target.value)}
                 />
               </div>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
               {filteredPastMeals.length > 0 ? (
                 filteredPastMeals.map(meal => (
                   <button
                     key={meal.id}
                     onClick={() => handleCopyMeal(meal)}
                     className="w-full text-left bg-white p-5 rounded-2xl border border-slate-100 hover:border-teal-300 hover:shadow-md hover:shadow-teal-50 transition-all group"
                   >
                     <div className="flex justify-between items-center">
                       <div className="flex items-center gap-4">
                         <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-teal-50 group-hover:text-teal-500 transition-all">
                           <UtensilIconForTime category={meal.category} />
                         </div>
                         <div>
                           <h4 className="font-black text-slate-800 text-lg group-hover:text-teal-600 transition-colors">{meal.name}</h4>
                           <div className="flex gap-3 mt-1 text-xs font-bold text-slate-400">
                              <span className="text-teal-500">{meal.macros.calories} kcal</span>
                              <span>•</span>
                              <span>{meal.macros.protein}g Protein</span>
                              <span>•</span>
                              <span className="uppercase tracking-wide">{meal.category}</span>
                           </div>
                         </div>
                       </div>
                       <div className="p-2 bg-teal-50 text-teal-500 rounded-xl group-hover:bg-teal-500 group-hover:text-white transition-all">
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
                    <p className="text-slate-400 font-bold">No previous meals found.</p>
                 </div>
               )}
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

const UtensilIconForTime = ({ category }: { category: MealCategory }) => {
    switch(category) {
      case 'Breakfast': return <Sun className="w-5 h-5" />;
      case 'Lunch': return <Sun className="w-5 h-5" />;
      case 'Dinner': return <Moon className="w-5 h-5" />;
      default: return <Apple className="w-5 h-5" />;
    }
};

export default Nutrition;