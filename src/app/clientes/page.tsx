import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../login/actions";
import ClientesList from "./ClientesList";
import Navbar from "@/components/Navbar";

export default async function ClientesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Buscar role do usuário
  const { data: usuario } = await supabase
    .from("usuarios")
    .select("rol, nombre")
    .eq("auth_id", user.id)
    .single();

  const isAdmin = usuario?.rol === "admin";

  return (
    <div className="min-h-screen bg-surface">
      <Navbar rol={usuario?.rol ?? "operador"} nombre={usuario?.nombre ?? ""} logout={logout} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          <ClientesList isAdmin={isAdmin} />
        </div>
      </main>
    </div>
  );
}
