import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </main>
  );
}