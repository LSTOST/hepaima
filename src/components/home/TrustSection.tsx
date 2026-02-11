"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link2, MessageCircleHeart, LineChart } from "lucide-react";

function TheoryCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm"
    >
      <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-violet-100 rounded-2xl flex items-center justify-center mb-5">
        <span className="text-pink-500">{icon}</span>
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">
        {title}
      </h3>
      <p className="text-gray-500 leading-relaxed">{description}</p>
    </motion.div>
  );
}

export function TrustSection() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            基于经典心理学理论
          </h2>
          <p className="text-gray-500">科学严谨，专业可靠</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TheoryCard
            icon={<Link2 className="w-7 h-7" />}
            title="依恋理论"
            description="理解双方在亲密关系中的依恋模式，探索安全感的来源与建立方式"
            delay={0}
          />
          <TheoryCard
            icon={<MessageCircleHeart className="w-7 h-7" />}
            title="爱的语言"
            description="解码彼此表达与接收爱的独特方式，让沟通更有效"
            delay={0.1}
          />
          <TheoryCard
            icon={<LineChart className="w-7 h-7" />}
            title="Gottman 研究"
            description="基于数十年婚姻研究，预测关系健康度的关键指标"
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
}
