import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import Navbar from "@/components/Navbar";
import EquipeClient from "./EquipeClient";

export const metadata = {
  title: "Equipo | Linda Mariana",
};

export default async function EquipePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("rol, nombre")
    .eq("auth_id", user.id)
    .single();

  if (usuario?.rol !== "admin") {
    redirect("/marcacion"); // only admins can see this page
  }

  // Fetch team members
  const { data: equipe } = await supabase
    .from("usuarios")
    .select("id, auth_id, nombre, rol")
    .order("created_at", { ascending: true });

  const primeiroNome = usuario?.nombre?.split(" ")[0] ?? "Admin";

  return (
    <div className="min-h-screen bg-surface">
      <Navbar rol={usuario.rol} nombre={usuario.nombre} logout={logout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <EquipeClient equipeInicial={equipe || []} />
      </main>
    </div>
  );
}
