export type AdminNavGroup = {
  label: string;
  href: string;
  items: { label: string; href: string; description: string }[];
};

export const adminNav: AdminNavGroup[] = [
  {
    label: "Appointments",
    href: "/admin/appointments",
    items: [
      { label: "Appointment List", href: "/admin/appointments", description: "View patient appointments." },
      { label: "New Appointment", href: "/admin/appointments/new", description: "Schedule an appointment for a patient." },
    ],
  },
  {
    label: "Medical Records",
    href: "/admin/medical-records",
    items: [
      { label: "Patient List", href: "/admin/medical-records", description: "Browse and select patients." },
      { label: "Patient Details", href: "/admin/medical-records/patient", description: "View the selected patient's basic information." },
      { label: "Add Patient", href: "/admin/medical-records/patient/new", description: "Create a patient profile." },
      { label: "Medical History", href: "/admin/medical-records/history", description: "Review a patient's past visit records." },
      { label: "New Medical Record", href: "/admin/medical-records/new", description: "Add a record for a visit." },
      { label: "Edit Medical Record", href: "/admin/medical-records/edit", description: "Edit an existing medical record." },
    ],
  },
  {
    label: "User Management",
    href: "/admin/users",
    items: [
      { label: "User List", href: "/admin/users", description: "View people with access to the admin dashboard." },
      { label: "Add User", href: "/admin/users/new", description: "Add a new admin dashboard user." },
      { label: "Manage Roles", href: "/admin/users/roles", description: "Assign admin, front desk, or practitioner roles." },
      { label: "Deactivate User", href: "/admin/users/deactivate", description: "Disable a user's admin dashboard access." },
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
