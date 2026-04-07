"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Cliente {
  nombre: string;
  telefono_wsp: string;
}

interface Tiquetera {
  id: string;
  tipo: number;
  precio: number;
  metodo_pago: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  estado: string;
  clientes: Cliente[]; // Supabase Returns an array for x-to-one when joining sometimes, but wait, it's 1-to-1 so it's a single object if defined correctly. Let's use `clientes: Cliente | Cliente[] | null`. We will normalize it.
  marcaciones: [{ count: number }];
}

export default function MarcacionBase() {
  const supabase = createClient();
  const [tiqueteras, setTiqueteras] = useState<Tiquetera[]>([]);
  const [marcacionesHoyCount, setMarcacionesHoyCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTiquetera, setSelectedTiquetera] = useState<Tiquetera | null>(null);
  const [isDesechable, setIsDesechable] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState<{ msg: string; tipo: "ok" | "err" } | null>(null);

  const showToast = (msg: string, tipo: "ok" | "err") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    // 1. Fetch active tiqueteras
    const { data: tData, error: tErr } = await supabase
      .from("tiqueteras")
      .select(`
        *,
        clientes (
          nombre,
          telefono_wsp
        ),
        marcaciones(count)
      `)
      .eq("estado", "activa");

    // 2. Fetch today's marcaciones to check duplicates
    // Using simple offset by getting current date string in local timezone
    const hoy = new Date();
    const startOfToday = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    
    const { data: mData, error: mErr } = await supabase
      .from("marcaciones")
      .select("tiquetera_id")
      .gte("fecha", startOfToday.toISOString());

    if (!tErr && tData) {
      setTiqueteras(tData as any);
    }
    
    if (!mErr && mData) {
      const counts: Record<string, number> = {};
      mData.forEach((m: any) => {
        counts[m.tiquetera_id] = (counts[m.tiquetera_id] || 0) + 1;
      });
      setMarcacionesHoyCount(counts);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [supabase]);

  // Derived state for search filtering
  const filteredTiqueteras = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return [];

    return tiqueteras.filter((t: any) => {
      // Normalize client object (Supabase might return single object or array depending on schema reflection)
      const cli = Array.isArray(t.clientes) ? t.clientes[0] : t.clientes;
      if (!cli) return false;

      return (
        cli.nombre.toLowerCase().includes(query) ||
        cli.telefono_wsp.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, tiqueteras]);

  // Normalization helper
  const getCliente = (t: any): Cliente => Array.isArray(t.clientes) ? t.clientes[0] : t.clientes;

  const handleSelect = (t: Tiquetera) => {
    setSelectedTiquetera(t);
    setIsDesechable(false);
  };

  const handleConfirmar = async () => {
    if (!selectedTiquetera) return;
    
    // QA Guard: Prevents over-consumption if button was bypassed
    const usadas = selectedTiquetera.marcaciones?.[0]?.count || 0;
    if (usadas >= selectedTiquetera.tipo) {
      showToast("❌ No puedes marcar. La tiquetera ya está agotada.", "err");
      return;
    }

    setSubmitting(true);

    // Call Supabase Insert
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    // Optional: Get The ID of the usuario related to the Auth.uid
    const { data: usuarioData } = await supabase.from("usuarios").select("id").eq("auth_id", userId).single();
    
    const { error } = await supabase.from("marcaciones").insert({
      tiquetera_id: selectedTiquetera.id,
      desechable: isDesechable,
      marcado_por: usuarioData?.id || null, // Se puede linkar quem marcou
    });

    if (error) {
      showToast("Error al registrar: " + error.message, "err");
    } else {
      showToast("✅ ¡Marcación Registrada Correctamente!", "ok");
      setSelectedTiquetera(null);
      setSearchQuery(""); // Limpar a busca
      loadData(); // Atualiza contador interno
    }
    setSubmitting(false);
  };

  const usosHoy = selectedTiquetera ? (marcacionesHoyCount[selectedTiquetera.id] || 0) : 0;
  const alreadyMarked = usosHoy > 0;
  const nextUse = usosHoy + 1;

  const isEsgotadoSelecionado = selectedTiquetera 
    ? (selectedTiquetera.marcaciones?.[0]?.count || 0) >= selectedTiquetera.tipo 
    : false;

  return (
    <div className="w-full relative">
      {/* Toast Animado */}
      {toast && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-xl text-white font-medium animate-fade-in flex items-center gap-2 ${
            toast.tipo === "ok" ? "bg-success" : "bg-danger"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Buscador Central */}
      <div className="relative max-w-xl mx-auto z-10 transition-all duration-300">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Busca al cliente o teléfono..."
          className="w-full pl-14 pr-5 py-5 border-2 border-border rounded-2xl text-secondary placeholder:text-muted focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-xl shadow-sm"
          autoFocus
        />
        {searchQuery.length > 0 && filteredTiqueteras.length === 0 && !loading && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-border rounded-xl shadow-lg text-center text-muted text-sm font-medium animate-fade-in">
            No se encontraron usuarios con tiqueteras activas.
          </div>
        )}
      </div>

      {/* Resultados da Busca */}
      <div className="mt-8 grid gap-4 max-w-2xl mx-auto">
        {filteredTiqueteras.map((t) => {
          const cli = getCliente(t);
          const usosHojeLista = marcacionesHoyCount[t.id] || 0;
          const marcado = usosHojeLista > 0;
          const usadas = t.marcaciones?.[0]?.count || 0;
          const restantes = t.tipo - usadas;

          return (
            <button
              key={t.id}
              onClick={() => handleSelect(t)}
              className="text-left bg-white border border-border p-5 rounded-xl flex items-center justify-between hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-2xl group-hover:scale-110 transition-transform shrink-0">
                  👩‍🌾
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-secondary group-hover:text-primary transition-colors truncate">
                    {cli.nombre}
                  </h3>
                  <p className="text-sm text-muted font-medium mt-1 truncate">
                    {cli.telefono_wsp} • Tiquetera {t.tipo} días
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-primary/10 text-primary-dark px-2 py-0.5 rounded-full font-bold">
                      Usadas: {usadas}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${restantes <= 0 ? 'bg-danger/10 text-danger-dark' : 'bg-success/10 text-success-dark'}`}>
                      Restantes: {Math.max(0, restantes)}
                    </span>
                  </div>
                </div>
              </div>

              {marcado && (
                <div className="flex flex-col items-end gap-1">
                  <span className="bg-warning/20 text-warning-dark px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {usosHojeLista > 1 ? `Ya Almorzó ${usosHojeLista} veces Hoy` : "Ya Almorzó Hoy"}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Dialog de Confirmação */}
      <Dialog open={!!selectedTiquetera} onOpenChange={(open) => !open && setSelectedTiquetera(null)}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-secondary">
              Confirmar almuerzo
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              Verifica los datos antes de marcar la asistencia para este cliente.
            </DialogDescription>
          </DialogHeader>

          {selectedTiquetera && (
            <div className="py-4 space-y-6">
              <div className="bg-surface p-4 rounded-xl border border-border">
                <p className="text-lg font-bold text-secondary text-center">
                  🧑 {getCliente(selectedTiquetera).nombre}
                </p>
                <p className="text-center text-muted mt-1 font-medium">
                  Plan Activo: {selectedTiquetera.tipo} Días
                </p>
                <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-border/60">
                  <div className="text-center">
                    <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Usadas</p>
                    <p className="text-2xl font-black text-primary">{selectedTiquetera.marcaciones?.[0]?.count || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Restantes</p>
                    <p className={`text-2xl font-black ${isEsgotadoSelecionado ? 'text-danger' : 'text-success'}`}>
                      {Math.max(0, selectedTiquetera.tipo - (selectedTiquetera.marcaciones?.[0]?.count || 0))}
                    </p>
                  </div>
                </div>
              </div>

              {alreadyMarked && (
                <div className="flex items-start gap-3 bg-warning/10 p-4 rounded-xl border border-warning/30">
                  <Info className="w-6 h-6 text-warning-dark shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-warning-dark">Atención: Múltiples Almuerzos Hoy</h4>
                    <p className="text-sm text-warning-dark/80 mt-1">
                      Este cliente ya registró {usosHoy} {usosHoy === 1 ? "almuerzo el día" : "almuerzos el día"} de hoy. ¿Estás seguro que deseas autorizar el consumo #{nextUse} diario?
                    </p>
                  </div>
                </div>
              )}

              <label className="flex items-center space-x-3 p-4 border border-border rounded-xl cursor-pointer hover:bg-surface transition-colors">
                <Checkbox
                  checked={isDesechable}
                  onCheckedChange={(c) => setIsDesechable(!!c)}
                  className="w-6 h-6 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className="flex-1">
                  <p className="font-medium text-secondary">Recipiente Desechable</p>
                  <p className="text-sm text-muted">+ $1.000 (Cobro Adicional en caja)</p>
                </div>
              </label>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-0 mt-2">
            <Button
              variant="outline"
              onClick={() => setSelectedTiquetera(null)}
              className="px-6 py-6 border-2 font-medium"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmar}
              disabled={submitting || isEsgotadoSelecionado}
              className={`px-8 py-6 font-bold text-white shadow-md ${
                isEsgotadoSelecionado ? "bg-danger opacity-80 cursor-not-allowed" :
                alreadyMarked ? "bg-warning hover:bg-warning-dark" : "bg-primary hover:bg-primary-dark"
              }`}
            >
              {isEsgotadoSelecionado ? "Tiquetera Esgotada" : submitting ? "Marcando..." : alreadyMarked ? `Autorizar ${nextUse}º Almuerzo` : "✓ Marcar Asistencia"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
