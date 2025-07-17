import mongoose,{Document,Schema} from "mongoose";

export interface Subscription{
    plan:'free' | 'pro' | 'enterprise';
    status:'active' | 'canceled' | 'trialing';
    startedAt:Date;
    expiredAt?:Date;
} 

export interface User extends Document {
    email:string;
    password:string;
    userName:string;
    createdAt:Date;
    subscription:Subscription;
    savedCourses:mongoose.Types.ObjectId[];
    isVerified:boolean;
}

const subscriptionSchema=new Schema<Subscription>({
    plan:{
        type:String,
        enum:['free','pro','enterprise'],
        default:'free',
    },
    status:{
        type:String,
        enum:['active','canceled','trialing'],
        default:'active',
    },
    startedAt:{
        type:Date,
        default:Date.now,
    },
    expiredAt:{
        type:Date,
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
        required:true,
    },
    userName:{
        type:String,
        required:true,
        minlength:3,
        maxlength:20
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    subscription:{type:subscriptionSchema, default:()=>({})},
    savedCourses:[{
        type:mongoose.Types.ObjectId,
        ref:'Course',
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