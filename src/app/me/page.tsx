import { redirect } from "next/navigation";

/** 第一幕入口已合并到首页与 /quiz；保留 /me 避免旧链接失效 */
export default function MePage() {
  redirect("/");
}
