import { z } from "zod";

export const signupSchema = z.object({
    name: z.string().min(3),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});