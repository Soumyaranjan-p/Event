"use client"
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  // Animation Variants for staggered text
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, filter: "blur(4px)" },
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="bg-slate-950 min-h-[80vh] flex items-center relative overflow-hidden">
      {/* CSS for the shimmering text effect */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .animate-shimmer {
          animation: shimmer 8s linear infinite;
        }
      `}</style>

      {/* Ambient Background Elements - Futuristic Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] -z-10" />

      {/* Hero Section */}
      <section className="relative w-full z-10 py-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center px-6 sm:px-12">
          
          {/* Left content - Text Animations */}
          <motion.div
            className="text-center sm:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Staggered Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-[0.95] tracking-tight text-white">
              <motion.span variants={itemVariants} className="block">Discover &</motion.span>
              <motion.span variants={itemVariants} className="block">create amazing</motion.span>
              <motion.span variants={itemVariants} className="block py-2">
                {/* Shimmering Gradient Span */}
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer">
                  events.
                </span>
              </motion.span>
            </h1>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-gray-400 mb-10 max-w-lg mx-auto sm:mx-0 font-light leading-relaxed"
            >
              Whether you&apos;re hosting or attending, Spott makes every event
              memorable. Join our community today.
            </motion.p>

            {/* Futuristic Button Wrapper */}
            <motion.div variants={itemVariants}>
              <Link href="/explore" className="relative group inline-block">
                {/* The blur glow layer behind the button */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-md opacity-70 group-hover:opacity-100 group-hover:blur-lg transition duration-500 group-hover:duration-200 animate-pulse"></div>
                
                {/* The actual button */}
                <Button
                  size="xl"
                  className="relative rounded-full cursor-pointer bg-blue-900 hover:bg-blue-400 text-white px-6 py-4 text-lg border border-slate-800/50 hover:scale-[1.02] active:scale-[0.98] transition-transform ease-out"
                >
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right - Floating 3D Image */}
          <motion.div
            className="relative block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -20, 0] // The floating up and down animation
            }}
            transition={{
              opacity: { duration: 0.8, delay: 0.5 },
              scale: { duration: 0.8, delay: 0.5 },
              y: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }
            }}
          >
            {/* A subtle glow behind the image itself */}
            <div className="absolute inset-10 bg-indigo-500/30 blur-[60px] -z-10 rounded-full"></div>
            <Image
              // src="/hero.png" // Revert to this if you don't have the other image
              src="/3d-react.png" 
              alt="react meetup"
              width={700}
              height={700}
              className="w-full h-auto drop-shadow-2xl"
              priority
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
}