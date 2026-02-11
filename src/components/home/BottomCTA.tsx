"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BottomCTA() {
  const scrollToCards = () => {
    document
      .getElementById("stage-selection")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            准备好探索你们的爱情密码了吗？
          </h2>
          <p className="text-gray-500 mb-8">
            选择适合你们的阶段，开启科学恋爱之旅
          </p>
          <Button
            onClick={scrollToCards}
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white rounded-full px-8 py-6 text-lg shadow-lg shadow-pink-500/25 transition-all duration-300 gap-1.5"
          >
            立即开始
            <Sparkles className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
