"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Cliente {
  id: string;
  nombre: string;
  telefono_wsp: string;
  notas: string | null;
  activo: boolean;
  created_at: string;
}

interface ClientesListProps {
  isAdmin: boolean;
}

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  telefono_wsp: z
    .string()
    .regex(/^\d{10}$/, "El teléfono debe tener exactamente 10 dígitos (sin código de país)."),
  notas: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ClientesList({ isAdmin }: ClientesListProps) {
  const supabase = createClient();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Sheet states
  const [showSheet, setShowSheet] = useState(false);
  const [editCliente, setEditCliente] = useState<Cliente | null>(null);
  
  const [toast, setToast] = useState<{ msg: string; tipo: "ok" | "err" } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      telefono_wsp: "",
      notas: "",
    },
  });

  const showToast = (msg: string, tipo: "ok" | "err") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchClientes = useCallback(async (termino: string) => {
    setLoading(true);
    let query = supabase
      .from("clientes")
      .select("*")
      .eq("activo", true)
      .order("nombre", { ascending: true });

    if (termino.trim()) {
      query = query.or(`nombre.ilike.%${termino}%,telefono_wsp.ilike.%${termino}%`);
    }

    const { data, error } = await query;
    if (!error && data) setClientes(data);
    setLoading(false);
  }, [supabase]);

  // Debounce for search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClientes(busca);
    }, 350);
    return () => clearTimeout(timer);
  }, [busca, fetchClientes]);

  const abrirSheetNovo = () => {
    setEditCliente(null);
    form.reset({
      nombre: "",
      telefono_wsp: "",
      notas: "",
    });
    setShowSheet(true);
  };

  const abrirSheetEditar = (c: Cliente) => {
    setEditCliente(c);
    form.reset({
      nombre: c.nombre,
      telefono_wsp: c.telefono_wsp,
      notas: c.notas || "",
    });
    setShowSheet(true);
  };

  const onSubmit = async (values: FormValues) => {
    const dataToSave = {
      nombre: values.nombre.trim(),
      telefono_wsp: values.telefono_wsp.trim(),
      notas: values.notas?.trim() || null,
    };

    if (editCliente) {
      const { error } = await supabase
        .from("clientes")
        .update(dataToSave)
        .eq("id", editCliente.id);
      if (error) showToast("Error al actualizar el cliente.", "err");
      else showToast("Cliente actualizado correctamente.", "ok");
    } else {
      const { error } = await supabase
        .from("clientes")
        .insert(dataToSave);
      if (error) showToast("Error al registrar el cliente.", "err");
      else showToast("¡Cliente registrado correctamente!", "ok");
    }

    setShowSheet(false);
    fetchClientes(busca);
  };

  const desativarCliente = async (id: string, event: React.MouseEvent) => {
    event.preventDefault(); // prevent navigation
    if (!confirm("¿Desactivar este cliente? No se borrará, solo se ocultará.")) return;
    const { error } = await supabase
      .from("clientes")
      .update({ activo: false })
      .eq("id", id);
    if (error) showToast("Error al desactivar el cliente.", "err");
    else {
      showToast("Cliente desactivado.", "ok");
      fetchClientes(busca);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-secondary">Clientes</h2>
          <p className="text-muted text-sm mt-0.5">
            {loading ? "Cargando..." : `${clientes.length} cliente${clientes.length !== 1 ? "s" : ""} activo${clientes.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={abrirSheetNovo} className="px-5 py-2.5 h-auto text-lg rounded-xl shadow-md">
          <span className="text-xl mr-2">+</span> Nuevo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-lg">🔍</span>
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nombre o teléfono (ej: 3146 o María)..."
          className="w-full pl-11 pr-4 py-3 border border-border rounded-xl text-secondary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
        />
        {busca && (
          <button
            onClick={() => setBusca("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary text-xl"
          >
            ×
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : clientes.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <span className="text-5xl block mb-3">👥</span>
          <p className="font-medium">
            {busca ? "Ningún cliente coincide con la búsqueda." : "Aún no hay clientes registrados."}
          </p>
          {!busca && (
            <Button variant="outline" onClick={abrirSheetNovo} className="mt-4 border-primary/40 text-primary">
              Registrar primer cliente
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {clientes.map((c) => (
            <a
              key={c.id}
              href={`/clientes/${c.id}`}
              className="group bg-white border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-md hover:border-primary/30 transition-all duration-200"
            >
              <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                {c.nombre.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-secondary truncate group-hover:text-primary transition-colors">
                  {c.nombre}
                </p>
                <p className="text-sm text-muted">📞 {c.telefono_wsp}</p>
                {c.notas && <p className="text-xs text-muted mt-0.5 truncate">{c.notas}</p>}
              </div>

              {isAdmin && (
                <div
                  className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.preventDefault()}
                >
                  <button
                    onClick={(e) => { e.preventDefault(); abrirSheetEditar(c); }}
                    className="p-2 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => desativarCliente(c.id, e)}
                    className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    title="Desactivar"
                  >
                    🚫
                  </button>
                </div>
              )}

              <span className="text-muted text-lg group-hover:translate-x-1 transition-transform">›</span>
            </a>
          ))}
        </div>
      )}

      {/* Sheet Form */}
      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent className="sm:max-w-md bg-white border-l-border overflow-y-auto overflow-x-hidden px-8">
          <SheetHeader className="mb-6 border-b pb-4 mt-4">
            <SheetTitle className="text-secondary text-xl">
              {editCliente ? "✏️ Editar Cliente" : "👤 Nuevo Cliente"}
            </SheetTitle>
            <SheetDescription>
              Llena los datos del cliente. El teléfono no debe tener código de país.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Nombre completo <span className="text-danger">*</span>
              </label>
              <Input placeholder="Ej: María González" className="h-12 rounded-xl" {...form.register("nombre")} />
              {form.formState.errors.nombre && <p className="text-[0.8rem] font-medium text-danger mt-1">{form.formState.errors.nombre.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Teléfono WhatsApp <span className="text-danger">*</span>
              </label>
              <Input
                type="tel"
                placeholder="Ej: 3146713097"
                className="h-12 rounded-xl font-mono"
                {...form.register("telefono_wsp", {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  }
                })}
              />
              <p className="text-[0.8rem] text-muted mt-1">Sin código de país (+57). Solo 10 dígitos.</p>
              {form.formState.errors.telefono_wsp && <p className="text-[0.8rem] font-medium text-danger mt-1">{form.formState.errors.telefono_wsp.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Notas <span className="text-muted font-normal">(opcional)</span>
              </label>
              <Input placeholder="Ej: Es alérgica al marisco..." className="h-12 rounded-xl" {...form.register("notas")} />
              {form.formState.errors.notas && <p className="text-[0.8rem] font-medium text-danger mt-1">{form.formState.errors.notas.message}</p>}
            </div>

            <SheetFooter className="mt-6 pt-4 border-t">
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting} 
                className="w-full h-12 rounded-xl font-semibold shadow-md text-white bg-primary hover:bg-primary-dark"
              >
                {form.formState.isSubmitting 
                  ? "Guardando..." 
                  : editCliente ? "Actualizar" : "Registrar"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
