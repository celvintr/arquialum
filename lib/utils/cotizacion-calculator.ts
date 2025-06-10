export interface ParametroManoObra {
  nombre: string
  tipo: "fabricacion" | "instalacion" | "malla"
  tarifa_por_m2: number
  activo: boolean
}

export interface ConfiguracionMalla {
  materiales_que_contribuyen: string[] // IDs de materiales
  incluye_mano_obra: boolean
  tarifa_mano_obra_m2?: number
}

export class CotizacionCalculator {
  private dimensiones: any
  private materiales: any[]
  private parametrosManoObra: ParametroManoObra[]
  private configuracionMalla: ConfiguracionMalla

  constructor(
    dimensiones: any,
    materiales: any[],
    parametrosManoObra: ParametroManoObra[],
    configuracionMalla: ConfiguracionMalla,
  ) {
    this.dimensiones = dimensiones
    this.materiales = materiales
    this.parametrosManoObra = parametrosManoObra
    this.configuracionMalla = configuracionMalla
  }

  calcularManoObraFabricacion(): number {
    const parametro = this.parametrosManoObra.find((p) => p.tipo === "fabricacion" && p.activo)
    if (!parametro) return 0

    const area = this.dimensiones.ancho * this.dimensiones.alto
    return area * parametro.tarifa_por_m2
  }

  calcularManoObraInstalacion(): number {
    const parametro = this.parametrosManoObra.find((p) => p.tipo === "instalacion" && p.activo)
    if (!parametro) return 0

    const area = this.dimensiones.ancho * this.dimensiones.alto
    return area * parametro.tarifa_por_m2
  }

  calcularCostoMalla(importesMateriales: { [materialId: string]: number }): {
    material: number
    manoObra: number
    total: number
  } {
    // Calcular costo de material de malla
    let costoMaterial = 0

    for (const materialId of this.configuracionMalla.materiales_que_contribuyen) {
      const importe = importesMateriales[materialId] || 0
      costoMaterial += importe
    }

    // Calcular mano de obra de malla
    let costoManoObra = 0
    if (this.configuracionMalla.incluye_mano_obra && this.configuracionMalla.tarifa_mano_obra_m2) {
      const area = this.dimensiones.ancho * this.dimensiones.alto
      costoManoObra = area * this.configuracionMalla.tarifa_mano_obra_m2
    }

    return {
      material: costoMaterial,
      manoObra: costoManoObra,
      total: costoMaterial + costoManoObra,
    }
  }

  calcularTodosLosCostos(importesMateriales: { [materialId: string]: number }) {
    const manoObraFabricacion = this.calcularManoObraFabricacion()
    const manoObraInstalacion = this.calcularManoObraInstalacion()
    const costoMalla = this.calcularCostoMalla(importesMateriales)

    return {
      manoObraFabricacion,
      manoObraInstalacion,
      malla: costoMalla,
      detalles: {
        area: this.dimensiones.ancho * this.dimensiones.alto,
        parametros_aplicados: this.parametrosManoObra.filter((p) => p.activo),
      },
    }
  }
}
