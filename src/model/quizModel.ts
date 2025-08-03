import mongoose, { Schema, Document } from "mongoose";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz extends Document {
  questions: Question[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const questionSchema = new Schema<Question>(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
    explanation: { type: String, required: true },
  },
  { _id: false }
);

const quizSchema = new Schema<Quiz>(
  {
    questions: { type: [questionSchema], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const QuizModel =
  mongoose.models.Quiz as mongoose.Model<Quiz> || mongoose.model<Quiz>("Quiz", quizSchema);

export default QuizModel;
