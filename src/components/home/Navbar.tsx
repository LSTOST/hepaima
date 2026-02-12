"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { History, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function Navbar() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const router = useRouter();

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase();
    setInviteCode(raw);
  };

  const handleJoin = () => {
    if (inviteCode.length !== 6) return;
    setInviteDialogOpen(false);
    setInviteCode("");
    router.push(`/quiz/join?code=${inviteCode}`);
  };

  const isValidCode = inviteCode.length === 6;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-white/20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img src="/logo_navbar.png" alt="合拍吗" width={120} height={30} className="h-[30px] w-auto" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/history">
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-gray-900 text-sm sm:text-base px-2 sm:px-4"
            >
              <History className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">历史记录</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => setInviteDialogOpen(true)}
            className="rounded-full border-pink-300 text-pink-600 hover:bg-pink-50 text-sm sm:text-base px-3 sm:px-4 bg-transparent"
          >
            <Ticket className="w-4 h-4 mr-1 sm:mr-2" />
            输入邀请码
          </Button>
        </div>
      </div>

      <Dialog
        open={inviteDialogOpen}
        onOpenChange={(open) => {
          setInviteDialogOpen(open);
          if (!open) setInviteCode("");
        }}
      >
        <DialogContent className="sm:max-w-[380px] rounded-2xl p-6">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-bold text-gray-800">
              输入邀请码
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-1">
              输入 TA 分享给你的 6 位邀请码
            </p>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <Input
              type="text"
              value={inviteCode}
              onChange={handleCodeChange}
              placeholder="请输入邀请码"
              maxLength={6}
              autoComplete="off"
              className="h-14 text-center text-2xl font-mono uppercase focus-visible:border-pink-500 focus-visible:ring-pink-500/50 focus-visible:ring-[3px] rounded-xl"
              style={{ letterSpacing: "8px", fontSize: 24 }}
            />
            <Button
              onClick={handleJoin}
              disabled={!isValidCode}
              className="w-full bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:from-[#DB2777] hover:to-[#7C3AED] disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white rounded-xl py-5 text-base font-medium"
            >
              加入测试
            </Button>
            <p className="text-xs text-gray-400 text-center">
              邀请码由发起测试的一方分享给你
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </motion.nav>
  );
}
