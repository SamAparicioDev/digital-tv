import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formatea un número como moneda colombiana (COP) sin decimales */
export function formatCOP(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0)
  return isNaN(n) ? '$0' : `$${n.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}
