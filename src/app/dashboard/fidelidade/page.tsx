import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../../login/actions";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import FidelidadeConfig from "./FidelidadeConfig";

export const metadata = {
  title: "Configuración de Fidelidad | Linda Mariana",
};

export default async function FidelidadePage() {
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

  // Apenas admin pode acessar
  if (usuario?.rol !== "admin") redirect("/dashboard");

  const { data: config } = await supabase
    .from("config_fidelidade")
    .select("*")
    .eq("activo", true)
    .single();

  // Top 10 clientes com mais pontos
  const { data: ranking } = await supabase
    .from("clientes")
    .select("id, nombre, pontos_fidelidade, codigo")
    .eq("activo", true)
    .gt("pontos_fidelidade", 0)
    .order("pontos_fidelidade", { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-surface">
      <Navbar rol={usuario?.rol ?? "admin"} nombre={usuario?.nombre ?? ""} logout={logout} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted mb-6">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <span>›</span>
          <span className="text-secondary font-medium">Configuración de Fidelidad</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-secondary">🏆 Sistema de Fidelidad</h1>
          <p className="text-muted mt-1">Configura las reglas para premiar a los clientes fieles con puntos para rifas.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuração */}
          <FidelidadeConfig config={config} />

          {/* Ranking */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <h2 className="text-lg font-bold text-secondary mb-5 flex items-center gap-2">
              🥇 Ranking de Clientes
            </h2>
            {!ranking || ranking.length === 0 ? (
              <div className="text-center py-10">
                <span className="text-5xl block mb-3 opacity-50">🏆</span>
                <p className="text-muted font-medium">Ningún cliente tiene puntos aún.</p>
                <p className="text-sm text-muted mt-1">Los puntos se acumulan con cada marcación.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ranking.map((c, idx) => (
                  <Link
                    key={c.id}
                    href={`/clientes/${c.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface transition-colors group"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
                      idx === 0 ? "bg-yellow-400 text-yellow-900" :
                      idx === 1 ? "bg-gray-300 text-gray-700" :
                      idx === 2 ? "bg-amber-600 text-white" :
                      "bg-surface text-muted border border-border"
                    }`}>
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-secondary truncate group-hover:text-primary transition-colors">
                        {c.nombre}
                        {c.codigo && <span className="text-xs text-muted ml-2 font-normal">#{c.codigo}</span>}
                      </p>
                    </div>
                    <span className="font-black text-yellow-600 text-lg">{c.pontos_fidelidade}</span>
                    <span className="text-xs text-muted">pts</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
