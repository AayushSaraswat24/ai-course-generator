import {z} from "zod";

export const courseInputSchema=z.object({
    userPrompt:z
    .string()
    .min(5,"prompt is too short.")
    .max(300,"prompt is too long."),

    userKnowledge:z
    .enum(["beginner", "moderate", "advanced"])
    .refine((val) => !!val, {
      message: "Invalid knowledge level.",
    }),

     includeVideos:z.boolean().optional(),
});

