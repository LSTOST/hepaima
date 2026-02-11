"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Activity, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

function MetricBadge({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-3 bg-white rounded-full shadow-md">
      <span className="text-pink-500">{icon}</span>
      <div className="text-left">
        <p className="font-bold text-gray-800 text-sm sm:text-base">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export function Hero() {
  const scrollToCards = () => {
    document
      .getElementById("stage-selection")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-4 sm:mb-6 text-balance"
        >
          我们合拍吗？
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg sm:text-xl text-gray-500 mb-8 sm:mb-12 text-balance"
        >
          用科学的方式，读懂你们的爱情密码
        </motion.p>

        {/* Social Proof Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-10 sm:mb-14"
        >
          <MetricBadge
            icon={<Users className="w-5 h-5" />}
            value="30,000+"
            label="对情侣已测"
          />
          <MetricBadge
            icon={<Activity className="w-5 h-5" />}
            value="78.5%"
            label="平均契合度"
          />
          <MetricBadge
            icon={<Heart className="w-5 h-5" />}
            value="96%"
            label="好评率"
          />
        </motion.div>

        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center"
        >
          <Button
            onClick={scrollToCards}
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white rounded-full px-8 py-6 text-lg shadow-lg shadow-pink-500/25 transition-all duration-300 gap-1.5"
          >
            开始探索
            <Sparkles className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
