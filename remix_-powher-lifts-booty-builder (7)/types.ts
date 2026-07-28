
export enum ExerciseType {
  STRENGTH = 'Strength',
  CARDIO = 'Cardio',
  FLEXIBILITY = 'Flexibility'
}

export interface Set {
  id: string;
  reps: number;
  weight: number; // in lbs or kg
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  sets: Set[];
  notes?: string;
  timeMinutes?: number;
  caloriesBurned?: number;
  completed?: boolean;
}

export interface Workout {
  id: string;
  title: string;
  date: string;
  durationMinutes: number;
  exercises: Exercise[];
  completed: boolean;
  isPreset?: boolean;
}

export interface MacroNutrients {
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
}

export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface Meal {
  id: string;
  name: string;
  category: MealCategory;
  time: string;
  macros: MacroNutrients;
  ingredients: string[];
}

export interface DailyNutrition {
  date: string;
  meals: Meal[];
  waterIntakeMl: number;
}

export interface WeightEntry {
  id: string;
  date: string;
  weight: number; // in lbs
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum Page {
  DASHBOARD = 'Dashboard',
  WORKOUTS = 'Workouts',
  NUTRITION = 'Nutrition',
  COACH = 'AI Coach',
  LIBRARY = 'Exercise Library'
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  type: ExerciseType;
  muscleGroup: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  instructions: string[];
  imageUrl: string;
}
