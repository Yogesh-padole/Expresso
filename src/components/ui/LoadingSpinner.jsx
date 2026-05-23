import React from "react";
import { Coffee } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F7F2EC]">
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="relative flex items-center justify-center w-32 h-32">
          {/* Background Ring */}
          <div className="absolute w-full h-full rounded-full border-[10px] border-[#EADFD3]"></div>

          {/* Animated Ring */}
          <div className="absolute w-full h-full rounded-full border-[10px] border-transparent border-t-[#7A3E1D] animate-spin"></div>

          {/* Coffee Icon */}
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#FDF9F5] shadow-md">
            <Coffee className="w-10 h-10 text-[#7A3E1D]" strokeWidth={2.2} />
          </div>
        </div>

        {/* Brand */}
        <h1 className="mt-8 text-5xl font-serif text-[#7A3E1D]">Expresso</h1>

        {/* Loading Text */}
        <p className="mt-3 text-lg text-[#8D6E63]">Loading your feed...</p>

        {/* Animated Dots */}
        <div className="flex gap-3 mt-5">
          <span className="w-3 h-3 rounded-full bg-[#7A3E1D] animate-bounce"></span>

          <span
            className="w-3 h-3 rounded-full bg-[#D7C5B4] animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></span>

          <span
            className="w-3 h-3 rounded-full bg-[#D7C5B4] animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></span>
        </div>
      </div>
    </div>
  );
}
