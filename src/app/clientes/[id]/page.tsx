import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../../login/actions";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("rol, nombre")
    .eq("auth_id", user.id)
    .single();

  const isAdmin = usuario?.rol === "admin";

  const { data: cliente, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !cliente) redirect("/clientes");

  const { data: tiqueteras } = await supabase
    .from("tiqueteras")
    .select("*")
    .eq("cliente_id", id)
    .order("created_at", { ascending: false });

  // Buscar config de fidelidade para mostrar meta
  const { data: configFid } = await supabase
    .from("config_fidelidade")
    .select("pontos_meta, premio, descricao")
    .eq("activo", true)
    .single();

  const tiquetera_activa = tiqueteras?.find((t) => t.estado === "activa");

  // Calcular aniversário
  const hojeMesDia = cliente.fecha_nacimiento
    ? (() => {
        const hoje = new Date();
        const nasc = new Date(cliente.fecha_nacimiento + "T12:00:00");
        return nasc.getMonth() === hoje.getMonth() && nasc.getDate() === hoje.getDate();
      })()
    : false;

  // Calcular dias para aniversário
  const diasParaAniversario = cliente.fecha_nacimiento
    ? (() => {
        const hoje = new Date();
        const nasc = new Date(cliente.fecha_nacimiento + "T12:00:00");
        const proxAniv = new Date(hoje.getFullYear(), nasc.getMonth(), nasc.getDate());
        if (proxAniv < hoje) proxAniv.setFullYear(hoje.getFullYear() + 1);
        return Math.ceil((proxAniv.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      })()
    : null;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar rol={usuario?.rol ?? "operador"} nombre={usuario?.nombre ?? ""} logout={logout} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted">
            <Link href="/clientes" className="hover:text-primary transition-colors">
              Clientes
            </Link>
            <span>›</span>
            <span className="text-secondary font-medium">{cliente.nombre}</span>
          </div>

          {/* Alerta de aniversário */}
          {hojeMesDia && (
            <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-2 border-yellow-400/50 rounded-2xl px-6 py-4 flex items-center gap-4">
              <span className="text-4xl">🎂</span>
              <div>
                <p className="font-bold text-secondary text-lg">¡Hoy es el cumpleaños de {cliente.nombre.split(" ")[0]}!</p>
                <p className="text-muted text-sm">No olvides felicitarlo/a por WhatsApp 💬</p>
              </div>
              {cliente.telefono_wsp && (
                <a
                  href={`https://wa.me/57${cliente.telefono_wsp}?text=${encodeURIComponent(`¡Feliz cumpleaños ${cliente.nombre.split(" ")[0]}! 🎂🎉 Desde Linda Mariana te deseamos un día muy especial.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
                >
                  💬 Felicitar
                </a>
              )}
            </div>
          )}

          {/* Card do Cliente */}
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-primary px-6 py-8 flex items-center gap-5">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                {hojeMesDia ? "🎂" : cliente.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-white">{cliente.nombre}</h1>
                  {isAdmin && cliente.codigo && (
                    <span className="bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-full">
                      #{cliente.codigo}
                    </span>
                  )}
                </div>
                <p className="text-white/80 mt-1">📞 {cliente.telefono_wsp}</p>
              </div>
              {/* Badge fidelidade */}
              {cliente.pontos_fidelidade > 0 && (
                <div className="bg-yellow-400 text-yellow-900 rounded-2xl px-4 py-2 text-center flex-shrink-0">
                  <p className="text-2xl font-black">{cliente.pontos_fidelidade}</p>
                  <p className="text-xs font-bold uppercase tracking-wide">puntos</p>
                </div>
              )}
            </div>

            {/* Dados do cliente */}
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cliente.cedula && (
                <InfoItem label="Cédula" value={cliente.cedula} icon="🪪" />
              )}
              <InfoItem label="Teléfono WhatsApp" value={cliente.telefono_wsp} icon="📞" />
              {cliente.telefono_2 && (
                <InfoItem label="Teléfono 2" value={cliente.telefono_2} icon="📱" />
              )}
              {cliente.email && (
                <InfoItem label="Correo electrónico" value={cliente.email} icon="📧" />
              )}
              {cliente.fecha_nacimiento && (
                <InfoItem
                  label={`Cumpleaños${diasParaAniversario !== null && diasParaAniversario <= 7 && !hojeMesDia ? ` · en ${diasParaAniversario} días 🎉` : hojeMesDia ? " · ¡HOYA! 🎂" : ""}`}
                  value={new Date(cliente.fecha_nacimiento + "T12:00:00").toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "long",
                  })}
                  icon="🎂"
                />
              )}
              <InfoItem
                label="Estado"
                value={cliente.activo ? "Activo" : "Inactivo"}
                icon={cliente.activo ? "✅" : "🚫"}
              />
              <InfoItem
                label="Registrado el"
                value={new Date(cliente.created_at).toLocaleDateString("es-CO", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
                icon="📅"
              />
              {cliente.notas && (
                <InfoItem label="Notas" value={cliente.notas} icon="📝" className="sm:col-span-2" />
              )}
            </div>
          </div>

          {/* Card de Fidelidade */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <h2 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
              🏆 Puntos de Fidelidad
            </h2>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-5xl font-black text-yellow-500">{cliente.pontos_fidelidade}</p>
                <p className="text-sm text-muted font-medium mt-1">puntos acumulados</p>
              </div>
              {configFid && (
                <div className="flex-1 border-l border-border pl-6">
                  <p className="text-sm text-secondary font-semibold">{configFid.descricao}</p>
                  <p className="text-sm text-muted mt-1">🎁 Premio: <span className="font-semibold text-secondary">{configFid.premio}</span></p>
                  <div className="mt-3 bg-surface rounded-xl p-3">
                    <div className="flex justify-between text-xs text-muted mb-1.5">
                      <span>Progreso hacia el siguiente punto</span>
                      <span>{((cliente.pontos_fidelidade % configFid.pontos_meta) / configFid.pontos_meta * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${(cliente.pontos_fidelidade % configFid.pontos_meta) / configFid.pontos_meta * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tiquetera activa */}
          {tiquetera_activa ? (
            <div className="bg-white rounded-2xl border border-primary/30 shadow-sm p-6">
              <h2 className="text-lg font-bold text-secondary mb-4">🎫 Tiquetera Activa</h2>
              <TiqueteraCard tiquetera={tiquetera_activa} />
            </div>
          ) : (
            <div className="bg-primary-light border border-primary/20 rounded-2xl p-6 text-center">
              <p className="text-primary-dark font-medium">
                🎫 Este cliente no tiene una tiquetera activa.
              </p>
              {isAdmin && (
                <p className="text-sm text-muted mt-1">
                  Puedes venderle una desde el módulo de Tiqueteras.
                </p>
              )}
            </div>
          )}

          {/* Historial de tiqueteras */}
          {tiqueteras && tiqueteras.length > 1 && (
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
              <h2 className="text-lg font-bold text-secondary mb-4">📋 Historial</h2>
              <div className="space-y-3">
                {tiqueteras.slice(1).map((t) => (
                  <TiqueteraCard key={t.id} tiquetera={t} compact />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon,
  className = "",
}: {
  label: string;
  value: string;
  icon: string;
  className?: string;
}) {
  return (
    <div className={`flex gap-3 ${className}`}>
      <span className="text-xl mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-muted font-medium uppercase tracking-wide">{label}</p>
        <p className="text-secondary font-medium">{value}</p>
      </div>
    </div>
  );
}

function TiqueteraCard({
  tiquetera,
  compact = false,
}: {
  tiquetera: {
    id: string;
    tipo: number;
    precio: number;
    metodo_pago: string;
    fecha_inicio: string;
    fecha_vencimiento: string;
    estado: string;
  };
  compact?: boolean;
}) {
  const estadoColor: Record<string, string> = {
    activa: "bg-success/10 text-success",
    vencida: "bg-danger/10 text-danger",
    consumida: "bg-muted/10 text-muted",
  };

  return (
    <div className={`flex items-center gap-4 ${compact ? "py-2 border-b border-border last:border-0" : ""}`}>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-secondary">{tiquetera.tipo} días</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${estadoColor[tiquetera.estado] ?? "bg-muted/10 text-muted"}`}>
            {tiquetera.estado.charAt(0).toUpperCase() + tiquetera.estado.slice(1)}
          </span>
        </div>
        <p className="text-sm text-muted">
          {new Date(tiquetera.fecha_inicio + "T12:00:00").toLocaleDateString("es-CO")} →{" "}
          {new Date(tiquetera.fecha_vencimiento + "T12:00:00").toLocaleDateString("es-CO")} · {tiquetera.metodo_pago}
        </p>
      </div>
      <span className="font-bold text-secondary whitespace-nowrap">
        ${tiquetera.precio.toLocaleString("es-CO")}
      </span>
    </div>
  );
}
