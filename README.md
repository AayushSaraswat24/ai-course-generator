# ai-course-generator

This is a full-stack web application that generates a complete course — including topic-wise notes, quizzes, and relevant YouTube video links — from a single user prompt.

## Features

- Generate structured notes from any topic using AI
- Create multiple-choice quizzes with explanations
- Include embedded YouTube videos for each subtopic
- Download notes and quizzes as separate PDF files
- (Planned) User login system to save and revisit generated courses

## Why this project exists

The goal is to make learning easier and faster by using AI to convert a simple prompt into a full course.  
This also serves as a real-world project to demonstrate full-stack development skills, API integration, and user experience design.

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Other Tools:** Redis (rate limiting), MongoDB (user accounts), PDF generation

## Application Routes

| Path          | Purpose                                |
|---------------|----------------------------------------|
| `/`           | Landing page with project overview     |
| `/generate`   | Main page to enter prompt and view output |
| `/quiz`       | Take and review quiz (with answers)    |
| `/login`      | (Planned) User authentication          |
>>>>>>> acbac37ea87bde852555713702c594b63d99af55
