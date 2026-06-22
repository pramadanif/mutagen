import { Header } from "@/components/layout/Header";
import { LiveDashboardPage } from "@/components/dashboard/LiveDashboardPage";

export default function DashboardRoute() {
  return (
    <>
      <Header />
      <LiveDashboardPage />
    </>
  );
}
