"use client";

import PublicNavbar from '@/components/PublicNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { Eye, EyeOff, Loader2Icon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

const passwordSchema = z.object({
    newPassword: z.string().min(6, "Password must be at least 6 characters long").max(20, "Password must be at most 20 characters long"),
    });

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const uuidSchema = z.object({
        token: z.uuid("invalid uuid"),
    });
    const verifyToken = uuidSchema.safeParse({ token });
 
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [isValidToken, setIsValidToken] = useState(verifyToken.success);
    const [validToken, setValidToken] = useState(verifyToken.success ? verifyToken.data.token.trim() : "");

        

    const handleSubmit = async () => {
        try{
            setIsLoading(true);
            setError("");
            setSuccess("");

            if (!isValidToken) {
                setError("Invalid token");
                setIsLoading(false);
                return;
            }

            const result = passwordSchema.safeParse({ newPassword });

            if (!result.success) {
                console.log(`Password validation failed: ${JSON.stringify(result.error.issues)}`);
                setError(result.error.issues[0].message);
                setIsLoading(false);
                return;
            }

            const response=await axios.post("api/auth/resetPassword", { token:validToken, newPassword:newPassword.trim() });
            setSuccess(response.data.message);
            setNewPassword("");
        }catch(error:any){ 
            setError(error.response?.data?.message);
            setSuccess("");
        }finally{
            setIsLoading(false);
        }
    }

    return(
         <div className="min-h-screen flex flex-col">
            <PublicNavbar/>
            <div className="flex flex-col flex-1 justify-center items-center ">
            
        {isValidToken ? (
            <>
                <div className="mb-6 text-center px-2">
                    <h1 className="text-2xl font-bold ">Reset your password</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300 whitespace-break-spaces">
                        To continue, please enter your new password below.
                    </p>
                </div>

                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}

                <div className="space-y-4 text-center w-full max-w-md px-4  ">
                    <Label htmlFor="password" className="text-lg">Password</Label>
                    <div className="relative ">

                    <Input type={showPassword ? "text" : "password"}  value={newPassword} onChange={e => setNewPassword(e.target.value)} id="password" className="bg-gray-100 p-4 border-none w-full " placeholder="Password" />
                    {showPassword ? (
                            <Eye
                            className="absolute right-3 top-1/5 trans-translate-y-1/2 text-gray-300 cursor-pointer"
                            onClick={() => setShowPassword(false)}
                             onMouseDown={e => e.preventDefault()}
                             />
                        ) : (
                             <EyeOff
                            className="absolute right-3 top-1/5  trans-translate-y-1/2 text-gray-300 cursor-pointer"
                            onClick={() => setShowPassword(true)}
                            onMouseDown={e => e.preventDefault()}
                            />
                            )}

                    </div>

                    <Button disabled={isLoading} onClick={handleSubmit} className=" border-purple-500 border-2 font-bold cursor-pointer px-6 sm:px-10 hover:bg-purple-500 bg-transparent hover:border-0  dark:hover:text-black hover:text-white text-purple-700 ">
                        {isLoading ? <Loader2Icon className="animate-spin" /> : "Update"}
                    </Button>
                </div>
            </>
        ) : (
            <div>
                <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto p-6 rounded-lg shadow-md">
                    <h2 className="text-3xl font-bold text-red-600 mb-4 text-center">Invalid Token</h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300 text-center">Check the link or reset again.</p>
                </div>
            </div>
        )}
            </div>
            </div>
    )

}
