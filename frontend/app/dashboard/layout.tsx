import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar userName={profile?.full_name || user.email} />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b bg-white/80 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="font-medium text-sm text-zinc-500 tracking-wide">专业团队协作平台</div>
          <div className="text-sm text-zinc-500">
            {user.email}
          </div>
        </header>
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
