import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface DateSelectorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ currentDate, onDateChange }) => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    onDateChange(newDate);
  };

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      // Create date from string to avoid timezone shifts
      const [year, month, day] = e.target.value.split('-').map(Number);
      onDateChange(new Date(year, month - 1, day));
    }
  };

  // Helper to format YYYY-MM-DD for input value
  const getInputValue = () => {
    const offset = currentDate.getTimezoneOffset();
    const date = new Date(currentDate.getTime() - (offset*60*1000));
    return date.toISOString().split('T')[0];
  };

  const isToday = new Date().toDateString() === currentDate.toDateString();

  return (
    <div className="flex items-center justify-between bg-white p-2 rounded-2xl shadow-lg shadow-pink-100/50 border border-pink-100 mb-8 max-w-md mx-auto transform transition-all hover:scale-[1.02]">
      <button 
        onClick={handlePrevDay}
        className="p-3 hover:bg-pink-50 text-slate-400 hover:text-pink-500 rounded-xl transition-colors active:scale-95"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="flex items-center gap-4 relative group cursor-pointer px-4" onClick={() => dateInputRef.current?.showPicker()}>
        <div className="p-3 bg-pink-50 text-pink-500 rounded-2xl group-hover:bg-pink-500 group-hover:text-white transition-all shadow-sm">
            <CalendarIcon className="w-5 h-5" />
        </div>
        <div className="text-center">
            <h3 className="text-base font-black text-slate-800 leading-tight">
                {isToday ? 'Today' : currentDate.toLocaleDateString(undefined, { weekday: 'long' })}
            </h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">
                {currentDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
            </p>
        </div>
        
        {/* Hidden Date Input for Native Picker */}
        <input 
            type="date" 
            ref={dateInputRef}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            onChange={handleDateSelect}
            value={getInputValue()}
        />
      </div>

      <button 
        onClick={handleNextDay}
        className="p-3 hover:bg-pink-50 text-slate-400 hover:text-pink-500 rounded-xl transition-colors active:scale-95"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};

export default DateSelector;