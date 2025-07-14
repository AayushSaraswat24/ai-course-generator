import mongoose,{Schema,Document} from "mongoose";

interface QuizQuestion {
  question: string;
  options:string[];
  correctAnswer:string;
  explanation?: string;
}

export interface Course extends Document {
    title:string;
    notes:string;
    videoLinks:string[];
    quiz?:QuizQuestion[];
    createdBy:mongoose.Types.ObjectId;
    createdAt: Date;
}

const quizSchema = new Schema<QuizQuestion>(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    explanation: String,
  },
  { _id: false }
);

const courseSchema = new Schema<Course>(
  {
    title: { type: String, required: true },
    notes: { type: String, required: true },
    videoLinks: [{ type: String, required: true }],
    quiz: [quizSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Course = mongoose.models.Course as mongoose.Model<Course> || mongoose.model<Course>('Course', courseSchema);
export default Course;