"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  rol: string;
  nombre: string;
  logout: () => Promise<void>;
}

export default function Navbar({ rol, nombre, logout }: NavbarProps) {
  const path = usePathname();
  const isAdmin = rol === "admin";

  const adminLinks = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/reportes", label: "Reportes", icon: "📑" },
    { href: "/clientes", label: "Clientes", icon: "👥" },
    { href: "/marcacion", label: "Marcación", icon: "✅" },
    { href: "/dashboard/fidelidade", label: "Fidelidad", icon: "🏆" },
    { href: "/dashboard/equipe", label: "Equipo", icon: "🛡️" },
  ];


  const operadorLinks = [
    { href: "/marcacion", label: "Marcación", icon: "✅" },
    { href: "/clientes", label: "Clientes", icon: "👥" },
  ];

  const links = isAdmin ? adminLinks : operadorLinks;

  return (
    <>
      <header className="bg-white border-b border-border shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">👩‍🍳</span>
              <span className="text-lg font-bold text-secondary hidden sm:block">
                Linda Mariana
              </span>
              <span
                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  isAdmin
                    ? "bg-primary/10 text-primary"
                    : "bg-success/10 text-success"
                }`}
              >
                {isAdmin ? "Admin" : "Operador"}
              </span>
            </div>

            {/* Nav links (Desktop) */}
            <nav className="hidden sm:flex items-center gap-1">
              {links.map((link) => {
                const active =
                  link.href === "/clientes"
                    ? path.startsWith("/clientes")
                    : path === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted hover:text-secondary hover:bg-surface"
                    }`}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Usuário + logout */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted hidden md:block truncate max-w-[140px]">
                {nombre}
              </span>
              <form>
                <button
                  formAction={logout}
                  className="text-sm font-medium text-muted hover:text-danger hover:bg-danger/10 transition-colors px-3 py-1.5 rounded-lg"
                >
                  Salir
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Nav (Mobile Only) */}
      <nav className="sm:hidden fixed bottom-0 left-0 w-full bg-white border-t border-border shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-40 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {links.map((link) => {
            const active =
              link.href === "/clientes"
                ? path.startsWith("/clientes")
                : path === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 ${
                  active ? "text-primary" : "text-muted hover:text-secondary"
                }`}
              >
                <span className={`text-xl transition-transform ${active ? "scale-110" : ""}`}>{link.icon}</span>
                <span className={`text-[10px] font-bold ${active ? "opacity-100" : "opacity-70"}`}>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
