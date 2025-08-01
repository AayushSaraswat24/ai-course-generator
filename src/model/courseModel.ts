import mongoose,{Schema,Document} from "mongoose";

export interface Course extends Document {
    title:string;
    notes:string;
    videoLinks?:string[];
  
    createdBy:mongoose.Types.ObjectId;
    createdAt: Date;
}

const courseSchema = new Schema<Course>(
  {
    title: { type: String, required: true },
    notes: { type: String, required: true },
    videoLinks: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const CourseModel = mongoose.models.Course as mongoose.Model<Course> || mongoose.model<Course>('Course', courseSchema);
export default CourseModel;