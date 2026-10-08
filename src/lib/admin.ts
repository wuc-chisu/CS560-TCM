import { currentUser } from "@clerk/nextjs/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "chisu@wuc.edu")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export type AdminAccess =
  | { status: "signed-out" }
  | { status: "forbidden" }
  | { status: "admin"; email: string };

export async function getAdminAccess(): Promise<AdminAccess> {
  const user = await currentUser();

  if (!user) {
    return { status: "signed-out" };
  }

  const email = user.emailAddresses.find(
    (address) => address.verification?.status === "verified" && ADMIN_EMAILS.includes(address.emailAddress.toLowerCase()),
  )?.emailAddress;

  return email ? { status: "admin", email } : { status: "forbidden" };
}
