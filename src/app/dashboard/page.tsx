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

  // Daqui a 5 Dias (alerta ampliado)
  const en5Dias = new Date(hoy);
  en5Dias.setDate(en5Dias.getDate() + 5);
  const vYYYY = en5Dias.getFullYear();
  const vMM = String(en5Dias.getMonth() + 1).padStart(2, "0");
  const vDD = String(en5Dias.getDate()).padStart(2, "0");
  const in5DaysStr = `${vYYYY}-${vMM}-${vDD}`;

  // Mês e dia de hoje para busca de aniversários
  const mesHoje = hoy.getMonth() + 1;
  const diaHoje = hoy.getDate();
  // Próximos 7 dias para aniversários
  const anivDatas: { mes: number; dia: number }[] = [];
  for (let i = 0; i <= 7; i++) {
    const d = new Date(hoy);
    d.setDate(d.getDate() + i);
    anivDatas.push({ mes: d.getMonth() + 1, dia: d.getDate() });
  }

  // Métricas em paralelo
  const [
    { count: totalClientes },
    { count: totalTiqueterasAtivas },
    { data: marcacoesHoje },
    { data: ingresosMes },
    { data: porVencer },
    { data: movimentacoesHoje },
    { data: aniversariosRaw },
  ] = await Promise.all([
    supabase.from("clientes").select("*", { count: "exact", head: true }).eq("activo", true),
    supabase.from("tiqueteras").select("*", { count: "exact", head: true }).eq("estado", "activa"),
    supabase.from("marcaciones").select("id, desechable").gte("fecha", todayStr),
    isAdmin ? supabase.from("tiqueteras").select("precio").gte("fecha_inicio", firstDayStr) : Promise.resolve({ data: [] }),
    supabase.from("tiqueteras")
      .select("id, token_publico, fecha_vencimiento, tipo, clientes(nombre, telefono_wsp)")
      .eq("estado", "activa")
      .lte("fecha_vencimiento", in5DaysStr)
      .gte("fecha_vencimiento", todayStr)
      .order("fecha_vencimiento", { ascending: true }),
    // Movimentações ricas do dia
    supabase.from("marcaciones")
      .select(`
        id,
        fecha,
        desechable,
        tiqueteras (
          id,
          tipo,
          estado,
          clientes ( nombre, telefono_wsp )
        ),
        usuarios ( nombre )
      `)
      .gte("fecha", todayStr)
      .order("fecha", { ascending: false }),
    // Aniversários próximos (7 dias) — filtrar no JS por mês/dia
    supabase.from("clientes")
      .select("id, nombre, telefono_wsp, fecha_nacimiento")
      .eq("activo", true)
      .not("fecha_nacimiento", "is", null),
  ]);

  // Filtrar aniversários nos próximos 7 dias
  const aniversarios = (aniversariosRaw ?? []).filter((c: any) => {
    if (!c.fecha_nacimiento) return false;
    const nasc = new Date(c.fecha_nacimiento + "T12:00:00");
    return anivDatas.some(d => d.mes === nasc.getMonth() + 1 && d.dia === nasc.getDate());
  }).map((c: any) => {
    const nasc = new Date(c.fecha_nacimiento + "T12:00:00");
    const hoje = new Date();
    const isHoje = nasc.getMonth() + 1 === mesHoje && nasc.getDate() === diaHoje;
    const proxAniv = new Date(hoje.getFullYear(), nasc.getMonth(), nasc.getDate());
    if (proxAniv < hoje) proxAniv.setFullYear(hoje.getFullYear() + 1);
    const diasRestantes = Math.ceil((proxAniv.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return { ...c, isHoje, diasRestantes };
  }).sort((a: any, b: any) => a.diasRestantes - b.diasRestantes);

  // Cálculos Derivados
  const marcacoesCount = marcacoesHoje?.length || 0;
  const desechablesCount = marcacoesHoje?.filter(m => m.desechable).length || 0;
  const ingresosDesechables = desechablesCount * 1000;
  
  const ingresosTiqueteras = ingresosMes?.reduce((acc, t) => acc + (t.precio || 0), 0) || 0;
  
  // Ocupação %
  const totalAlmuerzosHoy = totalTiqueterasAtivas || 1; // previne divZero
  const porcentagemOcupacao = Math.min(Math.round((marcacoesCount / totalAlmuerzosHoy) * 100), 100);

  const primeiroNome = usuario?.nombre?.split(" ")[0] ?? "Vladimir";

  // Helper: formatar hora local (UTC-5 Bogotá)
  const formatHora = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Bogota",
    });
  };

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

              {/* ════════════════════════════════════════════ */}
              {/* SECCIÓN: Movimientos del Día                */}
              {/* ════════════════════════════════════════════ */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-secondary flex items-center gap-2">
                    <span>📋</span> Movimientos del Día
                    <span className="ml-2 text-sm font-semibold bg-primary/10 text-primary px-3 py-0.5 rounded-full">
                      {marcacoesCount} registros
                    </span>
                  </h3>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-muted hover:text-primary transition-colors flex items-center gap-1"
                  >
                    🔄 Actualizar
                  </Link>
                </div>

                {!movimentacoesHoje || movimentacoesHoje.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-border p-12 text-center shadow-sm">
                    <span className="text-5xl block mb-3 opacity-50">🍽️</span>
                    <p className="font-semibold text-muted text-lg">Sin movimientos registrados hoy.</p>
                    <p className="text-sm text-muted mt-1">Los registros de marcación aparecerán aquí en tiempo real.</p>
                    <Link
                      href="/marcacion"
                      className="inline-block mt-5 bg-primary text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
                    >
                      Ir a Marcación →
                    </Link>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
                    {/* Tabla Header */}
                    <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-surface border-b border-border text-xs font-bold text-muted uppercase tracking-wider">
                      <div className="col-span-4">Cliente</div>
                      <div className="col-span-2 text-center">Hora</div>
                      <div className="col-span-2 text-center">Plan</div>
                      <div className="col-span-2 text-center">Desechable</div>
                      <div className="col-span-2 text-center">Operador</div>
                    </div>

                    {/* Filas */}
                    <div className="divide-y divide-border/60">
                      {movimentacoesHoje.map((m: any, idx: number) => {
                        const tiquetera = m.tiqueteras;
                        const cliente = tiquetera
                          ? (Array.isArray(tiquetera.clientes) ? tiquetera.clientes[0] : tiquetera.clientes)
                          : null;
                        const operador = Array.isArray(m.usuarios) ? m.usuarios[0] : m.usuarios;

                        return (
                          <div
                            key={m.id}
                            className={`px-6 py-4 flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 sm:items-center hover:bg-surface/60 transition-colors ${idx === 0 ? "bg-success/5" : ""}`}
                          >
                            {/* Cliente */}
                            <div className="col-span-4 flex items-center gap-3">
                              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-base flex-shrink-0">
                                {cliente?.nombre?.charAt(0)?.toUpperCase() ?? "?"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-secondary truncate">{cliente?.nombre ?? "—"}</p>
                                <p className="text-xs text-muted truncate">{cliente?.telefono_wsp ?? ""}</p>
                              </div>
                              {idx === 0 && (
                                <span className="ml-1 text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full flex-shrink-0">
                                  Último
                                </span>
                              )}
                            </div>

                            {/* Hora */}
                            <div className="col-span-2 sm:text-center">
                              <span className="text-sm font-mono font-semibold text-secondary">
                                {formatHora(m.fecha)}
                              </span>
                            </div>

                            {/* Plan */}
                            <div className="col-span-2 sm:text-center">
                              <span className="text-sm font-bold text-primary-dark bg-primary/10 px-2.5 py-1 rounded-full">
                                {tiquetera?.tipo ?? "?"} días
                              </span>
                            </div>

                            {/* Desechable */}
                            <div className="col-span-2 sm:text-center">
                              {m.desechable ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-warning-dark bg-warning/10 px-2.5 py-1 rounded-full">
                                  🥡 +$1.000
                                </span>
                              ) : (
                                <span className="text-xs text-muted">—</span>
                              )}
                            </div>

                            {/* Operador */}
                            <div className="col-span-2 sm:text-center">
                              <span className="text-sm text-muted font-medium truncate">
                                {operador?.nombre ?? "Sistema"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer totales */}
                    <div className="px-6 py-4 bg-surface/80 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <p className="text-sm text-muted font-medium">
                        Total de almuerzos hoy: <span className="font-bold text-secondary">{marcacoesCount}</span>
                      </p>
                      {desechablesCount > 0 && (
                        <p className="text-sm text-warning-dark font-semibold">
                          🥡 {desechablesCount} desechable{desechablesCount !== 1 ? "s" : ""} — Extra: ${ingresosDesechables.toLocaleString("es-CO")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Direita: Avisos de Vencimento e Aniversários */}
            <div className="lg:col-span-1 space-y-6">

              {/* Card: Próximos a Vencer */}
              <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
                <h3 className="text-lg font-bold text-secondary flex items-center gap-2 mb-5">
                  <span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span>
                  Próximos a Vencer
                </h3>
                
                {porVencer && porVencer.length > 0 ? (
                  <div className="space-y-4">
                    {porVencer.map((t) => {
                      const cliente: any = Array.isArray(t.clientes) ? t.clientes[0] : t.clientes;
                      const isToday = t.fecha_vencimiento === todayStr;
                      const diasFaltantes = Math.ceil((new Date(t.fecha_vencimiento + "T12:00:00").getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      const wpNum = cliente?.telefono_wsp || "";
                      const wppText = `¡Hola ${cliente?.nombre}! Recuerda que tu tiquetera de ${(t as any).tipo} días en Linda Mariana vence ${isToday ? "HOY" : `en ${diasFaltantes} día${diasFaltantes !== 1 ? "s" : ""}`}. Puedes consultar tu plan digital aquí: https://tiquetera-lindamariana.com/mi-tiquetera/${t.token_publico}`;
                      const waLink = `https://wa.me/57${wpNum}?text=${encodeURIComponent(wppText)}`;

                      return (
                        <div key={t.id} className="p-4 rounded-2xl bg-surface border border-gray-100 hover:border-warning/30 transition-colors">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-bold text-secondary truncate">{cliente?.nombre}</p>
                            <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full flex-shrink-0">{(t as any).tipo}d</span>
                          </div>
                          <p className={`text-xs font-medium mb-3 ${isToday ? "text-danger" : diasFaltantes <= 2 ? "text-warning" : "text-muted"}`}>
                            {isToday ? "⚠️ Vence HOY" : `Vence en ${diasFaltantes} día${diasFaltantes !== 1 ? "s" : ""}`}
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
                  <div className="text-center py-8">
                    <span className="text-4xl block mb-2 opacity-50">📆</span>
                    <p className="text-sm text-muted font-medium">No hay vencimientos en los próximos 5 días.</p>
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Link href="/tiqueteras" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors flex items-center justify-center gap-1 w-full">
                    Ver todas las Tiqueteras →
                  </Link>
                </div>
              </div>

              {/* Card: Aniversários */}
              {aniversarios.length > 0 && (
                <div className="bg-white rounded-3xl border border-yellow-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-secondary flex items-center gap-2 mb-5">
                    🎂 Cumpleaños
                  </h3>
                  <div className="space-y-3">
                    {aniversarios.map((c: any) => {
                      const waText = c.isHoje
                        ? `¡Feliz cumpleaños ${c.nombre.split(" ")[0]}! 🎂🎉 Desde Linda Mariana te deseamos un día muy especial.`
                        : `¡Hola ${c.nombre.split(" ")[0]}! 🎂 En ${c.diasRestantes} días es tu cumpleaños. Desde Linda Mariana te enviamos un abrazo por adelantado.`;
                      const waLink = `https://wa.me/57${c.telefono_wsp}?text=${encodeURIComponent(waText)}`;
                      return (
                        <div key={c.id} className={`p-3 rounded-2xl border transition-colors ${
                          c.isHoje ? "bg-yellow-50 border-yellow-300" : "bg-surface border-gray-100"
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-bold text-secondary text-sm truncate flex-1">{c.nombre}</p>
                            {c.isHoje ? (
                              <span className="text-xs font-bold text-yellow-700 bg-yellow-200 px-2 py-0.5 rounded-full flex-shrink-0">¡HOY!</span>
                            ) : (
                              <span className="text-xs text-muted flex-shrink-0">en {c.diasRestantes}d</span>
                            )}
                          </div>
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors w-full justify-center"
                          >
                            {c.isHoje ? "🎉 Felicitar" : "💬 Saludar"}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
