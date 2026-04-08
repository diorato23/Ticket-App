import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../login/actions";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Reportes y Historial | Linda Mariana",
};

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
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

  if (usuario?.rol !== "admin") {
    redirect("/dashboard");
  }

  // Parse searchParams safely
  const resolvedParams = await searchParams;

  // Lógica de Datas
  // Obter a data atual do fuso UTC-5 (Bogotá)
  const hoyEnBogota = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
  const yyyy = hoyEnBogota.getFullYear();
  const mm = String(hoyEnBogota.getMonth() + 1).padStart(2, "0");
  const dd = String(hoyEnBogota.getDate()).padStart(2, "0");
  const defaultDateStr = `${yyyy}-${mm}-${dd}`;

  // Data Alvo (se não tiver no URL, usa a de hoje)
  const targetDateStr = resolvedParams?.date || defaultDateStr;

  // Obter dia seguinte para o limite da query (targetDate <= data < nextDate)
  const [tY, tM, tD] = targetDateStr.split("-").map(Number);
  const nextDateObj = new Date(tY, tM - 1, tD);
  nextDateObj.setDate(nextDateObj.getDate() + 1);
  const nYYYY = nextDateObj.getFullYear();
  const nMM = String(nextDateObj.getMonth() + 1).padStart(2, "0");
  const nDD = String(nextDateObj.getDate()).padStart(2, "0");
  const nextDateStr = `${nYYYY}-${nMM}-${nDD}`;

  // Query no BD filtrando do targetDateStr até nextDateStr
  const { data: movimentacoes, error } = await supabase
    .from("marcaciones")
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
    .gte("fecha", targetDateStr)
    .lt("fecha", nextDateStr)
    .order("fecha", { ascending: false });

  // Cálculos Derivados do dia selecionado
  const marcacoesCount = movimentacoes?.length || 0;
  const desechablesCount = movimentacoes?.filter((m) => m.desechable).length || 0;
  const ingresosDesechables = desechablesCount * 1000;

  // Formatar a exibição (em espanhol)
  const formatedDisplayDate = new Date(tY, tM - 1, tD).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

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
        <div className="animate-fade-in space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-secondary tracking-tight">
                Historial de Movimientos 📑
              </h2>
              <p className="text-muted font-medium mt-1">Busca y revisa días anteriores</p>
            </div>
            
            {/* Filtro de Data via GET method */}
            <form className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-border">
              <input 
                type="date" 
                name="date" 
                defaultValue={targetDateStr}
                max={defaultDateStr}
                className="bg-transparent border-none text-secondary font-bold focus:ring-0 cursor-pointer p-2"
              />
              <button 
                type="submit" 
                className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-xl transition-colors shadow-sm"
              >
                Buscar
              </button>
            </form>
          </div>

          {/* Cards Rápidos de Resumo do Dia */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-border p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-xl">📅</div>
              <div>
                <span className="text-xs font-bold text-muted uppercase">Día Mostrado</span>
                <p className="text-lg font-bold text-secondary capitalize">{formatedDisplayDate}</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-border p-5 shadow-sm flex items-center gap-4 hover:border-success/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-xl">✅</div>
              <div>
                <span className="text-xs font-bold text-muted uppercase">Almuerzos Servidos</span>
                <p className="text-2xl font-black text-secondary">{marcacoesCount}</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-border p-5 shadow-sm flex items-center gap-4 hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl">🥡</div>
              <div>
                <span className="text-xs font-bold text-muted uppercase">Extra por Desechables</span>
                <p className="text-2xl font-black text-primary-dark">${ingresosDesechables.toLocaleString("es-CO")}</p>
                <p className="text-xs font-medium text-muted">{desechablesCount} recipientes</p>
              </div>
            </div>
          </div>

          {/* Tabela do Histórico */}
          <div>
            {!movimentacoes || movimentacoes.length === 0 ? (
              <div className="bg-white rounded-3xl border border-border p-12 text-center shadow-sm">
                <span className="text-5xl block mb-3 opacity-50">🏜️</span>
                <p className="font-semibold text-muted text-lg">No hay registros este día.</p>
                <p className="text-sm text-muted mt-1">Intenta seleccionando otra fecha en el calendario superior.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-surface border-b border-border text-xs font-bold text-muted uppercase tracking-wider">
                  <div className="col-span-4">Cliente</div>
                  <div className="col-span-2 text-center">Hora</div>
                  <div className="col-span-2 text-center">Plan Usado</div>
                  <div className="col-span-2 text-center">Desechable</div>
                  <div className="col-span-2 text-center">Operador</div>
                </div>

                <div className="divide-y divide-border/60">
                  {movimentacoes.map((m: any) => {
                    const tiquetera = m.tiqueteras;
                    const cliente = tiquetera
                      ? (Array.isArray(tiquetera.clientes) ? tiquetera.clientes[0] : tiquetera.clientes)
                      : null;
                    const operador = Array.isArray(m.usuarios) ? m.usuarios[0] : m.usuarios;

                    return (
                      <div
                        key={m.id}
                        className="px-6 py-4 flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 sm:items-center hover:bg-surface/60 transition-colors"
                      >
                        {/* Cliente */}
                        <div className="col-span-4 flex items-center gap-3">
                          <div className="w-9 h-9 bg-secondary/5 rounded-full flex items-center justify-center text-secondary font-bold text-base flex-shrink-0">
                            {cliente?.nombre?.charAt(0)?.toUpperCase() ?? "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-secondary truncate">{cliente?.nombre ?? "—"}</p>
                            <p className="text-xs text-muted truncate">{cliente?.telefono_wsp ?? ""}</p>
                          </div>
                        </div>

                        {/* Hora */}
                        <div className="col-span-2 sm:text-center">
                          <span className="text-sm font-mono font-semibold text-secondary">
                            {formatHora(m.fecha)}
                          </span>
                        </div>

                        {/* Plan */}
                        <div className="col-span-2 sm:text-center">
                          <span className="text-sm font-bold text-muted bg-surface px-2.5 py-1 rounded-full border border-border">
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
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
