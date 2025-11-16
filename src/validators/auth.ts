import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' }),
})

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(1, { message: 'Name is required' })
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(255, { message: 'Name must not exceed 255 characters' }),
  email: z
    .string({ required_error: 'Email is required' })
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(255, { message: 'Password must not exceed 255 characters' }),
  password_confirmation: z
    .string({ required_error: 'Password confirmation is required' })
    .min(1, { message: 'Password confirmation is required' }),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ['password_confirmation'],
})

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),
})

export const resetPasswordSchema = z.object({
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(255, { message: 'Password must not exceed 255 characters' }),
  password_confirmation: z
    .string({ required_error: 'Password confirmation is required' })
    .min(1, { message: 'Password confirmation is required' }),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ['password_confirmation'],
})

export const changePasswordSchema = z.object({
  current_password: z
    .string({ required_error: 'Current password is required' })
    .min(1, { message: 'Current password is required' }),
  password: z
    .string({ required_error: 'New password is required' })
    .min(1, { message: 'New password is required' })
    .min(8, { message: 'New password must be at least 8 characters' })
    .max(255, { message: 'New password must not exceed 255 characters' }),
  password_confirmation: z
    .string({ required_error: 'Password confirmation is required' })
    .min(1, { message: 'Password confirmation is required' }),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ['password_confirmation'],
})
