import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const envVars = {};
envContent.split('\n').forEach(line => {
  const cleanLine = line.trim();
  const match = cleanLine.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Não foi possível carregar as chaves do Supabase no .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function criarUsuario() {
  const email = 'diorato@live.com';
  const password = 'senha123password';

  console.log(`⏳ Criando usuário: ${email}...`);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("❌ Erro ao criar usuário:", error.message);
    if (error.message.includes('Signups not allowed')) {
      console.log("\n⚠️ O Supabase está bloqueando cadastros públicos.");
      console.log("Solução: Você deve aceder ao Dashboard do Supabase e criar o utilizador manualmente ou desativar temporariamente o bloqueio de signups na aba Authentication -> Providers/Policies.");
    }
  } else {
    console.log("✅ Usuário criado com sucesso!");
    console.log(`📧 E-mail: ${email}`);
    console.log(`🔑 Senha: ${password}`);
    
    if (data?.user?.identities?.length === 0) {
      console.log("Atenção: O usuário já existia (esta é uma mensagem de fallback da API Supabase).");
    } else if (!data?.session) {
      console.log("👉 Obs: Lembre-se que você pode precisar confirmar o e-mail, acesse a caixa de entrada (ou desative 'Confirm email' via Dashboard do Supabase -> Authentication -> Providers -> Email).");
    }
  }
}

criarUsuario();
