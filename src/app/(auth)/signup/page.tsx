'use client'

import { registerSchema } from "@/schemas/registerSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { AuthButton } from "@/components/authButton"
import { Eye, EyeOff } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar"


export default function register() {

    const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            userName: "",
            email: "",
            password: ""
        },
    })

    async function onSubmit(values: z.infer<typeof registerSchema>) {
        try {
            const response = await axios.post('/api/auth/register', values);
            setErrorMessage("");
            setSuccessMessage(response.data.message);
            form.reset();
        } catch (error:any) {
            setSuccessMessage("");
            setErrorMessage(error.response?.data?.message);
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <PublicNavbar />
            <div className="flex flex-1 items-center justify-center">
            <div className="p-8 rounded-lg w-full bg-gray-100 sm:max-w-md m-4 dark:bg-neutral-800">
                <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Create your Courgen account
                </h1>
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
                        Unlock tools to create notes, summarize PDFs, and generate quizzes. Join Courgen and supercharge your learning!
                    </p>
                </div>
                {successMessage && (
                    <div className="bg-green-100 text-center text-green-800 p-2 sm:p-4 rounded-md mb-4">
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="bg-red-100 text-center text-red-800 p-2 sm:p-4 rounded-md mb-4">
                        {errorMessage}
                    </div>
                )}

                <Form {...form}>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 flex flex-col items-center">
                        <FormField
                            control={form.control}
                            name="userName"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel className="text-lg">Username</FormLabel>
                                    <FormControl>
                                        <Input className="w-full p-4 border-none" placeholder="Enter your username" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
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
                            transition-colors">SignUp</Button>
                        
                    </form>
                </Form>
                <div className="sm:mt-6 mt-4">
                    <p className="text-sm text-center">
                        Already have an account?{" "}
                        <Link href="/signin" className="text-blue-500 cursor-pointer hover:underline">
                            Login
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
    )
} 