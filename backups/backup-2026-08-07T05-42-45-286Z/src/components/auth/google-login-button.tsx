"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function GoogleLoginButton() {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <button
        type="button"
        onClick={() => signOut()}
        className="rounded-full border border-amber-400/70 px-5 py-2 text-sm text-amber-100 transition hover:bg-amber-200/10"
      >
        已登入 {session.user.name}，登出
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("google")}
      className="rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-red-950 transition hover:bg-amber-200"
    >
      使用 Google 登入
    </button>
  );
}
