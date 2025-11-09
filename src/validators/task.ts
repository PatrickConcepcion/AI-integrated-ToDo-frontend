import { z } from 'zod'

export const taskSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(1, { message: 'Title is required' })
    .max(255, { message: 'Title must not exceed 255 characters' }),
  description: z
    .string()
    .max(1000, { message: 'Description must not exceed 1000 characters' })
    .optional()
    .or(z.literal('')),
  category_id: z
    .string()
    .optional()
    .or(z.literal('')),
  priority: z
    .enum(['low', 'medium', 'high'], { required_error: 'Please select a priority' }),
  due_date: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((date) => {
      if (!date || date === '') return true
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate >= today
    }, { message: 'Due date cannot be in the past' }),
  notes: z
    .string()
    .max(1000, { message: 'Notes must not exceed 1000 characters' })
    .optional()
    .or(z.literal('')),
})

export const categorySchema = z.object({
  name: z
    .string({ required_error: 'Category name is required' })
    .min(1, { message: 'Category name is required' })
    .max(255, { message: 'Category name must not exceed 255 characters' }),
  description: z
    .string()
    .max(500, { message: 'Description must not exceed 500 characters' })
    .optional()
    .or(z.literal('')),
  color: z
    .string({ required_error: 'Color is required' })
    .min(1, { message: 'Color is required' })
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: 'Please enter a valid hex color (e.g., #FF0000)' }),
})
