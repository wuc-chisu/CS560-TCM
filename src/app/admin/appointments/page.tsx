import { SectionHeading } from "@/components/ui/section-heading";
import { getAdminAccess } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import Link from "next/link";
import { updateAppointmentStatus } from "./actions";

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
  const access = await getAdminAccess();

  if (access.status !== "admin") {
    return null;
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
    <div>
      <div>
        <SectionHeading
          eyebrow="預約管理"
          title="預約清單"
          description="查看待確認、已確認與已取消的預約紀錄，掌握門診排程狀態。"
        />

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

        <div className="mt-8 flex justify-end">
          <Link
            href="/admin/appointments/new"
            className="rounded-full bg-red-800 px-5 py-2 text-sm font-medium text-amber-100 transition hover:bg-red-700"
          >
            新增預約
          </Link>
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border border-red-900/10 bg-white/90 shadow-lg shadow-red-950/5">
          <div className="flex items-center justify-between border-b border-red-900/10 px-6 py-4">
            <p className="text-sm text-stone-600">目前篩選：{statusOptions.find((option) => option.value === activeStatus)?.label ?? "全部預約"}</p>
            <p className="text-sm text-stone-500">登入身分：{access.email}</p>
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
                    <th className="px-6 py-4 font-medium">操作</th>
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
                      <td className="px-6 py-4">
                        <form action={updateAppointmentStatus} className="flex gap-2">
                          <input type="hidden" name="id" value={appointment.id} />
                          {appointment.status === AppointmentStatus.PENDING ? (
                            <button
                              type="submit"
                              name="status"
                              value={AppointmentStatus.CONFIRMED}
                              className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500"
                            >
                              確認
                            </button>
                          ) : null}
                          {appointment.status === AppointmentStatus.PENDING || appointment.status === AppointmentStatus.CONFIRMED ? (
                            <Link
                              href={`/admin/appointments/${appointment.id}/edit`}
                              className="rounded-full border border-amber-400 px-3 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-50"
                            >
                              修改
                            </Link>
                          ) : null}
                          {appointment.status === AppointmentStatus.PENDING || appointment.status === AppointmentStatus.CONFIRMED ? (
                            <button
                              type="submit"
                              name="status"
                              value={AppointmentStatus.CANCELLED}
                              className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
                            >
                              取消
                            </button>
                          ) : (
                            <span className="text-xs text-stone-400">—</span>
                          )}
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
