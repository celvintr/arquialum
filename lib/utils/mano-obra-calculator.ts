import { FormulaCalculator } from "./formula-calculator"

export class ManoObraCalculator {
  private configuraciones: any[]
  private dimensiones: any
  private producto: any
  private materiales: any[]
  private importesMateriales: { [materialId: string]: number } = {}

  constructor(configuraciones: any[], dimensiones: any, producto: any, materiales: any[]) {
    this.configuraciones = configuraciones
    this.dimensiones = dimensiones
    this.producto = producto
    this.materiales = materiales
  }

  calcularTodosLosCostos() {
    const resultados = {
      fabricacion: 0,
      instalacion: 0,
      malla: 0,
      otros: 0,
      detalles: [] as any[],
    }

    // Filtrar configuraciones activas
    const configuracionesActivas = this.configuraciones.filter((config) => config.activo)

    for (const config of configuracionesActivas) {
      if (this.aplicaConfiguracion(config)) {
        const costo = this.calcularCostoConfiguracion(config)

        // Agregar al tipo correspondiente
        switch (config.tipo) {
          case "fabricacion":
            resultados.fabricacion += costo
            break
          case "instalacion":
            resultados.instalacion += costo
            break
          case "malla":
            resultados.malla += costo
            break
          default:
            resultados.otros += costo
            break
        }

        resultados.detalles.push({
          configuracion: config.nombre,
          tipo: config.tipo,
          formula: config.formula,
          costo,
          aplicado: true,
        })
      }
    }

    return resultados
  }

  private aplicaConfiguracion(config: any): boolean {
    // Verificar tipo de producto
    if (config.condiciones.tipos_producto.length > 0) {
      if (!config.condiciones.tipos_producto.includes(this.producto.tipo_producto_id)) {
        return false
      }
    }

    // Verificar materiales requeridos
    if (config.condiciones.materiales_requeridos.length > 0) {
      const materialesProducto = this.materiales.map((m) => m.material_id)
      const tieneRequeridos = config.condiciones.materiales_requeridos.every((materialId: string) =>
        materialesProducto.includes(materialId),
      )
      if (!tieneRequeridos) {
        return false
      }
    }

    // Verificar materiales excluidos
    if (config.condiciones.materiales_excluidos.length > 0) {
      const materialesProducto = this.materiales.map((m) => m.material_id)
      const tieneExcluidos = config.condiciones.materiales_excluidos.some((materialId: string) =>
        materialesProducto.includes(materialId),
      )
      if (tieneExcluidos) {
        return false
      }
    }

    return true
  }

  private calcularCostoConfiguracion(config: any): number {
    try {
      const calculator = new FormulaCalculator(this.dimensiones)

      // Preparar variables para la fórmula
      const variables = {
        ...this.dimensiones,
        tarifa_base: config.tarifa_base,
      }

      // Si se aplica por material específico, calcular por cada material
      if (config.aplicacion.por_material && config.aplicacion.materiales_aplicables.length > 0) {
        let costoTotal = 0

        for (const materialId of config.aplicacion.materiales_aplicables) {
          const material = this.materiales.find((m) => m.material_id === materialId)
          if (material) {
            // Calcular cantidad del material
            const cantidadMaterial = calculator.calcularCantidad(material.formula || "ancho * alto")

            // Aplicar fórmula de la configuración con la cantidad del material
            const formulaConMaterial = config.formula.replace(/cantidad_material/g, cantidadMaterial.toString())
            const costoMaterial = this.evaluarFormula(formulaConMaterial, variables)
            costoTotal += costoMaterial
          }
        }

        return costoTotal
      } else {
        // Aplicar por producto completo
        return this.evaluarFormula(config.formula, variables)
      }
    } catch (error) {
      console.error("Error calculando costo de configuración:", config.nombre, error)
      return 0
    }
  }

  private evaluarFormula(formula: string, variables: any): number {
    try {
      // Reemplazar variables en la fórmula
      let formulaEvaluable = formula

      for (const [variable, valor] of Object.entries(variables)) {
        const regex = new RegExp(`\\b${variable}\\b`, "g")
        formulaEvaluable = formulaEvaluable.replace(regex, valor.toString())
      }

      // Crear función segura para evaluar
      const func = new Function(
        "Math",
        `
        "use strict";
        return ${formulaEvaluable};
      `,
      )

      const resultado = func(Math)
      return isNaN(resultado) ? 0 : Math.max(0, resultado)
    } catch (error) {
      console.error("Error evaluando fórmula:", formula, error)
      return 0
    }
  }

  calcularCostoMalla(): number {
    let costoMalla = 0

    // Buscar configuraciones de malla activas
    const configuracionesMalla = this.configuraciones.filter((config) => config.tipo === "malla" && config.activo)

    for (const config of configuracionesMalla) {
      if (this.aplicaConfiguracion(config)) {
        // Si se aplica por material específico
        if (config.aplicacion.por_material && config.aplicacion.materiales_aplicables.length > 0) {
          for (const materialId of config.aplicacion.materiales_aplicables) {
            const importeMaterial = this.importesMateriales[materialId] || 0
            costoMalla += importeMaterial
          }
        } else {
          // Aplicar fórmula general
          costoMalla += this.calcularCostoConfiguracion(config)
        }
      }
    }

    return costoMalla
  }

  setImportesMateriales(importesMateriales: { [materialId: string]: number }) {
    this.importesMateriales = importesMateriales
  }
}
