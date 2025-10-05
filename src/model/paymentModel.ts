import mongoose,{Document,Schema} from "mongoose";

export interface Payment extends Document{
    userId:string;
    orderId:string;
    amount:number;
    status:'pending' | 'active' | 'failed' | 'refunded';
    plan:'pro' | 'premium';
    paymentId:string;
    createdAt:Date;
    planExpiry:Date;
}

const PaymentSchema=new Schema<Payment>({
    userId:{
        type:String,
        required:true,
    },
    orderId:{
        type:String,
        required:true,
        unique:true,
    },
    amount:{
        type:Number,
        required:true,
    },
    status:{
        type:String,
        enum:['pending','active','failed','refunded'],
        default:'pending',
    },
    plan:{
        type:String,
        enum:['pro','premium'],
        required:true,
    },
    paymentId:{
        type:String,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    planExpiry:{
        type:Date,
        required:true,
    },
});

const PaymentModel=mongoose.models.Payment as mongoose.Model<Payment> || mongoose.model<Payment>("Payment",PaymentSchema);

export default PaymentModel;