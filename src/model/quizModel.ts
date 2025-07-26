import mongoose,{Schema,Document} from "mongoose";

interface QuizQuestion extends Document {
  question: string;
  options:string[];
  correctAnswer:string;
  explanation?: string;
}

const quizSchema = new Schema<QuizQuestion>(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    explanation: String,
  }
);

const quizModel = mongoose.models.quiz as mongoose.Model<QuizQuestion> || mongoose.model<QuizQuestion>("quiz", quizSchema);
export default quizModel;