import { redirect } from "next/navigation";

/** 旧书签兼容：直接进入与第二幕一致的昵称页 */
export default async function MePersonalSlugRedirectPage({
  params,
}: {
  params: Promise<{ personalSlug: string }>;
}) {
  const { personalSlug } = await params;
  redirect(
    `/quiz?mode=PERSONAL&personalSlug=${encodeURIComponent(personalSlug)}`,
  );
}
