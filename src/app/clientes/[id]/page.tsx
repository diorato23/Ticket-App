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

  // Buscar cliente
  const { data: cliente, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !cliente) redirect("/clientes");

  // Buscar tiqueteras do cliente
  const { data: tiqueteras } = await supabase
    .from("tiqueteras")
    .select("*")
    .eq("cliente_id", id)
    .order("created_at", { ascending: false });

  const tiquetera_activa = tiqueteras?.find((t) => t.estado === "activa");

  return (
    <div className="min-h-screen bg-surface">
      <Navbar rol={usuario?.rol ?? "operador"} nombre={usuario?.nombre ?? ""} logout={logout} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted mb-6">
            <Link href="/clientes" className="hover:text-primary transition-colors">
              Clientes
            </Link>
            <span>›</span>
            <span className="text-secondary font-medium">{cliente.nombre}</span>
          </div>

          {/* Card do Cliente */}
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
            {/* Header laranja */}
            <div className="bg-primary px-6 py-8 flex items-center gap-5">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                {cliente.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{cliente.nombre}</h1>
                <p className="text-white/80 mt-1">📞 {cliente.telefono_wsp}</p>
              </div>
            </div>

            {/* Dados do cliente */}
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem label="Teléfono WhatsApp" value={cliente.telefono_wsp} icon="📞" />
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

          {/* Tiquetera activa */}
          {tiquetera_activa ? (
            <div className="bg-white rounded-2xl border border-primary/30 shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-secondary mb-4">🎫 Tiquetera Activa</h2>
              <TiqueteraCard tiquetera={tiquetera_activa} />
            </div>
          ) : (
            <div className="bg-primary-light border border-primary/20 rounded-2xl p-6 mb-6 text-center">
              <p className="text-primary-dark font-medium">
                🎫 Este cliente no tiene una tiquetera activa.
              </p>
              {usuario?.rol === "admin" && (
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
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${estadoColor[tiquetera.estado] ?? "bg-muted/10 text-muted"}`}
          >
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
