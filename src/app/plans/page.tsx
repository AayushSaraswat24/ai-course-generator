"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import {
  BookOpen,
  HelpCircle,
  Save,
  FileStack,
  Type,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";

 function Plans() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const plans = {
    monthly: [
      {
        name: "Free",
        price: "₹0 / month",
        limits: {
          notesReq: "10/week",
          quizReq: "10/week",
          savedNotes: "5 total",
          savedQuiz: "5 total",
          pdfs: "5/week",
          words: "5,000 words",
        },
        action: (
          <Link
            href="/notes"
            className="bg-purple-600 hover:bg-purple-700 text-white w-full py-3 rounded-lg font-semibold transition text-center block"
          >
            Select
          </Link>
        ),
      },
      {
        name: "Pro",
        price: "₹399 / month",
        limits: {
          notesReq: "20/week",
          quizReq: "20/week",
          savedNotes: "15 total",
          savedQuiz: "15 total",
          pdfs: "20/week",
          words: "25,000 words",
        },
        action: (
          <button
            onClick={() => handlePayment("Pro1M")}
            disabled={loading}
            className={`bg-purple-600 hover:bg-purple-700 text-white w-full py-3 rounded-lg font-semibold transition ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            Activate
          </button>
        ),
      },
      {
        name: "Premium",
        price: "₹699 / month",
        limits: {
          notesReq: "Unlimited",
          quizReq: "Unlimited",
          savedNotes: "30 total",
          savedQuiz: "30 total",
          pdfs: "Unlimited",
          words: "75,000 words",
        },
        action: (
          <button
            onClick={() => handlePayment("Premium1M")}
            disabled={loading}
            className={`bg-purple-600 hover:bg-purple-700 text-white w-full py-3 rounded-lg font-semibold transition ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            Activate
          </button>
        ),
      },
    ],
    yearly: [
      {
        name: "Free",
        price: "₹0 / year",
        limits: {
          notesReq: "10/week",
          quizReq: "10/week",
          savedNotes: "5 total",
          savedQuiz: "5 total",
          pdfs: "5/week",
          words: "5,000 words",
        },
        action: (
          <Link
            href="/notes"
            className="bg-purple-600 hover:bg-purple-700 text-white w-full py-3 rounded-lg font-semibold transition text-center block"
          >
            Select
          </Link>
        ),
      },
      {
        name: "Pro",
        price: "₹3,990 / year",
        limits: {
          notesReq: "20/week",
          quizReq: "20/week",
          savedNotes: "15 total",
          savedQuiz: "15 total",
          pdfs: "20/week",
          words: "25,000 words",
        },
        action: (
          <button
            onClick={() => handlePayment("Pro1Y")}
            disabled={loading}
            className={`bg-purple-600 hover:bg-purple-700 text-white w-full py-3 rounded-lg font-semibold transition ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            Activate
          </button>
        ),
      },
      {
        name: "Premium",
        price: "₹6,990 / year",
        limits: {
          notesReq: "Unlimited",
          quizReq: "Unlimited",
          savedNotes: "30 total",
          savedQuiz: "30 total",
          pdfs: "Unlimited",
          words: "75,000 words",
        },
        action: (
          <button
            onClick={() => handlePayment("Premium1Y")}
            disabled={loading}
            className={`bg-purple-600 hover:bg-purple-700 text-white w-full py-3 rounded-lg font-semibold transition ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            Activate
          </button>
        ),
      },
    ],
  };

      const loadRazorpayScript = async () => {
        return new Promise<boolean>((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
        });
  };


    const handlePayment = async(planKey: 'Premium1M' | 'Pro1M'  | 'Premium1Y' | 'Pro1Y' ) => {
        setLoading(true);
   
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            console.log("unable to load payment gateway");
            setLoading(false);
            return;
        }

        try{
            const res=await fetchWithAuth({path:"/api/orders",data:{sub:planKey}});
            if(!res.success){
                throw new Error(res.error?.message || "Failed to create order");``
            }

            const options={
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: res.success.amount,
                currency: res.success.currency, 
                name: "courgen",
                description: `${res.success.sub} Subscription`,
                order_id: res.success.orderId,
                handler: async function (response: any) {
                    router.push("/dashboard");
                },
                theme: {
                color: "#3399cc",
                },
            }

            const razor = new (window as any).Razorpay(options);
            razor.open();
        }catch(err){
            console.log(`error in payment`);
        }finally{
            setLoading(false);
        }
    };

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 min-h-screen">
      {/* Navbar */}
      <PublicNavbar />

      {/* Header */}
      <section className="text-center py-16 px-4">
        <h1 className="sm:text-5xl text-3xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-neutral-700 dark:text-neutral-300 text-lg">
          Upgrade your learning power — switch between monthly or yearly billing anytime.
        </p>

        {/* Billing Toggle */}
        <div className="flex justify-center mt-8 space-x-4">
          <button
            className={`px-6 py-2 rounded-full font-medium transition ${
              billingCycle === "monthly"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            }`}
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </button>
          <button
            className={`px-6 py-2 rounded-full font-medium transition ${
              billingCycle === "yearly"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            }`}
            onClick={() => setBillingCycle("yearly")}
          >
            Yearly
          </button>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-7xl mx-auto px-6 pb-32 grid md:grid-cols-3 gap-8">
        {plans[billingCycle].map((plan, idx) => (
          <div
            key={idx}
            className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-between transition hover:shadow-xl"
          >
            <div className="w-full text-center space-y-4">
              <h2 className="text-3xl font-bold">{plan.name}</h2>
              <p className="text-2xl  font-semibold">{plan.price}</p>
              <div className="mt-6 space-y-3 text-neutral-700 dark:text-neutral-300 text-left">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 " />
                  <span>Notes Requests: {plan.limits.notesReq}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 " />
                  <span>Quiz Requests: {plan.limits.quizReq}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  <span>Saved Notes: {plan.limits.savedNotes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Save className="w-5 h-5 " />
                  <span>Saved Quizzes: {plan.limits.savedQuiz}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileStack className="w-5 h-5 " />
                  <span>PDF Summaries: {plan.limits.pdfs}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Type className="w-5 h-5 " />
                  <span>Max PDF Words: {plan.limits.words}</span>
                </div>
              </div>
            </div>
            <div className="w-full mt-8">{plan.action}</div>
          </div>
        ))}
      </section>
    </div>
  );
}


export default function PlansPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Plans />
    </Suspense>
  )
}