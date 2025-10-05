import { z } from 'zod';

// Shared validation schemas
export const emailSchema = z.string().email();
export const idSchema = z.string().cuid();
