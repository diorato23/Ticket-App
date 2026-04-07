import { login } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <LoginContent searchParams={searchParams} />
  );
}

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMsg = params?.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-light">
      <div className="animate-fade-in w-full max-w-md mx-4">
        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Cabeçalho com a Marca */}
          <div className="bg-primary px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
              <span className="text-4xl">👩‍🍳</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Linda Mariana</h1>
            <p className="text-white/80 text-sm mt-1">
              Sistema de Tiqueteras
            </p>
          </div>

          {/* Formulário */}
          <div className="px-8 py-8">
            {errorMsg && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm text-center">
                ⚠️ {decodeURIComponent(errorMsg)}
              </div>
            )}

            <form className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-secondary mb-1.5"
                >
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="mariana@lindamariana.com"
                  className="w-full px-4 py-3 border border-border rounded-xl text-secondary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-secondary mb-1.5"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-border rounded-xl text-secondary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              <button
                formAction={login}
                className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary-dark/30 transition-all duration-200 active:scale-[0.98]"
              >
                Iniciar Sesión
              </button>
            </form>
          </div>

          {/* Rodapé */}
          <div className="px-8 pb-6 text-center">
            <p className="text-xs text-muted">
              🔒 Acesso restrito a equipe Linda Mariana
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
