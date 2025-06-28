// Caminho do ficheiro: src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina classes do Tailwind de forma inteligente, evitando conflitos.
 * @param inputs As classes a serem combinadas.
 * @returns Uma string com as classes combinadas.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
