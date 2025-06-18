"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function OtpVerificationForm() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState("");
  const [otpType, setOtpType] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const typeParam = searchParams.get("type");
    
    if (emailParam) setEmail(emailParam);
    if (typeParam) setOtpType(typeParam);
    
    // Start 60-second countdown for resend
    setCountdown(60);
  }, [searchParams]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (otpType === "REGISTRATION") {
        // Get stored registration data
        const pendingData = sessionStorage.getItem('pendingRegistration');
        if (!pendingData) {
          setError("Registration data not found. Please start registration again.");
          return;
        }

        const registrationData = JSON.parse(pendingData);
        
        // Complete registration with OTP
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...registrationData,
            otp,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess("Registration completed successfully!");
          sessionStorage.removeItem('pendingRegistration');
          setTimeout(() => {
            router.push("/auth/signin?message=Registration successful! Please sign in.");
          }, 1500);
        } else {
          setError(data.error || "Invalid or expired OTP");
        }
      } else {
        // Handle other OTP types (password reset, etc.)
        const response = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
            type: otpType,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess("OTP verified successfully!");
          
          // Redirect based on OTP type
          setTimeout(() => {
            if (otpType === "PASSWORD_RESET") {
              router.push(`/auth/reset-password?token=${data.token}`);
            } else {
              router.push("/auth/signin");
            }
          }, 1500);
        } else {
          setError(data.error || "Invalid or expired OTP");
        }
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError("");

    try {
      const endpoint = otpType === "PASSWORD_RESET" ? "/api/auth/forgot-password" : "/api/auth/send-otp";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          type: otpType,
        }),
      });

      if (response.ok) {
        setSuccess("New OTP sent to your email!");
        setCountdown(60);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to resend OTP");
      }
    } catch {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const getTitle = () => {
    switch (otpType) {
      case "REGISTRATION":
        return "Verify Your Email";
      case "PASSWORD_RESET":
        return "Verify Reset Code";
      default:
        return "Verify OTP";
    }
  };

  const getDescription = () => {
    switch (otpType) {
      case "REGISTRATION":
        return "We've sent a verification code to your email. Please enter it below to complete your registration.";
      case "PASSWORD_RESET":
        return "We've sent a reset code to your email. Please enter it below to reset your password.";
      default:
        return "Please enter the verification code sent to your email.";
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto">
      <div className="mb-5 sm:mb-8">
        <h1 className="mb-2 font-semibold text-gray-800 text-2xl dark:text-white">
          {getTitle()}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {getDescription()}
        </p>
        {email && (
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
            Sent to: {email}
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 rounded-lg dark:bg-green-900/20 dark:text-green-400">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Verification Code*
          </label>
          <input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Enter 6-digit code"
            required
            maxLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center text-lg tracking-widest"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || otp.length !== 6}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Didn&apos;t receive the code?{" "}
          {countdown > 0 ? (
            <span className="text-gray-500">
              Resend in {countdown}s
            </span>
          ) : (
            <button
              onClick={handleResendOtp}
              disabled={isResending}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend Code"}
            </button>
          )}
        </p>
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/auth/signin"
          className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
