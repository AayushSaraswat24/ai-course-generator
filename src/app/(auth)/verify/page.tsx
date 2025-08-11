"use client"

import PublicNavbar from "@/components/PublicNavbar";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Loader2Icon } from "lucide-react";

export default function VerifyPage() {
    const searchParams=useSearchParams();
    const [email, setEmail] = useState<string|null>(null);
    const [value, setValue] = useState<string>("")
    const [error, setError] = useState<string|null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<string>("");

    useEffect(() => {
        const emailParam = searchParams.get("email");
            setEmail(emailParam);
    }, [searchParams]);

    const Verify=async()=>{
        try{
            if (value.length !== 6 || !/^\d{6}$/.test(value)) {
                setError("Please enter a valid 6-digit numeric OTP");
                return;
            }
            setIsLoading(true);
            setError(null);
            const response = await axios.post("/api/auth/verify", { email, otp: value });
            setSuccess(response.data.message);
            setTimeout(() => {
                window.location.href = "/signin";
            }, 2000);
        }catch(error:any){
            setError(error.response?.data?.message);
        }finally{
            setIsLoading(false);
        }
    }

  return (
    <div className="flex flex-col min-h-screen ">

    <PublicNavbar/>
     <div className="flex-1 flex justify-center flex-col items-center ">

        <div className="mb-8 text-center">
          <h1 className="sm:text-2xl font-bold text-xl">Email Verification</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 whitespace-break-spaces ">
            Please enter the 6-digit code sent to your email to verify your account.
          </p>
        </div>

      {email && email.trim().length>2 ? (
          <div className="text-center">
         
    <div className="space-y-8">
        <InputOTP
            maxLength={6}
            value={value}
            onChange={(value) => setValue(value)} >
            <InputOTPGroup>
            <InputOTPSlot index={0} className="text-lg" />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
            </InputOTPGroup>

         </InputOTP>

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-500 text-sm">
            {success}
          </div>
        )}

        <Button disabled={isLoading} onClick={Verify} className="border-purple-500 border-2 font-bold cursor-pointer px-6 sm:px-10 hover:bg-purple-500 bg-transparent hover:border-0  dark:hover:text-black hover:text-white text-purple-700">
            {
                isLoading ? <Loader2Icon className="animate-spin" />  : "Verify"
            }
            </Button>
    </div>

        </div>
      ) : (
          <div>
          <p>No email found .please check the link</p>
        </div>
      )}
      </div>
      
    </div>
  );
}