/**
 * FuelOps Pro — Camada de Persistência via Supabase
 *
 * Substitui completamente o localStorage por Supabase PostgreSQL.
 * Cada módulo é identificado por um `module_name` e um `period_key`.
 * Os dados são armazenados como JSONB na tabela `module_data`.
 *
 * Mantém fallback localStorage para modo offline (resilência).
 */

import { supabase } from "../database/supabaseClient";

// ════════════════════════════════════════════════════════════
// NOMES DOS MÓDULOS
// ════════════════════════════════════════════════════════════

export const MODULE_NAMES = {
  REGULAMENTACAO: "regulamentacao",
  MANUTENCAO: "manutencao",
  FINANCEIRO: "financeiro",
  ESTRATEGIA: "estrategia",
  ATENDIMENTO: "atendimento",
  CONFIGURACOES: "configuracoes",
  LUBRIFICACAO: "lubrificacao",
  PONTO: "ponto",
} as const;

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

function makeKey(year: number, monthIdx: number): string {
  return `${year}-${String(monthIdx + 1).padStart(2, "0")}`;
}

// ════════════════════════════════════════════════════════════
// CARREGAR DADOS DE UM MÓDULO PARA UM PERÍODO ESPECÍFICO
// ════════════════════════════════════════════════════════════

