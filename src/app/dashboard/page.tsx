import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../login/actions";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export const metadata = {
  title: "Dashboard | Linda Mariana",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Authentication & Session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // User Profile & Role
  const { data: usuario } = await supabase
    .from("usuarios")
    .select("rol, nombre")
    .eq("auth_id", user.id)
    .single();

  const isAdmin = usuario?.rol === "admin";

  // Formatar Datas UTC-5 (Colômbia)
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;
  const firstDayStr = `${yyyy}-${mm}-01`;

  // Daqui a 3 Dias
  const en3Dias = new Date(hoy);
  en3Dias.setDate(en3Dias.getDate() + 3);
  const vYYYY = en3Dias.getFullYear();
  const vMM = String(en3Dias.getMonth() + 1).padStart(2, "0");
  const vDD = String(en3Dias.getDate()).padStart(2, "0");
  const in3DaysStr = `${vYYYY}-${vMM}-${vDD}`;

  // Métricas em paralelo
  const [
    { count: totalClientes },
    { count: totalTiqueterasAtivas },
    { data: marcacoesHoje },
    { data: ingresosMes },
    { data: porVencer }
  ] = await Promise.all([
    supabase.from("clientes").select("*", { count: "exact", head: true }).eq("activo", true),
    supabase.from("tiqueteras").select("*", { count: "exact", head: true }).eq("estado", "activa"),
    supabase.from("marcaciones").select("id, desechable").gte("fecha", todayStr),
    isAdmin ? supabase.from("tiqueteras").select("precio").gte("fecha_inicio", firstDayStr) : Promise.resolve({ data: [] }),
    supabase.from("tiqueteras")
      .select("id, token_publico, fecha_vencimiento, clientes(nombre, telefono_wsp)")
      .eq("estado", "activa")
      .lte("fecha_vencimiento", in3DaysStr)
      .gte("fecha_vencimiento", todayStr)
      .order("fecha_vencimiento", { ascending: true }),
  ]);

  // Cálculos Derivados
  const marcacoesCount = marcacoesHoje?.length || 0;
  const desechablesCount = marcacoesHoje?.filter(m => m.desechable).length || 0;
  const ingresosDesechables = desechablesCount * 1000;
  
  const ingresosTiqueteras = ingresosMes?.reduce((acc, t) => acc + (t.precio || 0), 0) || 0;
  
  // Ocupação %
  const totalAlmuerzosHoy = totalTiqueterasAtivas || 1; // previne divZero
  const porcentagemOcupacao = Math.min(Math.round((marcacoesCount / totalAlmuerzosHoy) * 100), 100);

  const primeiroNome = usuario?.nombre?.split(" ")[0] ?? "Vladimir";

  return (
    <div className="min-h-screen bg-surface pb-20 sm:pb-0">
      <Navbar rol={usuario?.rol ?? "admin"} nombre={usuario?.nombre ?? ""} logout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="animate-fade-in space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-secondary tracking-tight">
                ¡Bienvenido, {primeiroNome}! 👋
              </h2>
              <p className="text-muted font-medium mt-1">
                Resumen gerencial de hoy —{" "}
                {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
            <Link
              href="/marcacion"
              className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-primary/30 transition-all hover:-translate-y-1"
            >
              🚀 Registrar Asistencia
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Esquerda: KPIs Principais (3 Colunas no Desktop) */}
            <div className="lg:col-span-3 space-y-8">
              
              {/* KPIs Primários */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashCard
                  href="/tiqueteras"
                  icon="🎫"
                  title="Almuerzos a Servir"
                  subtitle="Tiqueteras Activas"
                  value={totalTiqueterasAtivas ?? 0}
                  color="primary"
                />
                
                <Link href="/marcacion" className="group bg-white rounded-3xl border border-border p-6 shadow-sm flex flex-col justify-between overflow-hidden relative hover:shadow-md hover:border-success/20 transition-all duration-200 block cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      ✅
                    </div>
                    <span className="text-sm font-bold text-success bg-success/10 px-3 py-1 rounded-full">
                      {porcentagemOcupacao}%
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-muted uppercase tracking-wider mb-1 block">Marcados Hoy</span>
                    <p className="text-4xl font-black text-secondary group-hover:text-success transition-colors">
                      {marcacoesCount}
                    </p>
                  </div>
                  {/* Progress Bar background decorativa */}
                  <div className="absolute bottom-0 left-0 h-1 bg-success/20 w-full">
                    <div className="h-full bg-success" style={{ width: `${porcentagemOcupacao}%` }}></div>
                  </div>
                </Link>

                <DashCard
                  href="/clientes"
                  icon="👥"
                  title="Clientes Totales"
                  subtitle="Registrados y Activos"
                  value={totalClientes ?? 0}
                  color="secondary"
                />
              </div>

              {/* Financeiro Condicional (Só Admin) */}
              {isAdmin && (
                <div>
                  <h3 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2">
                    <span>💵</span> Flujo Financiero
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-[#11998e] to-[#38ef7d] rounded-3xl p-6 shadow-lg text-white transform transition-transform hover:scale-[1.02]">
                      <span className="text-sm font-bold text-white/80 uppercase tracking-widest mb-1 block">Ingreso del Mes</span>
                      <p className="text-4xl font-black mb-2">
                        ${ingresosTiqueteras.toLocaleString("es-CO")}
                      </p>
                      <p className="text-sm text-white/90">Ventas de tiqueteras desde el día 1</p>
                    </div>

                    <div className="bg-white rounded-3xl border-2 border-primary/20 p-6 shadow-sm flex flex-col justify-center">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl">
                          🥡
                        </div>
                        <div>
                          <span className="text-sm font-bold text-muted uppercase tracking-wider block">Ingreso por Desechables (Hoy)</span>
                          <p className="text-3xl font-black text-primary-dark">
                            ${ingresosDesechables.toLocaleString("es-CO")}
                          </p>
                          <p className="text-xs text-muted font-medium mt-1">{desechablesCount} recipientes marcados</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Direita: Avisos de Vencimento e Ações */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl border border-border p-6 shadow-sm h-full">
                <h3 className="text-lg font-bold text-secondary flex items-center gap-2 mb-5">
                  <span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span>
                  Próximos a Vencer
                </h3>
                
                {porVencer && porVencer.length > 0 ? (
                  <div className="space-y-4">
                    {porVencer.map((t) => {
                      const cliente: any = Array.isArray(t.clientes) ? t.clientes[0] : t.clientes;
                      const isToday = t.fecha_vencimiento === todayStr;
                      
                      // Format URL text for WA
                      const wpNum = cliente?.telefono_wsp || "";
                      const wppText = `¡Hola ${cliente?.nombre}! Recuerda que tu tiquetera en Linda Mariana vence ${isToday ? "HOY" : "pronto"}. Puedes consultar tu plan digital aquí: https://tiquetera-lindamariana.com/mi-tiquetera/${t.token_publico}`;
                      const waLink = `https://wa.me/57${wpNum}?text=${encodeURIComponent(wppText)}`;

                      return (
                        <div key={t.id} className="p-4 rounded-2xl bg-surface border border-gray-100 hover:border-warning/30 transition-colors">
                          <p className="font-bold text-secondary truncate">{cliente?.nombre}</p>
                          <p className={`text-xs font-medium mb-3 ${isToday ? "text-danger" : "text-warning"}`}>
                            Vence: {t.fecha_vencimiento} {isToday && "(Hoy)"}
                          </p>
                          <a 
                            href={waLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors w-full justify-center"
                          >
                            💬 Avisar por WhatsApp
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <span className="text-4xl block mb-2 opacity-50">📆</span>
                    <p className="text-sm text-muted font-medium">No hay vencimientos en los próximos 3 días.</p>
                  </div>
                )}
                
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <Link href="/tiqueteras" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors flex items-center justify-center gap-1 w-full">
                    Ver todas las Tiqueteras →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Subcomponente de Card
function DashCard({ icon, title, subtitle, value, color, href }: { icon: string, title: string, subtitle: string, value: number, color: string, href: string }) {
  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    success: "bg-success/10 text-success",
  };

  return (
    <Link href={href} className="group bg-white rounded-3xl border border-border p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 hover:border-primary/20 transition-all duration-200 cursor-pointer block">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform ${colorMap[color] ?? ""}`}>
          {icon}
        </div>
      </div>
      <div>
        <span className="text-sm font-bold text-muted uppercase tracking-wider mb-1 block group-hover:text-primary transition-colors">{subtitle}</span>
        <div className="flex items-end gap-2">
          <p className="text-4xl font-black text-secondary group-hover:text-primary transition-colors">
            {value}
          </p>
          <span className="text-sm font-medium text-muted mb-1">{title}</span>
        </div>
      </div>
    </Link>
  );
}
