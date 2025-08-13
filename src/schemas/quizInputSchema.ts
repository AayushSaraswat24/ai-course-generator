import {z} from 'zod';

export const quizSchema=z.object({
 prompt:z
    .string()
    .trim()
    .min(5,"prompt is too short.")
    .refine((val) => val.split(/\s+/).length <= 300, {
    message: "Prompt must not exceed 300 words."
  }),

    userKnowledge:z
    .enum(["beginner", "moderate", "advanced"])
    .refine((val) => !!val, {
      message: "Invalid knowledge level.",
    }),
})