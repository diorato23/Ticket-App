import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";

export const metadata = {
  title: "Mi Tiquetera | Linda Mariana",
};

export default async function PortalClientePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <PortalContent token={token} />;
}

async function PortalContent({ token }: { token: string }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Chamada remota ao PostgreSQL para a função de bypass de RLS
  const { data: tiquetera, error } = await supabase
    .rpc("get_tiquetera_public", { p_token: token });

  console.log("PORTAL RPC RESULT -> ", { tiquetera, error });

  if (error || !tiquetera) {
    return notFound();
  }

  const nombre = tiquetera.cliente?.nombre || "Amigo";

  const usadas = tiquetera.marcaciones_count || 0;
  const tipo = tiquetera.tipo;
  const restantes = tipo - usadas;
  let percent = (usadas / tipo) * 100;
  if (percent > 100) percent = 100;

  // Formatação de datas em Espanhol
  const formatoCorto = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long" });

  const fInicio = formatoCorto.format(new Date(tiquetera.fecha_inicio + "T12:00:00"));
  const fVence = formatoCorto.format(new Date(tiquetera.fecha_vencimiento + "T12:00:00"));

  // Gerar link do Whatsapp
  const numeroVladimir = "573146713097";
  const wppText = `Hola Linda Mariana! Quiero renovar mi tiquetera. Mi nombre es ${nombre}.`;
  const linkWpp = `https://wa.me/${numeroVladimir}?text=${encodeURIComponent(wppText)}`;

  const isVencidaOrConsumida = tiquetera.estado !== "activa";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden relative">

        {/* Header Decorativo */}
        <div className="h-32 bg-primary flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
          <div className="text-center z-10 relative mt-4">
            <h1 className="text-white text-2xl font-black tracking-tight drop-shadow-md">
              Linda Mariana
            </h1>
            <p className="text-primary-100 font-medium text-sm">
              Restaurante y Asados
            </p>
          </div>
        </div>

        {/* Avatar Flutuante */}
        <div className="flex justify-center -mt-10 relative z-20">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-md border-4 border-white">
            👩‍🍳
          </div>
        </div>

        {/* Content Body */}
        <div className="px-6 pb-8 pt-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              ¡Hola, {nombre}! 👋
            </h2>
            <p className="text-gray-500 mt-1 font-medium">
              Aquí está tu tiquetera digital.
            </p>
          </div>

          {/* Card Principal */}
          <div className={`p-5 rounded-2xl border-2 shadow-sm ${isVencidaOrConsumida ? "bg-gray-50 border-gray-200" : "bg-primary/5 border-primary/20"
            }`}>
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Plan</p>
                <p className={`font-bold text-lg ${isVencidaOrConsumida ? "text-gray-700" : "text-primary-dark"}`}>
                  {tipo} Almuerzos
                </p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${tiquetera.estado === "activa" ? "bg-success/20 text-success-dark" :
                    tiquetera.estado === "consumida" ? "bg-gray-200 text-gray-600" : "bg-danger/10 text-danger"
                  }`}>
                  {tiquetera.estado}
                </span>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="mt-5">
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-gray-600">{usadas} Usados</span>
                <span className="text-primary">{restantes} Quedan</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full transition-all duration-1000 ease-in-out ${percent >= 90 ? "bg-danger" : percent >= 70 ? "bg-warning" : "bg-success"
                    }`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>

            {/* Informações Extras */}
            <div className="mt-5 pt-4 border-t border-gray-200/60 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">Inicio</p>
                <p className="font-medium text-gray-700">{fInicio}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">Vence en</p>
                <p className="font-medium text-gray-700">{fVence}</p>
              </div>
            </div>
          </div>

          {/* CTA Renovação */}
          <div className="mt-8">
            <a
              href={linkWpp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 bg-[#25D366] hover:bg-[#20BE5C] text-white rounded-xl font-bold text-lg shadow-lg shadow-green-500/30 transition-all hover:-translate-y-1"
            >
              <span className="text-2xl">💬</span>
              Renovar por WhatsApp
            </a>
            <p className="text-center text-xs text-gray-400 mt-4 font-medium">
              Linda Mariana Restaurante ❤️<br />
              Atendido con amor por Vladimir y Familia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
