"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const letterAnimation = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  };

  const headerText = "Celebrate Birthdays Together".split("");

  return (
    <main className="min-h-screen dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden px-4 py-16 sm:py-20">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/birth-images/birthda-guy.png"
            alt="Birthday celebration background"
            fill
            className="object-cover brightness-[0.85]"
            priority
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/70 to-black/50" />
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative text-center px-4 max-w-6xl mx-auto w-full"
        >
          <div className="overflow-hidden mb-6 sm:mb-8">
            <div className="flex justify-center flex-wrap px-2">
              {headerText.map((letter, index) => (
                <motion.span
                  key={index}
                  initial="hidden"
                  animate="visible"
                  variants={letterAnimation}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 100
                  }}
                  className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold inline-block text-white drop-shadow-lg"
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
            </div>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-100 mb-8 sm:mb-12 max-w-3xl mx-auto drop-shadow-md px-4"
          >
            Create and share beautiful birthday memories with friends and loved ones. Upload photos, videos, and heartfelt messages in one special place.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 2 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 px-4"
          >
            <Link href="/sign-up" className="w-full sm:w-auto bg-white text-purple-700 px-8 py-4 rounded-full hover:bg-gray-100 transition font-semibold text-lg hover:scale-105 transform duration-200 shadow-lg text-center">
              Get Started
            </Link>
            <Link href="/app-user" className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white/10 transition font-semibold text-lg hover:scale-105 transform duration-200 text-center">
              Explore
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating decorative elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 pointer-events-none hidden sm:block"
        >
          <div className="absolute top-[10%] left-[10%] w-24 sm:w-32 h-24 sm:h-32 bg-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-[10%] right-[10%] w-32 sm:w-40 h-32 sm:h-40 bg-pink-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-20 sm:w-24 h-20 sm:h-24 bg-blue-400/20 rounded-full blur-3xl" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 dark:text-white relative inline-block">
              How It Works
              <motion.div
                className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-pink-600"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              />
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">Create memorable birthday experiences in three simple steps</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: "Create Account",
                description: "Sign up and create your personal profile",
                icon: "👤"
              },
              {
                title: "Start a Birthday Diary",
                description: "Create a special diary for someone's birthday",
                icon: "📖"
              },
              {
                title: "Share Memories",
                description: "Upload photos, videos, and messages",
                icon: "🎁"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, rotate: [0, 1, -1, 0] }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="p-6 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition shadow-lg hover:shadow-xl"
              >
                <motion.div 
                  className="text-4xl mb-4"
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 sm:py-20 bg-purple-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center"
          >
            <div className="order-2 lg:order-1">
              <motion.h2 
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-bold mb-6 dark:text-white"
              >
                About Us
              </motion.h2>
              <motion.p 
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-gray-600 dark:text-gray-300 mb-6 text-base sm:text-lg"
              >
                We believe every birthday deserves to be special. Our platform helps you create lasting memories by bringing together photos, videos, and messages from friends and family in one beautiful digital space.
              </motion.p>
              <motion.p 
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-gray-600 dark:text-gray-300 text-base sm:text-lg"
              >
                Whether you're celebrating near or far, make every birthday moment count with our easy-to-use birthday diary platform.
              </motion.p>
            </div>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2 relative h-[300px] sm:h-[400px] rounded-xl overflow-hidden hover:scale-105 transition-transform duration-500"
            >
              <Image
                src="/birth-images/about-image.png"
                alt="Birthday celebration"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-800 dark:to-pink-800 text-white relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10"
        >
          <motion.h2 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold mb-6"
          >
            Ready to Create Special Birthday Memories?
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg sm:text-xl mb-8"
          >
            Join our community and start creating beautiful birthday diaries today.
          </motion.p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4"
          >
            <Link href="/signup" className="w-full sm:w-auto bg-white text-purple-600 dark:bg-gray-900 dark:text-purple-400 px-8 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition inline-block">
              Get Started for Free
            </Link>
          </motion.div>
        </motion.div>

        {/* Animated background elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 left-0 w-full h-full opacity-10"
          style={{
            background: "radial-gradient(circle at center, transparent 0%, rgba(255,255,255,0.2) 100%)",
          }}
        />
      </section>
    </main>
  );
}
