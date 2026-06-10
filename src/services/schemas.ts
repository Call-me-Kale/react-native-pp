import { z } from 'zod';

// Auth Schemas
export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email().optional().nullable(),
});

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: UserSchema,
});

// Training Schemas
export const TrainingTypeSchema = z.enum(['swimming', 'cycling', 'running']);

export const TrainingEntrySchema = z.object({
  id: z.string(),
  type: TrainingTypeSchema,
  title: z.string().optional().nullable(),
  date: z.string(),
  duration: z.number().min(0),
  distance: z.number().min(0),
  calories: z.number().min(0),
  avgHeartRate: z.number().min(0),
  notes: z.string().optional().nullable(),
  equipmentId: z.string().optional().nullable(),
});

export const TrainingEntryListSchema = z.array(TrainingEntrySchema);

// Equipment Schemas
export const EquipmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  brand: z.string(),
  model: z.string(),
  purchaseDate: z.string(),
  notes: z.string().optional().nullable(),
  totalDistance: z.number().min(0),
  lastServiceDistance: z.number().min(0),
  serviceInterval: z.number().min(0),
});

export const EquipmentListSchema = z.array(EquipmentSchema);

export const EquipmentUsageStatsSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  totalDistance: z.number(),
  trainingCount: z.number(),
  maxDistance: z.number(),
  wearPercentage: z.number(),
  distanceSinceService: z.number(),
});

export const EquipmentLogSchema = z.object({
  id: z.string(),
  equipmentId: z.string(),
  description: z.string(),
  distance: z.number(),
  date: z.string(),
});

export const EquipmentLogListSchema = z.array(EquipmentLogSchema);

// Stats Schemas
export const TrainingDayInfoSchema = z.object({
  date: z.string(),
  disciplines: z.array(z.string()),
});

export const TrainingStatsSchema = z.object({
  totalDistance: z.number(),
  totalCalories: z.number(),
  totalDuration: z.number(),
  todayDistance: z.number(),
  todayCalories: z.number(),
  averageHeartRate: z.number(),
  trainingsByType: z.object({
    swimming: z.number(),
    cycling: z.number(),
    running: z.number(),
  }),
  equipmentUsage: z.array(EquipmentUsageStatsSchema),
  trainingDates: z.array(TrainingDayInfoSchema),
});

// Streak Schemas
export const StreakRangeSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  days: z.number(),
});

export const StreakDataSchema = z.object({
  currentStreak: z.number(),
  longestStreak: z.number(),
  isActiveToday: z.boolean(),
  streakDates: z.array(z.string()),
  ranges: z.array(StreakRangeSchema),
});
