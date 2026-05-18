import { AI_PROVIDERS, type AiProvider } from "./types";

function providerMeta(provider: AiProvider) {
  const meta = AI_PROVIDERS.find((p) => p.id === provider);
  if (!meta) throw new Error(`Unknown provider: ${provider}`);
  return meta;
}

function envKeyFor(provider: AiProvider): string | undefined {
  const meta = providerMeta(provider);
  const value = import.meta.env[meta.envVar];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function hasEnvApiKey(provider: AiProvider): boolean {
  return Boolean(envKeyFor(provider));
}

export function getApiKey(provider: AiProvider): string {
  return envKeyFor(provider) ?? localStorage.getItem(providerMeta(provider).storageKey)?.trim() ?? "";
}

export function setApiKey(provider: AiProvider, key: string): void {
  const { storageKey } = providerMeta(provider);
  const trimmed = key.trim();
  if (trimmed) localStorage.setItem(storageKey, trimmed);
  else localStorage.removeItem(storageKey);
}

export function apiKeyEnvHint(provider: AiProvider): string {
  const meta = providerMeta(provider);
  return `Set ${meta.envVar} in .env.local and restart the dev server, or paste your key below.`;
}
