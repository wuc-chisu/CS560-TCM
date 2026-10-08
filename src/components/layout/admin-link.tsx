import { getAdminAccess } from "@/lib/admin";
import Link from "next/link";

export async function AdminLink() {
  const access = await getAdminAccess();

  if (access.status !== "admin") {
    return null;
  }

  return (
    <Link
      href="/admin/appointments"
      className="rounded-full border border-red-800 px-4 py-2 text-xs font-medium text-red-800 transition hover:bg-red-800 hover:text-amber-100 sm:text-sm"
    >
      管理後台
    </Link>
  );
}
