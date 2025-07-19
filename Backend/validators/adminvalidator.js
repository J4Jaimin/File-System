import { z } from 'zod/v4';

export const deleteUserSchema = z.object({
    userId: z.string().min(24).max(24),
    type: z.enum(["soft", "hard"])
});

export const userIdValidatorSchema = z.string().min(24).max(24);