"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Shield, TrendingUp } from "lucide-react";

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-pink-100 to-violet-100 rounded-xl flex items-center justify-center">
        <span className="text-pink-500">{icon}</span>
      </div>
      <div>
        <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function ReportPreview() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            专业详细的分析报告
          </h2>
          <p className="text-gray-500">深度解读，助你们更好地成长</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative bg-gradient-to-br from-pink-50 via-white to-violet-50 rounded-3xl p-6 sm:p-10 shadow-xl border border-pink-100/50 overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-200/20 to-violet-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-violet-200/20 to-pink-200/20 rounded-full blur-3xl" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Report Mockup */}
            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-gray-400">
                  契合度报告
                </span>
                <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent font-bold">
                  85%
                </span>
              </div>

              {/* Compatibility Circle */}
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#F3F4F6"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray="352"
                      strokeDashoffset="53"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#EC4899" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800">85%</span>
                  </div>
                </div>
              </div>

              {/* Mini Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-pink-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">依恋契合</p>
                  <p className="font-bold text-pink-500">高</p>
                </div>
                <div className="text-center p-3 bg-violet-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">沟通风格</p>
                  <p className="font-bold text-violet-500">中</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">价值观</p>
                  <p className="font-bold text-purple-500">高</p>
                </div>
              </div>
            </div>

            {/* Right: Features List */}
            <div className="space-y-5">
              <FeatureItem
                icon={<Sparkles className="w-5 h-5" />}
                title="契合度总览"
                description="直观呈现你们的整体契合度评分与关系健康指数"
              />
              <FeatureItem
                icon={<Shield className="w-5 h-5" />}
                title="依恋类型配对"
                description="深入分析双方的依恋模式，理解彼此的情感需求"
              />
              <FeatureItem
                icon={<TrendingUp className="w-5 h-5" />}
                title="成长建议"
                description="基于分析结果，提供针对性的关系成长建议与行动指南"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
