"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Cliente {
  id: string;
  nombre: string;
}

interface Tiquetera {
  id: string;
  tipo: number;
  precio: number;
  metodo_pago: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  estado: string;
  token_publico?: string;
  clientes?: { nombre: string }; // joined from DB
}

interface TiqueterasListProps {
  isAdmin: boolean;
}

const formSchema = z.object({
  cliente_id: z.string().min(1, "Debe seleccionar un cliente"),
  tipo: z.string().min(1, "Debe seleccionar el tipo de plan"),
  metodo_pago: z.string().min(1, "Debe seleccionar el método de pago"),
});

type FormValues = z.infer<typeof formSchema>;

export default function TiqueterasList({ isAdmin }: TiqueterasListProps) {
  const supabase = createClient();
  const [tiqueteras, setTiqueteras] = useState<Tiquetera[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSheet, setShowSheet] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tipo: "ok" | "err" } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente_id: "",
      tipo: "",
      metodo_pago: "",
    },
  });

  const showToast = (msg: string, tipo: "ok" | "err") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchTiqueteras = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tiqueteras")
      .select("*, clientes(nombre, telefono_wsp)")
      .order("created_at", { ascending: false });

    if (!error && data) setTiqueteras(data as any);
    setLoading(false);
  }, [supabase]);

  const fetchClientes = useCallback(async () => {
    const { data } = await supabase
      .from("clientes")
      .select("id, nombre")
      .eq("activo", true)
      .order("nombre", { ascending: true });
    if (data) setClientes(data);
  }, [supabase]);

  useEffect(() => {
    fetchTiqueteras();
    fetchClientes();
  }, [fetchTiqueteras, fetchClientes]);

  const abrirSheetNovo = () => {
    form.reset({
      cliente_id: "",
      tipo: "",
      metodo_pago: "",
    });
    setShowSheet(true);
  };

  const onSubmit = async (values: FormValues) => {
    // 1. Validate if client already has an active tiquetera
    const { data: actTiqueteras, error: checkErr } = await supabase
      .from("tiqueteras")
      .select("id")
      .eq("cliente_id", values.cliente_id)
      .eq("estado", "activa");

    if (checkErr) {
      showToast("Error de conexión al verificar el cliente.", "err");
      return;
    }

    if (actTiqueteras && actTiqueteras.length > 0) {
      form.setError("cliente_id", { type: "manual", message: "Este cliente ya posee una tiquetera ACTIVA. No puede tener dos al mismo tiempo." });
      return;
    }

    // 2. Prepare payload
    const tipoNum = parseInt(values.tipo);
    const precio = tipoNum === 15 ? 150000 : 300000;
    
    // Usar componentes locales de fecha para evitar desfase de timezone (UTC-5 Colombia)
    const hoy = new Date();
    const formatLocalDate = (d: Date) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };
    
    const fechaVencimiento = new Date(hoy);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + tipoNum);

    const dataToSave = {
      cliente_id: values.cliente_id,
      tipo: tipoNum,
      precio: precio,
      metodo_pago: values.metodo_pago,
      fecha_inicio: formatLocalDate(hoy),
      fecha_vencimiento: formatLocalDate(fechaVencimiento),
    };

    const { error: insertErr } = await supabase
      .from("tiqueteras")
      .insert(dataToSave);

    if (insertErr) {
      showToast("Error al registrar la tiquetera.", "err");
    } else {
      showToast("¡Tiquetera vendida correctamente!", "ok");
      setShowSheet(false);
      fetchTiqueteras();
    }
  };

  const anularTiquetera = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm("¿Anular esta tiquetera? Pasará a estado 'vencida' forzadamente.")) return;
    
    const { error } = await supabase
      .from("tiqueteras")
      .update({ estado: "vencida" })
      .eq("id", id);
      
    if (error) showToast("Error al anular la tiquetera.", "err");
    else {
      showToast("Tiquetera anulada.", "ok");
      fetchTiqueteras();
    }
  };

  const excluirTiquetera = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm("¿Eliminar esta tiquetera permanentemente? Esta acción NO se puede deshacer.")) return;
    
    const { error } = await supabase
      .from("tiqueteras")
      .delete()
      .eq("id", id);
      
    if (error) showToast("Error al eliminar la tiquetera.", "err");
    else {
      showToast("Tiquetera eliminada.", "ok");
      fetchTiqueteras();
    }
  };

  // Helper para formatear fechas sin desfase de timezone
  const formatFecha = (dateStr: string) => {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-fade-in ${
            toast.tipo === "ok" ? "bg-success" : "bg-danger"
          }`}
        >
          {toast.tipo === "ok" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-secondary">Tiqueteras</h2>
          <p className="text-muted text-sm mt-0.5">
            {loading ? "Cargando..." : `Se encontraron ${tiqueteras.length} transacciones`}
          </p>
        </div>
        <Button onClick={abrirSheetNovo} className="px-5 py-2.5 h-auto text-lg rounded-xl shadow-md bg-primary hover:bg-primary-dark">
          <span className="text-xl mr-2">+</span> Vender Tiquetera
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tiqueteras.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <span className="text-5xl block mb-3">🎫</span>
          <p className="font-medium">No hay histórico de tiqueteras registradas.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tiqueteras.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-all duration-200"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
                🎫
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-secondary text-lg truncate">
                  {t.clientes?.nombre || "Cargando..."}
                </p>
                <div className="flex gap-2 items-center flex-wrap mt-1">
                  <Badge variant={t.estado === "activa" ? "default" : t.estado === "vencida" ? "destructive" : "secondary"}>
                    {t.estado.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-secondary font-medium">• {t.tipo} DÍAS</span>
                  <span className="text-sm text-muted">• {t.metodo_pago}</span>
                </div>
                <p className="text-xs text-muted mt-2">
                  Inicia: {formatFecha(t.fecha_inicio)} | Vence: {formatFecha(t.fecha_vencimiento)}
                </p>
              </div>

              <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                <p className="font-bold text-secondary text-lg">
                  ${t.precio.toLocaleString("es-CO")}
                </p>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    {t.estado === "activa" && (
                      <button
                        onClick={() => anularTiquetera(t.id)}
                        className="text-xs px-3 py-1.5 bg-warning/10 text-warning hover:bg-warning/20 rounded-md transition-colors font-medium"
                        title="Anular (marcar como vencida)"
                      >
                        ⛔ Anular
                      </button>
                    )}
                    <button
                      onClick={() => excluirTiquetera(t.id)}
                      className="text-xs px-3 py-1.5 bg-danger/10 text-danger hover:bg-danger/20 rounded-md transition-colors font-medium"
                      title="Eliminar permanentemente"
                    >
                      🗑️ Eliminar
                    </button>
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}/mi-tiquetera/${t.token_publico}`;
                        navigator.clipboard.writeText(link);
                        showToast("🔗 Link copiado al portapapeles!", "ok");
                      }}
                      className="text-xs px-3 py-1.5 bg-primary/10 text-primary-dark hover:bg-primary/20 rounded-md transition-colors font-bold whitespace-nowrap"
                      title="Copiar Link para WhatsApp"
                    >
                      🔗 Copiar Link
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sheet Form — Nueva Tiquetera */}
      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent className="sm:max-w-md bg-white border-l-border overflow-y-auto overflow-x-hidden px-8">
          <SheetHeader className="mb-6 border-b pb-4">
            <SheetTitle className="text-secondary text-xl">
              🎫 Vender Nueva Tiquetera
            </SheetTitle>
            <SheetDescription>
              Asegúrate de que el cliente no tenga un plan activo hoy.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Seleccionar Cliente <span className="text-danger">*</span>
              </label>
              <Controller
                control={form.control}
                name="cliente_id"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Elige un cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.cliente_id && (
                <p className="text-[0.8rem] font-medium text-danger mt-1">
                  {form.formState.errors.cliente_id.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">
                  Plan de Días <span className="text-danger">*</span>
                </label>
                <Controller
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Días..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">Media (15 Días)</SelectItem>
                        <SelectItem value="30">Completa (30 Días)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.tipo && (
                  <p className="text-[0.8rem] font-medium text-danger mt-1">
                    {form.formState.errors.tipo.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1.5">
                  Método Pago <span className="text-danger">*</span>
                </label>
                <Controller
                  control={form.control}
                  name="metodo_pago"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Cobro..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                        <SelectItem value="Nequi">Nequi</SelectItem>
                        <SelectItem value="Bancolombia">Bancolombia</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.metodo_pago && (
                  <p className="text-[0.8rem] font-medium text-danger mt-1">
                    {form.formState.errors.metodo_pago.message}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
              <p className="text-sm font-medium text-secondary">
                Costo Estimado: 
                <span className="text-primary-dark ml-2 font-bold text-lg">
                  {form.watch("tipo") === "30" ? "$300.000" : form.watch("tipo") === "15" ? "$150.000" : "$0"}
                </span>
              </p>
            </div>

            <SheetFooter className="mt-6 pt-4 border-t">
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting} 
                className="w-full h-12 rounded-xl font-semibold shadow-md text-white bg-primary hover:bg-primary-dark"
              >
                {form.formState.isSubmitting ? "Procesando venta..." : "Confirmar Venta"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
