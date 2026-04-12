"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface Config {
  id: string;
  pontos_meta: number;
  tipo: string;
  descricao: string;
  premio: string;
  activo: boolean;
}

export default function FidelidadeConfig({ config }: { config: Config | null }) {
  const supabase = createClient();
  const [pontosMeta, setPontosMeta] = useState(config?.pontos_meta ?? 4);
  const [tipo, setTipo] = useState(config?.tipo ?? "ambos");
  const [descricao, setDescricao] = useState(config?.descricao ?? "4 almoços = 1 ponto para a rifa");
  const [premio, setPremio] = useState(config?.premio ?? "Rifa mensal");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tipo: "ok" | "err" } | null>(null);

  const showToast = (msg: string, tipo: "ok" | "err") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const salvar = async () => {
    setSaving(true);
    const payload = {
      pontos_meta: pontosMeta,
      tipo,
      descricao,
      premio,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (config?.id) {
      ({ error } = await supabase
        .from("config_fidelidade")
        .update(payload)
        .eq("id", config.id));
    } else {
      ({ error } = await supabase
        .from("config_fidelidade")
        .insert({ ...payload, activo: true }));
    }

    setSaving(false);
    if (error) showToast("Error al guardar la configuración.", "err");
    else showToast("✅ Configuración guardada correctamente.", "ok");
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-fade-in ${toast.tipo === "ok" ? "bg-success" : "bg-danger"}`}>
          {toast.tipo === "ok" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      <h2 className="text-lg font-bold text-secondary mb-5 flex items-center gap-2">
        ⚙️ Configuración de Reglas
      </h2>

      <div className="space-y-5">
        {/* Meta de puntos */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1.5">
            🎯 Meta de almuerzos para ganar 1 punto
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={pontosMeta}
            onChange={(e) => setPontosMeta(Number(e.target.value))}
            className="w-full h-12 px-4 border border-border rounded-xl text-secondary font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
          <p className="text-[0.8rem] text-muted mt-1">
            Actualmente: cada <strong>{pontosMeta}</strong> almuerzos = 1 punto
          </p>
        </div>

        {/* Tipo de contagem */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1.5">
            📊 Tipo de conteo
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "total", label: "Total", desc: "Suma sin importar si son seguidos" },
              { value: "consecutivos", label: "Seguidos", desc: "Solo días consecutivos" },
              { value: "ambos", label: "Ambos", desc: "Total O consecutivos" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTipo(opt.value)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  tipo === opt.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted hover:border-secondary/30"
                }`}
              >
                <p className="font-bold text-sm">{opt.label}</p>
                <p className="text-xs mt-0.5 opacity-70">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1.5">
            📝 Descripción visible para los clientes
          </label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full h-12 px-4 border border-border rounded-xl text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>

        {/* Premio */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1.5">
            🎁 Premio del programa
          </label>
          <input
            type="text"
            value={premio}
            onChange={(e) => setPremio(e.target.value)}
            placeholder="Ej: Rifa mensual, Almuerzo gratis..."
            className="w-full h-12 px-4 border border-border rounded-xl text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>

        {/* Preview */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-yellow-800 mb-1">📋 Previsualización:</p>
          <p className="text-sm text-yellow-700">{descricao}</p>
          <p className="text-sm text-yellow-700 mt-1">🎁 Premio: <strong>{premio}</strong></p>
        </div>

        <Button
          onClick={salvar}
          disabled={saving}
          className="w-full h-12 rounded-xl font-semibold shadow-md text-white bg-primary hover:bg-primary-dark"
        >
          {saving ? "Guardando..." : "💾 Guardar Configuración"}
        </Button>
      </div>
    </div>
  );
}
