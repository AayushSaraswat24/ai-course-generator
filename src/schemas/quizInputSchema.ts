import {z} from 'zod';

export const quizSchema=z.object({
    prompt:z
    .string()
    .min(5,"prompt is too short.")
    .max(300,"prompt is too long."),

    userKnowledge:z
    .enum(["beginner", "moderate", "advanced"])
    .refine((val) => !!val, {
      message: "Invalid knowledge level.",
    }),
})