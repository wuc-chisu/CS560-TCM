import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";

const statusOptions = [
  { value: "ALL", label: "全部預約" },
  { value: AppointmentStatus.PENDING, label: "待確認" },
  { value: AppointmentStatus.CONFIRMED, label: "已確認" },
  { value: AppointmentStatus.CANCELLED, label: "已取消" },
] as const;

type StatusFilter = (typeof statusOptions)[number]["value"];

type PageProps = {
  searchParams: Promise<{ status?: string | string[] }>;
};

export default async function AdminAppointmentsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  const viewer = await getAdminViewer(session);

  if (!viewer) {
    return (
      <main className="min-h-screen bg-[#f8f2e8] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-red-900/10 bg-white/90 p-8 shadow-lg shadow-red-950/5">
          <SectionHeading
            eyebrow="ADMIN"
            title="預約管理後台"
            description="請先使用 Google 帳號登入，再查看與管理門診預約。"
            center
          />
          <div className="mt-8 flex justify-center">
            <GoogleLoginButton />
          </div>
        </div>
      </main>
    );
  }

  const query = await searchParams;
  const activeStatus = normalizeStatus(query.status);
  const appointments = await prisma.appointment.findMany({
    where: activeStatus === "ALL" ? undefined : { status: activeStatus },
    orderBy: [{ preferredAt: "asc" }, { createdAt: "desc" }],
    include: {
      patient: true,
      doctorInfo: true,
      serviceInfo: true,
    },
  });

  const counts = await prisma.appointment.groupBy({
    by: ["status"],
    _count: {
      _all: true,
    },
  });

  const countMap = new Map(counts.map((item) => [item.status, item._count._all]));
  const totalCount = counts.reduce((sum, item) => sum + item._count._all, 0);

  return (
    <main className="min-h-screen bg-[#f8f2e8] py-12 sm:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="ADMIN"
          title="預約管理後台"
          description="查看待確認、已確認與已取消的預約紀錄，掌握門診排程狀態。"
        />

        {viewer.kind === "local-dev" ? (
          <div className="mt-6 rounded-2xl border border-amber-300/60 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            目前使用本機開發暫時入口。這個免登入模式只會在 `development` 且 `localhost`/`127.0.0.1` 存取時啟用。
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {statusOptions.map((option) => {
            const href = option.value === "ALL" ? "/admin/appointments" : `/admin/appointments?status=${option.value}`;
            const count = option.value === "ALL" ? totalCount : countMap.get(option.value) ?? 0;
            const isActive = activeStatus === option.value;

            return (
              <a
                key={option.value}
                href={href}
                className={[
                  "rounded-2xl border p-4 transition",
                  isActive
                    ? "border-red-800 bg-red-800 text-amber-100 shadow-lg shadow-red-950/10"
                    : "border-red-900/10 bg-white/85 text-stone-800 hover:border-red-800/30",
                ].join(" ")}
              >
                <p className={isActive ? "text-xs tracking-[0.2em] text-amber-200" : "text-xs tracking-[0.2em] text-amber-700"}>{option.label}</p>
                <p className="mt-3 text-3xl font-semibold">{count}</p>
              </a>
            );
          })}
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-red-900/10 bg-white/90 shadow-lg shadow-red-950/5">
          <div className="flex items-center justify-between border-b border-red-900/10 px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-red-900">預約清單</h2>
              <p className="mt-1 text-sm text-stone-600">目前篩選：{statusOptions.find((option) => option.value === activeStatus)?.label ?? "全部預約"}</p>
            </div>
            <p className="text-sm text-stone-500">登入身分：{viewer.label}</p>
          </div>

          {appointments.length === 0 ? (
            <div className="px-6 py-14 text-center text-sm text-stone-500">目前沒有符合條件的預約紀錄。</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-red-900/10 text-sm text-stone-700">
                <thead className="bg-[#fff8ef] text-left text-xs tracking-[0.18em] text-amber-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">病人</th>
                    <th className="px-6 py-4 font-medium">聯絡方式</th>
                    <th className="px-6 py-4 font-medium">診療項目</th>
                    <th className="px-6 py-4 font-medium">醫師</th>
                    <th className="px-6 py-4 font-medium">預約時間</th>
                    <th className="px-6 py-4 font-medium">狀態</th>
                    <th className="px-6 py-4 font-medium">症狀與需求</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-900/10">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="align-top">
                      <td className="px-6 py-4">
                        <p className="font-medium text-stone-900">{appointment.patient?.name || appointment.name}</p>
                        <p className="mt-1 text-xs text-stone-500">建立於 {formatDateTime(appointment.createdAt)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p>{appointment.patient?.phone || appointment.phone}</p>
                        <p className="mt-1 text-xs text-stone-500">{appointment.patient?.email || appointment.email || "未提供 Email"}</p>
                      </td>
                      <td className="px-6 py-4">{appointment.serviceInfo?.name || appointment.service}</td>
                      <td className="px-6 py-4">{appointment.doctorInfo?.name || appointment.doctor || "未指定"}</td>
                      <td className="px-6 py-4">{formatDateTime(appointment.preferredAt)}</td>
                      <td className="px-6 py-4">
                        <span className={statusBadgeClassName(appointment.status)}>{statusLabelMap[appointment.status]}</span>
                      </td>
                      <td className="px-6 py-4 text-stone-600">{appointment.message || "無"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

type AdminViewer =
  | { kind: "session"; label: string }
  | { kind: "local-dev"; label: string };

const statusLabelMap: Record<AppointmentStatus, string> = {
  PENDING: "待確認",
  CONFIRMED: "已確認",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
  NO_SHOW: "未到診",
};

function normalizeStatus(status?: string | string[]): StatusFilter {
  const value = Array.isArray(status) ? status[0] : status;

  if (value && statusOptions.some((option) => option.value === value)) {
    return value as StatusFilter;
  }

  return "ALL";
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("zh-Hant-TW", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
  }).format(value);
}

function statusBadgeClassName(status: AppointmentStatus) {
  const commonClassName = "inline-flex rounded-full px-3 py-1 text-xs font-medium";

  switch (status) {
    case AppointmentStatus.CONFIRMED:
      return `${commonClassName} bg-emerald-100 text-emerald-700`;
    case AppointmentStatus.CANCELLED:
      return `${commonClassName} bg-stone-200 text-stone-700`;
    case AppointmentStatus.COMPLETED:
      return `${commonClassName} bg-amber-100 text-amber-800`;
    case AppointmentStatus.NO_SHOW:
      return `${commonClassName} bg-red-100 text-red-700`;
    default:
      return `${commonClassName} bg-red-100 text-red-800`;
  }
}

async function getAdminViewer(session: Awaited<ReturnType<typeof getServerSession>>): Promise<AdminViewer | null> {
  if (session?.user) {
    return {
      kind: "session",
      label: session.user.email || session.user.name || "Google 使用者",
    };
  }

  if (!(await isLocalDevAccessAllowed())) {
    return null;
  }

  return {
    kind: "local-dev",
    label: "本機開發暫時入口",
  };
}

async function isLocalDevAccessAllowed() {
  if (process.env.NODE_ENV !== "development") {
    return false;
  }

  const host = (await headers()).get("host")?.toLowerCase() || "";

  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:") || host === "localhost" || host === "127.0.0.1";
}