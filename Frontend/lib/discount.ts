import type { Oferta, Descuento } from "./api"

export interface DiscountResult {
  precioOriginal: number
  precioFinal: number
  ahorro: number
  porcentajeAhorro: number
  descuento: Descuento | null
  valor: number
  tipo: 'porcentaje' | 'fijo' | null
}

interface Candidato {
  valor: number
  tipo: 'porcentaje' | 'fijo'
}

function calcularPrecio(precioOriginal: number, c: Candidato): number {
  return c.tipo === 'porcentaje'
    ? Math.max(0, precioOriginal * (1 - c.valor / 100))
    : Math.max(0, precioOriginal - c.valor)
}

/**
 * Calcula el MEJOR descuento aplicable a una oferta.
 *
 * REGLAS (los descuentos NO se acumulan):
 *  1. Filtra descuentos: activos, en vigencia, y que apliquen a algún servicio de la oferta.
 *  2. Para cada descuento, evalúa TODOS sus posibles valores aplicables al usuario:
 *     - Valor del rol activo (si existe)
 *     - Valor global (si está definido)
 *     y elige el mejor (precio más bajo) DENTRO de ese descuento.
 *  3. Entre todos los descuentos elegibles, elige el que produzca el menor precio final.
 *     Esto significa: si un descuento es 30% y otro es $5000 pesos fijos,
 *     se elige el que reste más al precio (el que el cliente termine pagando menos).
 */
export function calcularDescuento(
  oferta: Oferta,
  descuentos: Descuento[],
  activeRoleId?: string | null
): DiscountResult {
  const precioOriginal = Number(oferta.precio)
  const ofertaServicioIds = new Set(oferta.servicios.map(s => s.id))
  const now = Date.now()

  let mejorDescuento: Descuento | null = null
  let mejorValor = 0
  let mejorTipo: 'porcentaje' | 'fijo' | null = null
  let mejorPrecioFinal = precioOriginal

  for (const d of descuentos) {
    // ── Filtros de elegibilidad ──────────────────────────────────────────
    if (!d.is_active) continue
    if (new Date(d.fecha_inicio).getTime() > now) continue
    if (d.fecha_fin && new Date(d.fecha_fin).getTime() < now) continue

    // Si el descuento define servicios, la oferta debe incluir al menos uno
    const dServicios = d.streaming_services?.map(s => s.id) ?? []
    if (dServicios.length > 0 && !dServicios.some(id => ofertaServicioIds.has(id))) continue

    // ── Recolectar candidatos (rol + global) ─────────────────────────────
    const candidatos: Candidato[] = []

    // 1) Valor por rol del usuario (si tiene rol activo y el descuento tiene roles asignados)
    if (activeRoleId && d.roles && d.roles.length > 0) {
      const roleDesc = d.roles.find(r =>
        String(r.id) === String(activeRoleId) && (r.pivot?.is_active ?? true)
      )
      if (roleDesc && Number(roleDesc.pivot.valor_descuento) > 0) {
        candidatos.push({
          valor: Number(roleDesc.pivot.valor_descuento),
          tipo: roleDesc.pivot.tipo_descuento,
        })
      }
    }

    // 2) Valor global del descuento
    if (d.valor_global !== null && d.valor_global !== undefined && Number(d.valor_global) > 0) {
      candidatos.push({
        valor: Number(d.valor_global),
        tipo: d.tipo_global ?? 'porcentaje',
      })
    }

    if (candidatos.length === 0) continue

    // ── Mejor candidato DENTRO de este descuento ─────────────────────────
    let mejorEnDescuento: Candidato | null = null
    let mejorPrecioEnDescuento = precioOriginal

    for (const c of candidatos) {
      const pf = calcularPrecio(precioOriginal, c)
      if (pf < mejorPrecioEnDescuento) {
        mejorPrecioEnDescuento = pf
        mejorEnDescuento = c
      }
    }

    if (!mejorEnDescuento) continue

    // ── Comparar contra el mejor global encontrado hasta ahora ───────────
    if (mejorPrecioEnDescuento < mejorPrecioFinal) {
      mejorPrecioFinal = mejorPrecioEnDescuento
      mejorDescuento = d
      mejorValor = mejorEnDescuento.valor
      mejorTipo = mejorEnDescuento.tipo
    }
  }

  const ahorro = precioOriginal - mejorPrecioFinal
  const porcentajeAhorro = precioOriginal > 0 ? Math.round((ahorro / precioOriginal) * 100) : 0

  return {
    precioOriginal,
    precioFinal: mejorPrecioFinal,
    ahorro,
    porcentajeAhorro,
    descuento: mejorDescuento,
    valor: mejorValor,
    tipo: mejorTipo,
  }
}
