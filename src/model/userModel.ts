import mongoose,{Document,Schema} from "mongoose";

export interface Subscription{
    plan:'free' | 'pro' | 'premium';
    status:'active' | 'failed' | 'pending' | 'refunded';
    startedAt:Date;
    expiredAt?:Date;
} 

export interface User extends Document {
    _id: mongoose.Types.ObjectId;
    email:string;
    password?:string;
    userName:string;
    subscription:Subscription;
    savedCourses:mongoose.Types.ObjectId[];
    savedQuizzes: mongoose.Types.ObjectId[];
    isVerified:boolean;
}

const subscriptionSchema=new Schema<Subscription>({
    plan:{
        type:String,
        enum:['free','pro','premium'],
        default:'free',
    },
    status:{
        type:String,
        enum:['active','failed','pending','refunded'],
        default:'active',
    },
    startedAt:{
        type:Date,
        default:Date.now,
    },
    expiredAt:{
        type:Date,
        default:Date.now,
    },   
},
    {
        _id:false,
    },
);

const userSchema=new Schema<User>({
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
    },
    userName:{
        type:String,
        required:true,
        minlength:3,
        maxlength:20
    },
    subscription:{type:subscriptionSchema, default:()=>({})},
    savedCourses:[{
        type:mongoose.Types.ObjectId,
        ref:'Course',
    }],
    savedQuizzes: [{
        type: mongoose.Types.ObjectId,
        ref: 'Quiz',
    }],
    isVerified:{
        type:Boolean,
        default:false,
    },

    },
    {timestamps:true},
);

const UserModel=mongoose.models.User as mongoose.Model<User> || mongoose.model<User>('User',userSchema);

export default UserModel;