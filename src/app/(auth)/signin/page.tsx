'use client'

import PublicNavbar from "@/components/PublicNavbar";
import { loginSchema } from "@/schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { signIn } from "next-auth/react";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { AuthButton } from "@/components/authButton";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function SignIn() {

    const [formError, setformError] = useState<string | null>(null);
    const router=useRouter();
    const [showPassword, setShowPassword] = useState(false)

 const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit=async (values:z.infer<typeof loginSchema>)=>{
    const res=await signIn("credentials", {
      ...values,
      redirect: false
    })

    if (res?.error) {
      setformError(typeof res.error === "string" ? res.error : "An unexpected error occurred.");
    }else{
        try{
            const response=await axios.post('api/auth/set-token');
            router.replace('/dashboard');
        }catch(error:any){
            setformError(error.response?.data.message);
        }
    }
  }

    return (
        <div className="min-h-screen flex flex-col">
            <PublicNavbar />
            <div className="flex flex-1 items-center justify-center">
                <div className="p-8 rounded-lg w-full bg-gray-100 sm:max-w-md m-4 dark:bg-neutral-800">

                {formError && (
                    <div className="mb-4 text-center  text-red-500">
                        {formError}
                    </div>
                )}

                <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Sign in to Courgen
                </h1>
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
                        Access your personalized learning tools, manage notes, summarize PDFs, and generate quizzes. Welcome back to Courgen!
                    </p>
                </div>

                    <Form {...form}>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 flex flex-col items-center">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel className="text-lg">Email</FormLabel>
                                    <FormControl >
                                        <Input
                                            className="w-full p-4 border-none"
                                            type="email"
                                            placeholder="abc@example.com"
                                            {...field}
                                            />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel className="text-lg">Password</FormLabel>
                                    <FormControl className="relative">
                                        <div>
                                            <Input className="w-full p-4 border-none" type={showPassword ? "text" : "password"} placeholder="Enter your password" {...field} />
                                            {showPassword ? (
                                                <Eye
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 cursor-pointer"
                                                onClick={() => setShowPassword(false)}
                                                onMouseDown={e => e.preventDefault()}
                                                />
                                            ) : (
                                                <EyeOff
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 cursor-pointer"
                                                onClick={() => setShowPassword(true)}
                                                onMouseDown={e => e.preventDefault()}
                                                />
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />

                        <Button
                            type="submit"
                            className="px-6 py-3 mt-2 text-base rounded-lg cursor-pointer font-bold text-white
                            bg-violet-500
                            hover:bg-violet-600
                            transition-colors">Login</Button>
                        
                    </form>
                </Form>
                <div className="sm:mt-6 mt-4">
                    <p className="text-sm text-center">
                        Already have an account?{" "}
                        <Link href="/signup" className="text-blue-500 cursor-pointer hover:underline">
                            SignUp
                        </Link>
                    </p>
                </div>

                <p className="text-center mt-2  text-sm text-gray-500 dark:text-gray-300">or</p>

                <div className="mt-2 sm:mt-4 flex justify-center">
                    <AuthButton />

                </div>
                </div>
            </div>
        </div>
    );
}
