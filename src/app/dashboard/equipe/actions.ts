"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function criarOperador(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const rol = formData.get("rol") as string || "operador";

  if (!nombre || !email || !password) {
    return { error: "Todos los campos son obligatorios" };
  }

  // 1. Verify that the caller is an Admin
  const supabaseSession = await createClient();
  const { data: { user } } = await supabaseSession.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: usuarioRoot } = await supabaseSession
    .from("usuarios")
    .select("rol")
    .eq("auth_id", user.id)
    .single();

  if (usuarioRoot?.rol !== "admin") {
    return { error: "Permiso denegado. Solo administradores pueden crear equipo." };
  }

  // 2. Perform DB creation as Admin bypassing RLS
  const adminAuth = createAdminClient();

  try {
    // 2.a Create Auth User
    const { data: authData, error: authError } = await adminAuth.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto confirm so they can login immediately
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return { error: "Este correo electrónico ya está registrado" };
      }
      return { error: authError.message };
    }

    if (!authData.user) return { error: "Error al generar identidad" };

    // 2.b Create entry in usuarios table referencing auth_id
    const { error: dbError } = await adminAuth
      .from("usuarios")
      .insert([
        {
          auth_id: authData.user.id,
          nombre,
          rol,
        }
      ]);

    if (dbError) {
      // rollback auth user creation if DB inert fails
      await adminAuth.auth.admin.deleteUser(authData.user.id);
      return { error: `Error DB: ${dbError.message}` };
    }

    return { success: true };

  } catch (err: any) {
    return { error: err.message || "Error inesperado" };
  }
}

export async function removerOperador(authId: string) {
  // 1. Verify caller is an Admin
  const supabaseSession = await createClient();
  const { data: { user } } = await supabaseSession.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: usuarioRoot } = await supabaseSession
    .from("usuarios")
    .select("rol")
    .eq("auth_id", user.id)
    .single();

  if (usuarioRoot?.rol !== "admin") {
    return { error: "Permiso denegado" };
  }

  if (authId === user.id) {
    return { error: "No puedes eliminarte a ti mismo" };
  }

  const adminAuth = createAdminClient();

  try {
    // 2. Delete Auth User (RLS will cascade delete the 'usuarios' table because we set ON DELETE CASCADE during schema setup... wait, did we?
    // If not cascading, we should manually delete it first)
    const { error: dbError } = await adminAuth
      .from("usuarios")
      .delete()
      .eq("auth_id", authId);

    if (dbError) return { error: dbError.message };

    const { error: authError } = await adminAuth.auth.admin.deleteUser(authId);
    
    if (authError) {
      return { error: authError.message };
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
