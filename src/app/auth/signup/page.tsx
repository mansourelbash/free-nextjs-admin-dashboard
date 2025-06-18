import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up | HRMS",
  description: "Create your HRMS account",
};

export default async function SignUpPage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <SignUpForm />
      </div>
      
      {/* Right side - Image/Branding */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-blue-700 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Join HRMS Today</h1>
            <p className="text-xl opacity-90">Start managing your workforce efficiently</p>
          </div>
        </div>
      </div>
    </div>
  );
}
