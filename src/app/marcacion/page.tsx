import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../login/actions";
import Navbar from "@/components/Navbar";
import MarcacionBase from "./MarcacionBase";

export const metadata = {
  title: "Marcación Diaria | Linda Mariana",
};

export default async function MarcacionPage() {
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

  return (
    <div className="min-h-screen bg-surface">
      <Navbar rol={usuario?.rol ?? "operador"} nombre={usuario?.nombre ?? ""} logout={logout} />

      <main className="max-w-2xl mx-auto px-4 py-8 lg:py-12">
        <div className="animate-fade-in text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
            <span className="text-4xl text-primary font-bold">📍</span>
          </div>
          <h1 className="text-3xl font-bold text-secondary mb-2">
            Marcación Diaria
          </h1>
          <p className="text-muted text-lg">
            Gasta el almuerzo de las tiqueteras de tus clientes de manera ultra rápida.
          </p>
        </div>

        {/* Dynamic Client Component */}
        <MarcacionBase />
      </main>
    </div>
  );
}
