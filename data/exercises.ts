
import { ExerciseDefinition, ExerciseType } from '../types';

export const exerciseLibrary: ExerciseDefinition[] = [
  {
    id: 'squat-barbell',
    name: 'Barbell Squat',
    type: ExerciseType.STRENGTH,
    muscleGroup: 'Legs',
    difficulty: 'Intermediate',
    description: 'The king of leg exercises. Targets the quadriceps, hamstrings, and glutes while engaging the core.',
    instructions: [
      'Stand with feet shoulder-width apart, bar resting on your upper back.',
      'Keep your chest up and core braced.',
      'Lower your hips back and down as if sitting in a chair.',
      'Descend until thighs are at least parallel to the floor.',
      'Drive back up through your heels to the starting position.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2069&auto=format&fit=crop'
  },
  {
    id: 'deadlift-conventional',
    name: 'Conventional Deadlift',
    type: ExerciseType.STRENGTH,
    muscleGroup: 'Back',
    difficulty: 'Advanced',
    description: 'A full-body compound movement that primarily targets the posterior chain (back, glutes, hamstrings).',
    instructions: [
      'Stand with feet hip-width apart, barbell over mid-foot.',
      'Hinge at hips to grip the bar just outside your legs.',
      'Flatten your back and engage your lats.',
      'Drive through the floor, extending hips and knees simultaneously.',
      'Lock out at the top, then lower with control.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'bench-press',
    name: 'Bench Press',
    type: ExerciseType.STRENGTH,
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    description: 'The standard for upper body pushing strength, targeting pectorals, shoulders, and triceps.',
    instructions: [
      'Lie on the bench with eyes under the bar.',
      'Grip the bar slightly wider than shoulder-width.',
      'Unrack and lower the bar to your mid-chest.',
      'Press the bar back up to full extension.',
      'Keep feet planted and butt on the bench throughout.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'lunge-dumbbell',
    name: 'Dumbbell Walking Lunge',
    type: ExerciseType.STRENGTH,
    muscleGroup: 'Legs',
    difficulty: 'Beginner',
    description: 'Unilateral leg exercise that improves balance, stability, and leg strength.',
    instructions: [
      'Hold dumbbells at your sides.',
      'Step forward with one leg, lowering hips until both knees are at 90 degrees.',
      'Keep your torso upright.',
      'Drive through the front heel to step into the next lunge.',
      'Repeat alternating legs.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=1974&auto=format&fit=crop'
  },
  {
    id: 'pull-up',
    name: 'Pull Up',
    type: ExerciseType.STRENGTH,
    muscleGroup: 'Back',
    difficulty: 'Intermediate',
    description: 'Bodyweight exercise for building a wide back and strong biceps.',
    instructions: [
      'Grip the bar with palms facing away, slightly wider than shoulders.',
      'Hang with arms fully extended.',
      'Pull your chest up to the bar by driving elbows down.',
      'Lower yourself back down with control.',
      'Avoid swinging or kicking legs.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-211a74a96ded?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'shoulder-press-standing',
    name: 'Overhead Press',
    type: ExerciseType.STRENGTH,
    muscleGroup: 'Shoulders',
    difficulty: 'Intermediate',
    description: 'Develops shoulder size and strength along with core stability.',
    instructions: [
      'Stand with bar resting on front delts.',
      'Brace core and squeeze glutes.',
      'Press the bar directly overhead until arms are locked.',
      'Head moves forward slightly once bar clears face.',
      'Lower carefully to starting position.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1532029837066-6e53e7505e27?q=80&w=1974&auto=format&fit=crop'
  },
  {
    id: 'hip-thrust',
    name: 'Barbell Hip Thrust',
    type: ExerciseType.STRENGTH,
    muscleGroup: 'Glutes',
    difficulty: 'Intermediate',
    description: 'The best exercise for glute development and strength.',
    instructions: [
      'Sit with upper back against a bench, bar across hips.',
      'Plant feet shoulder-width apart.',
      'Drive hips up until fully extended, squeezing glutes hard.',
      'Shins should be vertical at the top.',
      'Lower hips back down with control.'
    ],
    imageUrl: 'https://plus.unsplash.com/premium_photo-1664109999537-088e7d964da2?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'plank',
    name: 'Plank',
    type: ExerciseType.STRENGTH,
    muscleGroup: 'Core',
    difficulty: 'Beginner',
    description: 'Isometric core exercise that builds stability and endurance.',
    instructions: [
      'Start in a push-up position but on forearms.',
      'Keep body in a straight line from head to heels.',
      'Engage core, glutes, and quads.',
      'Hold the position without letting hips sag or pike.',
      'Breathe steadily.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?q=80&w=2016&auto=format&fit=crop'
  },
  {
    id: 'bicep-curl',
    name: 'Dumbbell Bicep Curl',
    type: ExerciseType.STRENGTH,
    muscleGroup: 'Arms',
    difficulty: 'Beginner',
    description: 'Isolation exercise for the biceps.',
    instructions: [
      'Stand holding dumbbells with palms facing forward.',
      'Keep elbows tucked by your sides.',
      'Curl the weights up towards shoulders.',
      'Squeeze biceps at the top.',
      'Lower slowly to full extension.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'tricep-dip',
    name: 'Tricep Dip',
    type: ExerciseType.STRENGTH,
    muscleGroup: 'Arms',
    difficulty: 'Intermediate',
    description: 'Bodyweight exercise targeting triceps and chest.',
    instructions: [
      'Support yourself on parallel bars.',
      'Lower your body by bending elbows.',
      'Lean forward slightly to engage chest, or stay upright for triceps.',
      'Push back up to starting position.',
      'Don\'t let shoulders roll forward.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'treadmill-indoor-walk',
    name: 'Treadmill - Indoor Walk',
    type: ExerciseType.CARDIO,
    muscleGroup: 'Cardio',
    difficulty: 'Beginner',
    description: 'A custom indoor walking cardio workout. Excellent for joint recovery and active fat burn.',
    instructions: [
      'Set treadmill incline to a challenging yet comfortable grade (e.g. 3-8%).',
      'Walk at a steady power-walk pace (e.g. 2.8 - 3.5 mph).',
      'Focus on driving through your glutes and maintaining a upright posture.',
      'Log your overall time and estimated calories burned when complete.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1578875218787-8aa06a45637f?q=80&w=1974&auto=format&fit=crop'
  },
  {
    id: 'stair-stepper',
    name: 'Stair Stepper',
    type: ExerciseType.CARDIO,
    muscleGroup: 'Cardio',
    difficulty: 'Intermediate',
    description: 'High-intensity stair climber cardio. Fantastic for cardiovascular stamina and building lower body definition.',
    instructions: [
      'Stand upright on the steps and select a steady climbing pace.',
      'Keep your core engaged and avoid resting your weight heavily on the side handles.',
      'Squeeze your glutes on each step to maximize glute recruitment.',
      'Incorporate intervals of faster climbing to boost calorie expenditure.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1601422047244-ac99fb1b4f42?q=80&w=1974&auto=format&fit=crop'
  },
  {
    id: 'pilates-toning',
    name: 'Pilates',
    type: ExerciseType.CARDIO,
    muscleGroup: 'Cardio',
    difficulty: 'Intermediate',
    description: 'A low-impact, muscle-toning workout focused on core stability, postural control, and dynamic balance.',
    instructions: [
      'Begin on an exercise mat, focusing on deep diaphragmatic and lateral ribcage breathing.',
      'Perform core strengthening flows such as the Pilates Hundred and Roll-Ups.',
      'Focus on precise, controlled movements, maintaining active pelvic stability throughout.',
      'Log the duration and your energy level upon finishing.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070&auto=format&fit=crop'
  }
];
