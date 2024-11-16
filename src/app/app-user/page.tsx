"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";

export default function UserMemories() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [contactInfo, setContactInfo] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputType, setInputType] = useState<"email" | "phone">("email");

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsVerified(true);
    setIsLoading(false);
  };

  const floatingElements = Array(12).fill(null).map((_, i) => ({
    emoji: ["🎂", "🎈", "🎁", "🎊", "✨", "🎉"][i % 6],
    initialX: Math.random() * 100,
    initialY: Math.random() * -100,
    duration: 15 + Math.random() * 10
  }));

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 to-purple-900">
      {/* Floating Birthday Elements */}
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          initial={{ 
            x: `${element.initialX}vw`, 
            y: `${element.initialY}vh`,
            opacity: 0
          }}
          animate={{
            y: "120vh",
            opacity: [0, 1, 1, 0],
            rotate: [0, 360]
          }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute text-4xl pointer-events-none"
        >
          {element.emoji}
        </motion.div>
      ))}

      <div className="relative z-10 max-w-6xl mx-auto min-h-screen px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full bg-black/40 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10"
        >
          {!isVerified ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="max-w-md mx-auto text-center"
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                Access Your Celebration Space
              </h1>
              <p className="text-gray-300 mb-8">
                Please verify your identity to view the birthday memories shared by your loved ones.
              </p>

              <div className="flex justify-center gap-4 mb-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setInputType("email")}
                  className={`px-6 py-2 rounded-full transition-all ${
                    inputType === "email"
                      ? "bg-purple-500 text-white shadow-lg"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  Email
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setInputType("phone")}
                  className={`px-6 py-2 rounded-full transition-all ${
                    inputType === "phone"
                      ? "bg-purple-500 text-white shadow-lg"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  Phone
                </motion.button>
              </div>

              <form onSubmit={handleVerification} className="space-y-4">
                <input
                  type={inputType === "email" ? "email" : "tel"}
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder={inputType === "email" ? "Enter your email address" : "Enter your phone number"}
                  className="w-full px-4 py-3 rounded-lg border border-purple-500/30 bg-black/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none backdrop-blur-sm"
                  required
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:from-purple-600 hover:to-pink-600'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Continue to Memories'}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <>
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                  Your Birthday Memories ✨
                </h1>
                <p className="text-gray-300 text-lg md:text-xl">
                  Discover all the wonderful messages, photos, and wishes shared by your loved ones
                </p>
              </motion.div>

              <div className="flex justify-center gap-4 mb-8">
                {["All", "Photos", "Messages", "Videos"].map((filter) => (
                  <motion.button
                    key={filter}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFilterChange(filter.toLowerCase())}
                    className={`px-6 py-2 rounded-full transition-all ${
                      selectedFilter === filter.toLowerCase()
                        ? "bg-purple-500 text-white shadow-lg"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {filter}
                  </motion.button>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {Array(6).fill(null).map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-black/40 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-white/10"
                  >
                    <div className="aspect-square relative mb-4 rounded-lg overflow-hidden">
                      <Image
                        src="/birth-images/placeholder-memory.jpg"
                        alt="Birthday memory"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      From [Friend's Name]
                    </h3>
                    <p className="text-gray-300">
                      "Happy birthday! Here's to another amazing year filled with joy and success!"
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </main>
  );
}
