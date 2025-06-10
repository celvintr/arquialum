export class FormulaCalculator {
  private dimensiones: any
  private cantidadesMateriales: Record<string, number> = {}

  constructor(dimensiones: any, cantidadesMateriales: Record<string, number> = {}) {
    this.dimensiones = dimensiones
    this.cantidadesMateriales = cantidadesMateriales
  }

  // Método para actualizar las cantidades de materiales disponibles
  actualizarCantidadesMateriales(cantidades: Record<string, number>) {
    this.cantidadesMateriales = { ...this.cantidadesMateriales, ...cantidades }
  }

  calcularCantidad(formula: string): number {
    try {
      // Limpiar fórmula
      let formulaLimpia = formula.trim()
      if (formulaLimpia.startsWith("=")) {
        formulaLimpia = formulaLimpia.substring(1)
      }

      // Reemplazar variables de dimensiones
      formulaLimpia = this.reemplazarVariablesDimensiones(formulaLimpia)

      // Reemplazar variables de cantidades de materiales
      formulaLimpia = this.reemplazarVariablesMateriales(formulaLimpia)

      // Transformar funciones de Excel
      formulaLimpia = this.transformarFunciones(formulaLimpia)

      // Evaluar fórmula de forma segura
      const resultado = this.evaluarFormula(formulaLimpia)

      return isNaN(resultado) ? 0 : Math.max(0, resultado)
    } catch (error) {
      console.error("Error calculando cantidad:", error)
      console.error("Fórmula original:", formula)
      console.error("Variables disponibles:", {
        dimensiones: this.dimensiones,
        cantidadesMateriales: this.cantidadesMateriales,
      })
      return 0
    }
  }

  // Modificar el método reemplazarVariablesMateriales para manejar mejor las variables de materiales
  private reemplazarVariablesMateriales(formula: string): string {
    let formulaReemplazada = formula

    // Buscar patrones como "cantidad_mat_vidrio_claro" o cualquier variable que comience con "cantidad_"
    const patronCantidad = /cantidad_([a-zA-Z0-9_]+)/g
    let match

    while ((match = patronCantidad.exec(formula)) !== null) {
      const variableName = match[0] // Nombre completo de la variable (ej: cantidad_mat_vidrio_claro)
      const materialId = match[1] // Parte después de "cantidad_" (ej: mat_vidrio_claro)

      console.log(`🔍 Buscando variable: ${variableName}, material: ${materialId}`)

      // Buscar coincidencia exacta primero
      if (this.cantidadesMateriales[variableName] !== undefined) {
        console.log(
          `✅ Encontrada coincidencia exacta para ${variableName}: ${this.cantidadesMateriales[variableName]}`,
        )
        formulaReemplazada = formulaReemplazada.replace(
          new RegExp(variableName, "g"),
          this.cantidadesMateriales[variableName].toString(),
        )
        continue
      }

      // Buscar por ID de material
      if (this.cantidadesMateriales[materialId] !== undefined) {
        console.log(`✅ Encontrada coincidencia por ID para ${materialId}: ${this.cantidadesMateriales[materialId]}`)
        formulaReemplazada = formulaReemplazada.replace(
          new RegExp(variableName, "g"),
          this.cantidadesMateriales[materialId].toString(),
        )
        continue
      }

      // Buscar por coincidencia parcial en las claves
      let encontrado = false
      for (const [key, cantidad] of Object.entries(this.cantidadesMateriales)) {
        // Verificar si la clave contiene el ID del material o viceversa
        if (key.includes(materialId) || materialId.includes(key)) {
          console.log(`✅ Encontrada coincidencia parcial: ${key} para ${materialId}: ${cantidad}`)
          formulaReemplazada = formulaReemplazada.replace(new RegExp(variableName, "g"), cantidad.toString())
          encontrado = true
          break
        }
      }

      // Si no se encuentra, registrar y usar 0 como valor por defecto
      if (!encontrado) {
        console.warn(
          `⚠️ Variable no encontrada: ${variableName}, usando 0. Cantidades disponibles:`,
          this.cantidadesMateriales,
        )
        formulaReemplazada = formulaReemplazada.replace(new RegExp(variableName, "g"), "0")
      }
    }

    return formulaReemplazada
  }

  private reemplazarVariablesDimensiones(formula: string): string {
    const { ancho, alto, divisionHorizontal, divisionVertical, decoradoHorizontal, decoradoVertical } = this.dimensiones

    return formula
      .replace(/\bancho\b/g, ancho.toString())
      .replace(/\balto\b/g, alto.toString())
      .replace(/\bdivisionHorizontal\b/g, divisionHorizontal.toString())
      .replace(/\bdivisionVertical\b/g, divisionVertical.toString())
      .replace(/\bdecoradoHorizontal\b/g, decoradoHorizontal.toString())
      .replace(/\bdecoradoVertical\b/g, decoradoVertical.toString())
  }

  private transformarFunciones(formula: string): string {
    // REDONDEAR.MENOS -> Math.floor
    formula = formula.replace(/REDONDEAR\.MENOS\s*$$\s*([^,)]+)\s*(?:,\s*[^)]+)?\s*$$/g, "Math.floor($1)")

    // ROUNDUP -> Math.ceil con precisión
    formula = formula.replace(/ROUNDUP\s*$$\s*([^,]+)\s*,\s*(\d+)\s*$$/g, (match, num, precision) => {
      if (precision === "0") {
        return `Math.ceil(${num})`
      }
      const multiplier = Math.pow(10, Number.parseInt(precision))
      return `Math.ceil(${num} * ${multiplier}) / ${multiplier}`
    })

    // SI -> operador ternario
    formula = formula.replace(/SI\s*$$\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*$$/g, "($1) ? ($2) : ($3)")

    // Operadores lógicos
    formula = formula.replace(/\s+Y\s+/g, " && ")
    formula = formula.replace(/\s+O\s+/g, " || ")

    return formula
  }

  private evaluarFormula(formula: string): number {
    try {
      // Crear función segura para evaluar
      const func = new Function(
        "Math",
        `
        "use strict";
        return ${formula};
      `,
      )

      return func(Math)
    } catch (error) {
      console.error("Error evaluando fórmula:", formula, error)
      return 0
    }
  }

  calcularRendimiento(materialCalculado: number, areaLongitud: number): number {
    if (areaLongitud === 0) return 0

    // Rendimiento = Material calculado ÷ área_longitud del material
    const rendimiento = materialCalculado / areaLongitud

    // Redondear a 4 decimales para precisión
    return Math.round(rendimiento * 10000) / 10000
  }

  calcularManoObra(ancho: number, alto: number, tipoProducto: number, tipo: string): number {
    const area = ancho * alto

    switch (tipo) {
      case "fabricacion":
        if (tipoProducto === 10) return 0 // Tipo especial sin mano de obra
        return area * 400 // 400 lempiras por m²

      case "instalacion":
        if (tipoProducto === 10) return 0
        return area * 200 // 200 lempiras por m²

      case "malla":
        // Solo ciertos tipos llevan malla
        if ([3, 6, 10].includes(tipoProducto)) return 0
        return area * 0.25 * 400 // 25% del área * 400 lempiras

      default:
        return 0
    }
  }

  // Método para calcular materiales con dependencias
  calcularConDependencias(materialesProducto: any[], dimensiones: any): any[] {
    console.log("🔗 Calculando materiales con dependencias...")

    // Separar materiales independientes y dependientes
    const independientes = materialesProducto.filter((mp) => !mp.es_dependiente)
    const dependientes = materialesProducto.filter((mp) => mp.es_dependiente)

    const resultados: any[] = []
    const cantidadesMateriales: { [key: string]: number } = {}

    // 1. Calcular materiales independientes primero
    for (const materialProducto of independientes) {
      const cantidad = this.calcularCantidad(materialProducto.formula || "1")
      cantidadesMateriales[materialProducto.material_id] = cantidad

      resultados.push({
        ...materialProducto,
        cantidad_calculada: cantidad,
        es_dependiente: false,
      })

      console.log(`✅ Material independiente: ${materialProducto.material_id} = ${cantidad}`)
    }

    // Actualizar las cantidades disponibles para dependencias
    this.actualizarCantidadesMateriales(cantidadesMateriales)

    // 2. Calcular materiales dependientes
    for (const materialProducto of dependientes) {
      const materialDependenciaId = materialProducto.material_dependencia
      const multiplicador = Number.parseFloat(materialProducto.multiplicador || "1")

      if (materialDependenciaId && cantidadesMateriales[materialDependenciaId] !== undefined) {
        const cantidadBase = cantidadesMateriales[materialDependenciaId]
        const cantidadFinal = cantidadBase * multiplicador

        cantidadesMateriales[materialProducto.material_id] = cantidadFinal

        resultados.push({
          ...materialProducto,
          cantidad_calculada: cantidadFinal,
          cantidad_base: cantidadBase,
          multiplicador_aplicado: multiplicador,
          es_dependiente: true,
        })

        console.log(
          `🔗 Material dependiente: ${materialProducto.material_id} = ${cantidadBase} × ${multiplicador} = ${cantidadFinal}`,
        )
      } else {
        console.warn(`⚠️ No se pudo calcular material dependiente: ${materialProducto.material_id}`)

        resultados.push({
          ...materialProducto,
          cantidad_calculada: 0,
          es_dependiente: true,
          error: "Material dependencia no encontrado",
        })
      }
    }

    return resultados
  }
}

// Función para calcular totales de cotización
export function calcularTotalCotizacion(items: any[]) {
  const subtotal = items.reduce((total, item) => total + (item.precio_total || 0), 0)
  const iva = subtotal * 0.16 // 16% IVA
  const total = subtotal + iva

  return {
    subtotal,
    iva,
    total,
    cantidad_items: items.length,
  }
}

// Función para generar número de cotización
export function generarNumeroCotizacion(): string {
  const fecha = new Date()
  const año = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, "0")
  const dia = String(fecha.getDate()).padStart(2, "0")
  const timestamp = Date.now().toString().slice(-4) // Últimos 4 dígitos del timestamp

  return `COT-${año}${mes}${dia}-${timestamp}`
}
