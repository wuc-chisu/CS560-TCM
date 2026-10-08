export type AdminNavGroup = {
  label: string;
  href: string;
  items: { label: string; href: string; description: string }[];
};

export const adminNav: AdminNavGroup[] = [
  {
    label: "預約管理",
    href: "/admin/appointments",
    items: [
      { label: "預約清單", href: "/admin/appointments", description: "查看病人的預約。" },
      { label: "新增預約", href: "/admin/appointments/new", description: "為病人安排預約。" },
    ],
  },
  {
    label: "病歷管理",
    href: "/admin/medical-records",
    items: [
      { label: "病人清單", href: "/admin/medical-records", description: "查看病人並選擇病人。" },
      { label: "病人資料", href: "/admin/medical-records/patient", description: "查看選定病人的基本資料。" },
      { label: "過去病歷", href: "/admin/medical-records/history", description: "查看病人過去的看診紀錄。" },
      { label: "新增病歷", href: "/admin/medical-records/new", description: "新增本次看診紀錄。" },
      { label: "修改病歷", href: "/admin/medical-records/edit", description: "修改已有的病歷。" },
    ],
  },
  {
    label: "使用者管理",
    href: "/admin/users",
    items: [
      { label: "使用者清單", href: "/admin/users", description: "查看可以使用後台的人員。" },
      { label: "新增使用者", href: "/admin/users/new", description: "新增後台使用者。" },
      { label: "指定角色", href: "/admin/users/roles", description: "設定為 Admin、前台或醫師。" },
      { label: "停用使用者", href: "/admin/users/deactivate", description: "停用人員的後台使用資格。" },
    ],
  },
];

export function findAdminPage(href: string) {
  for (const group of adminNav) {
    const item = group.items.find((entry) => entry.href === href);
    if (item) return { group, item };
  }
  return null;
}
