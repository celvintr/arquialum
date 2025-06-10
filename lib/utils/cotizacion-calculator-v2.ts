export interface ParametrosCotizacion {
  fabricacion_pvc: { activo: boolean; tarifa: number }
  fabricacion_aluminio: { activo: boolean; tarifa: number }
  instalacion_pvc: { activo: boolean; tarifa: number }
  instalacion_aluminio: { activo: boolean; tarifa: number }
  malla: {
    activo: boolean
    materiales_contribuyen: string[]
    incluye_mano_obra: boolean
    tarifa_mano_obra: number
  }
}

export class CotizacionCalculatorV2 {
  private dimensiones: any
  private tipoProducto: "pvc" | "aluminio"
  private parametros: ParametrosCotizacion
  private materialesCalculados: any[]

  constructor(
    dimensiones: any,
    tipoProducto: "pvc" | "aluminio",
    parametros: ParametrosCotizacion,
    materialesCalculados: any[],
  ) {
    this.dimensiones = dimensiones
    this.tipoProducto = tipoProducto
    this.parametros = parametros
    this.materialesCalculados = materialesCalculados
  }

  calcularManoObraFabricacion(): number {
    const config = this.tipoProducto === "pvc" ? this.parametros.fabricacion_pvc : this.parametros.fabricacion_aluminio

    if (!config.activo) return 0

    const area = this.dimensiones.ancho * this.dimensiones.alto
    return area * config.tarifa
  }

  calcularManoObraInstalacion(): number {
    const config = this.tipoProducto === "pvc" ? this.parametros.instalacion_pvc : this.parametros.instalacion_aluminio

    if (!config.activo) return 0

    const area = this.dimensiones.ancho * this.dimensiones.alto
    return area * config.tarifa
  }

  calcularCostoMalla(): {
    material: number
    manoObra: number
    total: number
  } {
    if (!this.parametros.malla.activo) {
      return { material: 0, manoObra: 0, total: 0 }
    }

    // Calcular costo de material de malla
    let costoMaterial = 0
    for (const material of this.materialesCalculados) {
      if (this.parametros.malla.materiales_contribuyen.includes(material.material_id)) {
        costoMaterial += material.importe
      }
    }

    // Calcular mano de obra de malla
    let costoManoObra = 0
    if (this.parametros.malla.incluye_mano_obra) {
      const area = this.dimensiones.ancho * this.dimensiones.alto
      costoManoObra = area * this.parametros.malla.tarifa_mano_obra
    }

    return {
      material: costoMaterial,
      manoObra: costoManoObra,
      total: costoMaterial + costoManoObra,
    }
  }

  calcularTodosLosCostos() {
    const manoObraFabricacion = this.calcularManoObraFabricacion()
    const manoObraInstalacion = this.calcularManoObraInstalacion()
    const costoMalla = this.calcularCostoMalla()

    return {
      manoObraFabricacion,
      manoObraInstalacion,
      malla: costoMalla,
      detalles: {
        area: this.dimensiones.ancho * this.dimensiones.alto,
        tipo_producto: this.tipoProducto,
        parametros_aplicados: this.parametros,
      },
    }
  }
}
