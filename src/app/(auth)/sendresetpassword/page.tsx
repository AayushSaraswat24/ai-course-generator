"use client"

import PublicNavbar from "@/components/PublicNavbar"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from "axios";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import {z} from "zod";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function SendVerifyEmailPage() {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");

    const handleSubmit=async()=>{
        try{
            setIsLoading(true);
            setError("");
            setSuccess("");

            const result = emailSchema.safeParse({ email });

            if (!result.success) {
                setError(result.error.issues[0].message);
                setIsLoading(false);
                return;
            }

            const response=await axios.post("/api/auth/sendForgotPasswordEmail",{email:result.data.email})
            setSuccess(response.data.message);
            setEmail("");

        }catch(error:any){
            setError(error.response?.data?.message || "An error occurred. Please try again.");
            setSuccess("");
        }finally{
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <PublicNavbar/>
            <div className="flex flex-col flex-1 justify-center items-center ">

                <div className="mb-6 text-center px-2">
                    <h1 className="text-2xl font-bold ">Reset Your Password</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300 whitespace-break-spaces">
                        Enter your email address below and we’ll send you a link to reset your password.
                    </p>
                </div>

                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}

                <div className="space-y-4 text-center w-full max-w-md px-4 ">
                <Label htmlFor="email" className="text-lg">Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} id="email" className="bg-gray-100 p-4 border-none" placeholder="Email" />

                <Button disabled={isLoading} onClick={handleSubmit} className=" border-purple-500 border-2 font-bold cursor-pointer px-6 sm:px-10 hover:bg-purple-500 bg-transparent hover:border-0  dark:hover:text-black hover:text-white text-purple-700 ">
                    {
                    isLoading ? <Loader2Icon className="animate-spin" />  : "Validate"
            }
                    </Button>

                </div>

            </div>
        </div>
    );
}
