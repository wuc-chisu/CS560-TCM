import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAdminAccess } from "@/lib/admin";
import { SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await getAdminAccess();

  if (access.status !== "admin") {
    const signedIn = access.status === "forbidden";
    return (
      <main className="min-h-screen bg-[#f8f2e8] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-red-900/10 bg-white/90 p-8 shadow-lg shadow-red-950/5">
          <SectionHeading
            eyebrow="ADMIN"
            title="診所後台"
            description={signedIn ? "此帳號沒有管理員權限，無法使用後台。" : "請先登入管理員帳號，再使用後台。"}
            center
          />
          {signedIn ? null : (
            <div className="mt-8 flex justify-center">
              <SignInButton forceRedirectUrl="/admin/appointments">
                <button type="button" className="rounded-full bg-red-800 px-5 py-2 text-sm font-medium text-amber-100 transition hover:bg-red-700">
                  管理員登入
                </button>
              </SignInButton>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f2e8]">
      <header className="border-b border-red-950/10 bg-[#f8f2e8]/90">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/admin/appointments" className="flex items-center gap-2 text-sm font-semibold text-red-900 sm:text-base">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-800 to-amber-600 text-xs text-amber-100">
              和
            </span>
            和安中醫診所後台
          </Link>
          <div className="flex items-center gap-4 text-sm text-stone-700">
            <Link href="/" className="transition hover:text-red-800">
              回首頁
            </Link>
            <UserButton />
          </div>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <AdminSidebar />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
