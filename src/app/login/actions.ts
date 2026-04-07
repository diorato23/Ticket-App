"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: authData, error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/login?error=Credenciales+incorrectas");
  }

  // Buscar o role do usuário na tabela usuarios
  const { data: usuario } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("auth_id", authData.user.id)
    .single();

  revalidatePath("/", "layout");

  // Redirecionar baseado no role
  if (usuario?.rol === "admin") {
    redirect("/dashboard");
  } else {
    redirect("/marcacion");
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
