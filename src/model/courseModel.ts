import mongoose,{Schema,Document} from "mongoose";

export interface Video {
  title: string;
  url: string;
  thumbnail: string;
}

export interface VideoLink {
  title: string;
  video: Video;
}

export interface Course extends Document {
    title:string[];
    notes:string[];
    videoLinks?:VideoLink[];
    createdBy:mongoose.Types.ObjectId;
    createdAt: Date;
}

const videoSchema = new Schema<Video>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    thumbnail: { type: String, required: true },
  },
  { _id: false } // no separate _id for nested object
);

const videoLinkSchema = new Schema<VideoLink>(
  {
    title: { type: String, required: true },
    video: { type: videoSchema, required: true },
  },
  { _id: false }
);

const courseSchema = new Schema<Course>(
  {
    title: { type: [String], required: true, default: [] },
    notes: { type: [String], required: true, default: [] },
    videoLinks: { type: [videoLinkSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const CourseModel = mongoose.models.Notes as mongoose.Model<Course> || mongoose.model<Course>('Notes', courseSchema);
export default CourseModel;