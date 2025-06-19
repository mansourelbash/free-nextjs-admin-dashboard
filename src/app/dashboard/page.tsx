import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Redirect to the main admin dashboard
  // The actual dashboard content is served from the root "/" route
  redirect("/");
}