export async function loadModuleData<T>(
  moduleName: string,
  periodKey: string
): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from("module_data")
      .select("data")
      .eq("module_name", moduleName)
      .eq("period_key", periodKey)
      .single();

    if (error || !data) return null;
    return data.data as T;
  } catch (err) {
    console.error(`[Supabase] loadModuleData error for "${moduleName}":`, err);
    // Fallback: tentar carregar do localStorage
    try {
      const raw = localStorage.getItem(`${moduleName}_${periodKey}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

// ════════════════════════════════════════════════════════════
// CARREGAR TODOS OS PERÍODOS DE UM MÓDULO
// ════════════════════════════════════════════════════════════

export async function loadAllModuleData<T>(
  moduleName: string
): Promise<Record<string, T>> {
  try {
    const { data, error } = await supabase
      .from("module_data")
      .select("period_key, data")
      .eq("module_name", moduleName);

    if (error || !data) {
      // Fallback: localStorage
      return loadAllFromLocalStorage<T>(moduleName);
    }

    const result: Record<string, T> = {};
    for (const row of data) {
      result[row.period_key] = row.data as T;
    }
    return result;
  } catch (err) {
    console.error(`[Supabase] loadAllModuleData error for "${moduleName}":`, err);
    return loadAllFromLocalStorage<T>(moduleName);
  }
}

// ════════════════════════════════════════════════════════════
// SALVAR DADOS DE UM MÓDULO PARA UM PERÍODO ESPECÍFICO
// ════════════════════════════════════════════════════════════

export async function saveModuleData<T>(
  moduleName: string,
  periodKey: string,
  data: T
): Promise<void> {
  try {
    const { error } = await supabase.from("module_data").upsert(
      {
        module_name: moduleName,
        period_key: periodKey,
        data: data as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "module_name,period_key" }
    );

    if (error) throw error;

    // Sincronizar com localStorage como fallback
    try {
      localStorage.setItem(
        `${moduleName}_${periodKey}`,
        JSON.stringify(data)
      );
    } catch {
      /* silent */
    }
  } catch (err) {
    console.error(`[Supabase] saveModuleData error for "${moduleName}" [${periodKey}]:`, err);
    // Fallback: salvar apenas no localStorage
    try {
      localStorage.setItem(
        `${moduleName}_${periodKey}`,
        JSON.stringify(data)
      );
    } catch {
      /* silent */
    }
  }
}

// ════════════════════════════════════════════════════════════
// SALVAR TODOS OS PERÍODOS DE UM MÓDULO (substituição completa)
// ════════════════════════════════════════════════════════════

export async function saveAllModuleData<T>(
  moduleName: string,
  allData: Record<string, T>
): Promise<void> {
  try {
    // Deletar todos os registros existentes deste módulo
    const { error: delError } = await supabase
      .from("module_data")
      .delete()
      .eq("module_name", moduleName);

    if (delError) throw delError;

    // Inserir todos os períodos
    const entries = Object.entries(allData);
    if (entries.length > 0) {
      const rows = entries.map(([period_key, data]) => ({
        module_name: moduleName,
        period_key,
        data: data as unknown as Record<string, unknown>,
      }));

      const { error: insError } = await supabase
        .from("module_data")
        .insert(rows);

      if (insError) throw insError;
    }

    // Sincronizar com localStorage
    try {
      localStorage.setItem(`fuelops_${moduleName}`, JSON.stringify(allData));
    } catch {
      /* silent */
    }
  } catch (err) {
    console.error(`[Supabase] saveAllModuleData error for "${moduleName}":`, err);
    // Fallback: salvar apenas no localStorage
    try {
      localStorage.setItem(`fuelops_${moduleName}`, JSON.stringify(allData));
    } catch {
      /* silent */
    }
  }
}

// ════════════════════════════════════════════════════════════
// CARREGAR DADOS SIMPLES (Configuracoes empresa, etc.)
// ════════════════════════════════════════════════════════════

export async function loadSimpleData<T>(
  moduleName: string,
  periodKey: string,
  defaultValue: T
): Promise<T> {
  try {
    const { data, error } = await supabase
      .from("module_data")
      .select("data")
      .eq("module_name", moduleName)
      .eq("period_key", periodKey)
      .single();

    if (error || !data) return defaultValue;
    return data.data as T;
  } catch (err) {
    console.error(`[Supabase] loadSimpleData error for "${moduleName}" [${periodKey}]:`, err);
    return defaultValue;
  }
}

// ════════════════════════════════════════════════════════════
// UPLOAD DE ARQUIVOS PARA SUPABASE STORAGE
// ════════════════════════════════════════════════════════════

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string | null> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return urlData?.publicUrl ?? null;
  } catch {
    return null;
  }
}

export async function deleteFile(
  bucket: string,
  path: string
): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    return !error;
  } catch {
    return false;
  }
}

export async function getFileUrl(
  bucket: string,
  path: string
): Promise<string | null> {
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl ?? null;
  } catch {
    return null;
  }
}

// ════════════════════════════════════════════════════════════
// MIGRAÇÃO: Carregar dados existentes do localStorage para Supabase
// ════════════════════════════════════════════════════════════

export async function migrateLocalStorageToSupabase(): Promise<{
  migrated: number;
  errors: number;
}> {
  const moduleKeys: Record<string, string> = {
    regulamentacao: "dadosRegulamentacao",
    manutencao: "dadosManutencao",
    financeiro: "fuelops_financeiro_data",
    estrategia: "dadosEstrategia",
    atendimento: "dadosAtendimento",
    configuracoes: "dadosConfiguracoes",
    lubrificacao: "dadosLubrificacao",
    ponto: "fuelops_ponto_data",
  };

  let migrated = 0;
  let errors = 0;

  for (const [moduleName, lsKey] of Object.entries(moduleKeys)) {
    try {
      const raw = localStorage.getItem(lsKey);
      if (!raw) continue;

      const parsed = JSON.parse(raw);

      if (moduleName === "configuracoes") {
        // Configuracoes é flat (não period-based)
        await saveModuleData(moduleName, "empresa", parsed);
      } else {
        // Dados period-based: salvar cada período individualmente
        for (const [periodKey, data] of Object.entries(parsed)) {
          await saveModuleData(moduleName, periodKey, data);
        }
      }
      migrated++;
    } catch {
      errors++;
    }
  }

  return { migrated, errors };
}

// ════════════════════════════════════════════════════════════
// FALLBACK: Carregar dados do localStorage (modo offline)
// ════════════════════════════════════════════════════════════

function loadAllFromLocalStorage<T>(moduleName: string): Record<string, T> {
  const lsKeys: Record<string, string> = {
    regulamentacao: "dadosRegulamentacao",
    manutencao: "dadosManutencao",
    financeiro: "fuelops_financeiro_data",
    estrategia: "dadosEstrategia",
    atendimento: "dadosAtendimento",
    configuracoes: "dadosConfiguracoes",
    lubrificacao: "dadosLubrificacao",
    ponto: "fuelops_ponto_data",
  };

  try {
    const lsKey = lsKeys[moduleName];
    if (!lsKey) return {};
    const raw = localStorage.getItem(lsKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export { makeKey };
