"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Calculator,
  Package,
  Ruler,
  Settings,
  ChevronDown,
  ChevronUp,
  Wrench,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { FormulaCalculator } from "@/lib/utils/formula-calculator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CotizacionCalculatorV2, type ParametrosCotizacion } from "@/lib/utils/cotizacion-calculator-v2"

interface CotizarProductoModalProps {
  isOpen: boolean
  onClose: () => void
  producto: any
  onAgregarCotizacion: (cotizacion: any) => void
}

export default function CotizarProductoModal({
  isOpen,
  onClose,
  producto,
  onAgregarCotizacion,
}: CotizarProductoModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

  // Dimensiones del producto
  const [dimensiones, setDimensiones] = useState({
    ancho: 1.5,
    alto: 1.2,
    divisionHorizontal: 0,
    divisionVertical: 0,
    decoradoHorizontal: 0,
    decoradoVertical: 0,
  })

  // Campos activos basados en fórmulas detectadas
  const [camposActivos, setCamposActivos] = useState({
    division: false,
    decorado: false,
  })

  // Proveedores disponibles para este producto
  const [proveedoresDisponibles, setProveedoresDisponibles] = useState<any[]>([])
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("")

  // Proveedores específicos para vidrio
  const [proveedoresVidrio, setProveedoresVidrio] = useState<any[]>([])
  const [proveedorVidrioSeleccionado, setProveedorVidrioSeleccionado] = useState("")

  // Variantes disponibles
  const [variantes, setVariantes] = useState({
    coloresPVC: [],
    coloresAluminio: [],
    tiposVidrio: [],
  })

  // Selecciones del usuario
  const [selecciones, setSelecciones] = useState({
    colorPVC: "",
    colorAluminio: "",
    tipoVidrio: "",
  })

  // Configuración
  const [margenGanancia, setMargenGanancia] = useState(30)
  const [cantidad, setCantidad] = useState(1)

  // Resultados del cálculo
  const [resultado, setResultado] = useState<any>(null)
  const [detallesMateriales, setDetallesMateriales] = useState<any[]>([])
  const [mostrarDetalles, setMostrarDetalles] = useState(false)

  // Materiales del producto
  const [materialesProducto, setMaterialesProducto] = useState<any[]>([])
  const [materialVidrio, setMaterialVidrio] = useState<any>(null)

  // Parámetros de mano de obra configurables
  const [parametrosManoObra, setParametrosManoObra] = useState<ParametrosCotizacion>({
    fabricacion_pvc: { activo: true, tarifa: 400 },
    fabricacion_aluminio: { activo: true, tarifa: 450 },
    instalacion_pvc: { activo: true, tarifa: 200 },
    instalacion_aluminio: { activo: true, tarifa: 250 },
    malla: {
      activo: true,
      materiales_contribuyen: [],
      incluye_mano_obra: false,
      tarifa_mano_obra: 0,
    },
  })

  // Materiales disponibles para malla
  const [materialesDisponibles, setMaterialesDisponibles] = useState<any[]>([])

  useEffect(() => {
    if (isOpen && producto) {
      console.log("🔄 Iniciando cotización para producto:", producto.nombre)
      cargarDatosIniciales()
    }
  }, [isOpen, producto])

  useEffect(() => {
    if (producto && proveedorSeleccionado) {
      calcularCotizacion()
    }
  }, [
    dimensiones,
    selecciones,
    margenGanancia,
    cantidad,
    proveedorSeleccionado,
    proveedorVidrioSeleccionado,
    parametrosManoObra,
  ])

  const cargarDatosIniciales = async () => {
    if (!producto) {
      console.log("⚠️ No hay producto para cargar datos")
      return
    }

    try {
      setLoadingData(true)
      console.log("📡 Cargando datos iniciales para cotización...")

      // Cargar materiales del producto y detectar campos necesarios
      await cargarMaterialesProducto()

      // Cargar proveedores que tengan materiales de este producto
      await cargarProveedoresDisponibles()

      // Cargar variantes disponibles
      await cargarVariantes()

      // Cargar parámetros de configuración
      await cargarParametrosConfiguracion()

      // Cargar materiales disponibles
      await cargarMaterialesDisponibles()

      console.log("✅ Datos iniciales cargados exitosamente")
    } catch (error) {
      console.error("❌ Error cargando datos iniciales:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos necesarios",
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }

  const cargarMaterialesProducto = async () => {
    try {
      console.log("📦 Cargando materiales del producto...")
      const response = await fetch(`/api/productos/${producto._id}/materiales`)
      const data = await response.json()

      if (data.success && data.materiales) {
        console.log("✅ Materiales del producto cargados:", data.materiales.length)

        // Identificar materiales dependientes e independientes
        const materialesConDependencias = data.materiales.map((material) => ({
          ...material,
          es_dependiente: !!material.material_dependencia,
          multiplicador: material.multiplicador || 1,
        }))

        setMaterialesProducto(materialesConDependencias)
        console.log("🔗 Materiales con dependencias:", materialesConDependencias)

        // Detectar campos necesarios basados en fórmulas
        detectarCamposNecesarios(materialesConDependencias)

        // Identificar material de vidrio
        await identificarMaterialVidrio(materialesConDependencias)
      }
    } catch (error) {
      console.error("❌ Error cargando materiales del producto:", error)
    }
  }

  const identificarMaterialVidrio = async (materiales: any[]) => {
    try {
      // Buscar material de tipo vidrio
      for (const materialProducto of materiales) {
        const materialResponse = await fetch(`/api/materiales/${materialProducto.material_id}`)
        const materialData = await materialResponse.json()

        if (materialData.success && materialData.material) {
          const material = materialData.material

          // Verificar si es vidrio por categoría o nombre
          if (
            material.categoria?.toLowerCase().includes("vidrio") ||
            material.nombre?.toLowerCase().includes("vidrio")
          ) {
            console.log("🔍 Material de vidrio encontrado:", material.nombre)
            setMaterialVidrio(material)

            // Cargar proveedores específicos para vidrio
            if (material.proveedores && material.proveedores.length > 0) {
              setProveedoresVidrio(material.proveedores)

              // Seleccionar el primer proveedor por defecto
              if (material.proveedores.length > 0) {
                setProveedorVidrioSeleccionado(material.proveedores[0].proveedor_id)
              }
            }

            break
          }
        }
      }
    } catch (error) {
      console.error("❌ Error identificando material de vidrio:", error)
    }
  }

  const detectarCamposNecesarios = (materiales: any[]) => {
    console.log("🔍 Detectando campos necesarios basados en fórmulas...")

    let tieneDecoracion = false
    let tieneDivision = false

    materiales.forEach((materialProducto: any) => {
      const formula = materialProducto.formula || ""

      if (formula.includes("decoradoHorizontal") || formula.includes("decoradoVertical")) {
        tieneDecoracion = true
        console.log("🎨 Detectado: campos de decorado necesarios")
      }

      if (formula.includes("divisionHorizontal") || formula.includes("divisionVertical")) {
        tieneDivision = true
        console.log("📐 Detectado: campos de división necesarios")
      }
    })

    setCamposActivos({
      decorado: tieneDecoracion,
      division: tieneDivision,
    })

    console.log("✅ Campos activos configurados:", { decorado: tieneDecoracion, division: tieneDivision })
  }

  const cargarProveedoresDisponibles = async () => {
    try {
      console.log("🏢 Cargando proveedores que tengan materiales de este producto...")

      // Obtener todos los proveedores
      const provResponse = await fetch("/api/proveedores")
      const provData = await provResponse.json()

      if (!provData.success) {
        throw new Error("Error cargando proveedores")
      }

      // Obtener materiales del producto
      const matResponse = await fetch(`/api/productos/${producto._id}/materiales`)
      const matData = await matResponse.json()

      if (!matData.success) {
        throw new Error("Error cargando materiales del producto")
      }

      // Filtrar proveedores que tengan al menos un material de este producto
      // (excluyendo materiales de vidrio que se manejan por separado)
      const materialesProducto = matData.materiales || []
      const materialIds = materialesProducto.map((m: any) => m.material_id)

      console.log("📋 Material IDs del producto:", materialIds)

      const proveedoresFiltrados = []

      for (const proveedor of provData.proveedores) {
        // Verificar si este proveedor tiene materiales del producto
        let tieneMateriales = false

        for (const materialId of materialIds) {
          const materialResponse = await fetch(`/api/materiales/${materialId}`)
          const materialData = await materialResponse.json()

          if (materialData.success && materialData.material) {
            // Verificar si es material de vidrio
            const esVidrio =
              materialData.material.categoria?.toLowerCase().includes("vidrio") ||
              materialData.material.nombre?.toLowerCase().includes("vidrio")

            // Si no es vidrio, verificar si el proveedor tiene este material
            if (!esVidrio && materialData.material.proveedores) {
              const tieneProveedor = materialData.material.proveedores.some(
                (p: any) => p.proveedor_id === proveedor._id,
              )
              if (tieneProveedor) {
                tieneMateriales = true
                break
              }
            }
          }
        }

        if (tieneMateriales) {
          proveedoresFiltrados.push(proveedor)
        }
      }

      console.log("✅ Proveedores disponibles:", proveedoresFiltrados.length)
      setProveedoresDisponibles(proveedoresFiltrados)

      // Seleccionar el primer proveedor automáticamente
      if (proveedoresFiltrados.length > 0) {
        setProveedorSeleccionado(proveedoresFiltrados[0]._id)
      }
    } catch (error) {
      console.error("❌ Error cargando proveedores disponibles:", error)
    }
  }

  const cargarVariantes = async () => {
    try {
      console.log("🎨 Cargando variantes disponibles...")
      const response = await fetch("/api/variantes/tipos")
      const data = await response.json()

      if (data.success) {
        setVariantes({
          coloresPVC: data.coloresPVC || [],
          coloresAluminio: data.coloresAluminio || [],
          tiposVidrio: data.tiposVidrio || [],
        })
        console.log("✅ Variantes cargadas exitosamente")
      }
    } catch (error) {
      console.error("❌ Error cargando variantes:", error)
    }
  }

  const cargarParametrosConfiguracion = async () => {
    try {
      console.log("⚙️ Cargando parámetros de configuración...")

      const response = await fetch("/api/configuracion/parametros-v2")
      const data = await response.json()

      if (data.success && data.configuraciones) {
        const parametros: ParametrosCotizacion = {
          fabricacion_pvc: { activo: true, tarifa: 400 },
          fabricacion_aluminio: { activo: true, tarifa: 450 },
          instalacion_pvc: { activo: true, tarifa: 200 },
          instalacion_aluminio: { activo: true, tarifa: 250 },
          malla: {
            activo: true,
            materiales_contribuyen: [],
            incluye_mano_obra: false,
            tarifa_mano_obra: 0,
          },
        }

        // Procesar configuraciones
        data.configuraciones.forEach((config: any) => {
          if (config.tipo === "fabricacion" && config.configuraciones_tipo) {
            parametros.fabricacion_pvc = config.configuraciones_tipo.pvc
            parametros.fabricacion_aluminio = config.configuraciones_tipo.aluminio
          } else if (config.tipo === "instalacion" && config.configuraciones_tipo) {
            parametros.instalacion_pvc = config.configuraciones_tipo.pvc
            parametros.instalacion_aluminio = config.configuraciones_tipo.aluminio
          } else if (config.tipo === "malla" && config.configuracion_malla) {
            parametros.malla = {
              activo: config.configuracion_malla.activo || true,
              materiales_contribuyen: config.configuracion_malla.materiales_que_contribuyen || [],
              incluye_mano_obra: config.configuracion_malla.incluye_mano_obra || false,
              tarifa_mano_obra: config.configuracion_malla.tarifa_mano_obra_m2 || 0,
            }
          }
        })

        setParametrosManoObra(parametros)
        console.log("✅ Parámetros de configuración cargados:", parametros)
      }
    } catch (error) {
      console.error("❌ Error cargando parámetros de configuración:", error)
    }
  }

  const cargarMaterialesDisponibles = async () => {
    try {
      const response = await fetch("/api/materiales")
      const data = await response.json()

      if (data.success) {
        setMaterialesDisponibles(data.materiales || [])
      }
    } catch (error) {
      console.error("❌ Error cargando materiales disponibles:", error)
    }
  }

  const determinarTipoProducto = (): "pvc" | "aluminio" => {
    // Validar que el producto existe
    if (!producto) {
      return "pvc" // Por defecto PVC
    }

    // Determinar si es PVC o Aluminio basado en el tipo de producto
    const tipoProducto = producto.tipo_producto_id || ""
    const nombreProducto = producto.nombre?.toLowerCase() || ""
    const categoriaProducto = producto.categoria?.toLowerCase() || ""

    // Lógica para determinar el tipo basado en el ID, nombre o categoría
    if (tipoProducto.includes("pvc") || categoriaProducto.includes("pvc") || nombreProducto.includes("pvc")) {
      return "pvc"
    } else if (
      tipoProducto.includes("aluminio") ||
      categoriaProducto.includes("aluminio") ||
      nombreProducto.includes("aluminio")
    ) {
      return "aluminio"
    }

    return "pvc" // Por defecto PVC
  }

  // Método mejorado para calcular cotización con manejo de dependencias
  const calcularCotizacion = async () => {
    if (!producto || !proveedorSeleccionado) {
      console.log("⚠️ Faltan datos para calcular: producto o proveedor no seleccionado")
      return
    }

    try {
      setLoading(true)
      console.log("💰 Iniciando cálculo de cotización...")

      // Obtener materiales del producto con fórmulas
      const matResponse = await fetch(`/api/productos/${producto._id}/materiales`)
      const matData = await matResponse.json()

      if (!matData.success) {
        throw new Error("Error obteniendo materiales del producto")
      }

      let totalMateriales = 0
      const detalles: any[] = []

      // Separar materiales independientes y dependientes
      const materialesIndependientes = matData.materiales.filter((m: any) => !m.material_dependencia)
      const materialesDependientes = matData.materiales.filter((m: any) => !!m.material_dependencia)

      console.log("🧩 Materiales independientes:", materialesIndependientes.length)
      console.log("🔗 Materiales dependientes:", materialesDependientes.length)

      // Almacenar cantidades calculadas para usar en dependencias
      const cantidadesCalculadas: Record<string, number> = {}

      // Crear calculadora con dimensiones
      const calculator = new FormulaCalculator(dimensiones, cantidadesCalculadas)

      // 1. Primero calcular materiales independientes
      for (const materialProducto of materialesIndependientes) {
        const materialResponse = await fetch(`/api/materiales/${materialProducto.material_id}`)
        const materialData = await materialResponse.json()

        if (!materialData.success) continue

        const material = materialData.material
        const formula = materialProducto.formula || "ancho * alto"

        // 1. MATERIAL: Calcular cantidad según fórmula
        const materialCalculado = calculator.calcularCantidad(formula)

        // Guardar cantidad calculada para usar en dependencias
        // Guardar con múltiples claves para facilitar la búsqueda
        cantidadesCalculadas[materialProducto.material_id] = materialCalculado
        cantidadesCalculadas[`cantidad_${materialProducto.material_id}`] = materialCalculado

        // También guardar usando el nombre del material para mayor compatibilidad
        const nombreMaterial = material.nombre?.toLowerCase().replace(/\s+/g, "_") || ""
        if (nombreMaterial) {
          cantidadesCalculadas[nombreMaterial] = materialCalculado
          cantidadesCalculadas[`cantidad_${nombreMaterial}`] = materialCalculado

          // Si el nombre contiene "mat_", también guardar sin ese prefijo
          if (nombreMaterial.includes("mat_")) {
            const nombreSinMat = nombreMaterial.replace("mat_", "")
            cantidadesCalculadas[nombreSinMat] = materialCalculado
            cantidadesCalculadas[`cantidad_${nombreSinMat}`] = materialCalculado
          }
        }

        // Actualizar el calculador con las nuevas cantidades
        calculator.actualizarCantidadesMateriales(cantidadesCalculadas)

        console.log(
          `✅ Material calculado: ${material.nombre} (${materialProducto.material_id}) = ${materialCalculado}`,
        )
        console.log(`🔢 Cantidades disponibles:`, cantidadesCalculadas)

        // Resto del código para calcular rendimiento, precios, etc.
        // ...

        // 2. RENDIMIENTO: Material calculado ÷ área/longitud del material
        const areaLongitudMaterial = material.area_longitud || 1
        const rendimiento = materialCalculado / areaLongitudMaterial

        // Verificar si es material de vidrio
        const esVidrio =
          material.categoria?.toLowerCase().includes("vidrio") || material.nombre?.toLowerCase().includes("vidrio")

        // 3. PRECIO UNITARIO: Obtener precio del proveedor seleccionado
        let precioBase = 0
        let precioVariante = 0
        let nombreProveedor = "Sin proveedor"
        let tieneVariantes = false

        // Usar el proveedor específico para vidrio o el proveedor general para otros materiales
        const proveedorId = esVidrio ? proveedorVidrioSeleccionado : proveedorSeleccionado
        const proveedorMaterial = material.proveedores?.find((p: any) => p.proveedor_id === proveedorId)

        if (proveedorMaterial) {
          precioBase = proveedorMaterial.precio_unitario || 0
          nombreProveedor = proveedorMaterial.proveedor_nombre || "Proveedor sin nombre"

          // Verificar si el material tiene variantes
          tieneVariantes = proveedorMaterial.variantes_precios && proveedorMaterial.variantes_precios.length > 0

          if (tieneVariantes) {
            // Calcular precio de variante según el tipo de producto
            const tipoProducto = determinarTipoProducto()

            if (esVidrio && selecciones.tipoVidrio) {
              // Para vidrio, usar el tipo de vidrio seleccionado
              const vidrioVariante = proveedorMaterial.variantes_precios.find(
                (v: any) => v.variante_id === selecciones.tipoVidrio,
              )
              if (vidrioVariante) {
                precioVariante = vidrioVariante.precio_adicional || 0
              }
            } else if (tipoProducto === "pvc" && selecciones.colorPVC) {
              // Para PVC, usar el color PVC seleccionado
              const variantePrecio = proveedorMaterial.variantes_precios.find(
                (v: any) => v.variante_id === selecciones.colorPVC,
              )
              if (variantePrecio) {
                precioVariante = variantePrecio.precio_adicional || 0
              }
            } else if (tipoProducto === "aluminio" && selecciones.colorAluminio) {
              // Para aluminio, usar el color aluminio seleccionado
              const variantePrecio = proveedorMaterial.variantes_precios.find(
                (v: any) => v.variante_id === selecciones.colorAluminio,
              )
              if (variantePrecio) {
                precioVariante = variantePrecio.precio_adicional || 0
              }
            }
          }
        }

        // PRECIO UNITARIO FINAL = precio base + precio variante
        const precioUnitario = precioBase + precioVariante

        // 4. IMPORTE: Precio unitario × rendimiento
        const importe = precioUnitario * rendimiento

        totalMateriales += importe

        detalles.push({
          material_id: material._id,
          nombre: material.nombre,
          proveedor: nombreProveedor,
          es_vidrio: esVidrio,
          tiene_variantes: tieneVariantes,
          es_dependiente: false,
          // Información del cálculo paso a paso
          formula: formula,
          material_calculado: materialCalculado, // Resultado de la fórmula
          area_longitud_material: areaLongitudMaterial, // Área/longitud del material
          rendimiento: rendimiento, // Material calculado ÷ área/longitud
          precio_base: precioBase,
          precio_variante: precioVariante,
          precio_unitario: precioUnitario, // Precio base + variante
          importe: importe, // Precio unitario × rendimiento
          unidad_medida: material.unidad_medida,
          unidad_medida_produccion: material.unidad_medida_produccion,
          // Información adicional para debugging
          calculo_detalle: {
            formula_aplicada: `${formula} = ${materialCalculado.toFixed(4)}`,
            rendimiento_calculo: `${materialCalculado.toFixed(4)} ÷ ${areaLongitudMaterial} = ${rendimiento.toFixed(4)}`,
            precio_calculo: tieneVariantes
              ? `${precioBase} + ${precioVariante} = ${precioUnitario}`
              : `${precioBase} (sin variantes)`,
            importe_calculo: `${precioUnitario} × ${rendimiento.toFixed(4)} = ${importe.toFixed(2)}`,
          },
        })
      }

      // 2. Ahora calcular materiales dependientes
      for (const materialProducto of materialesDependientes) {
        const materialResponse = await fetch(`/api/materiales/${materialProducto.material_id}`)
        const materialData = await materialResponse.json()

        if (!materialData.success) continue

        const material = materialData.material

        // Obtener cantidad del material del que depende
        const materialDependenciaId = materialProducto.material_dependencia

        // Buscar la cantidad del material del que depende
        let cantidadBase = 0

        // Intentar diferentes formas de encontrar el material dependencia
        if (cantidadesCalculadas[materialDependenciaId] !== undefined) {
          cantidadBase = cantidadesCalculadas[materialDependenciaId]
        } else if (cantidadesCalculadas[`cantidad_${materialDependenciaId}`] !== undefined) {
          cantidadBase = cantidadesCalculadas[`cantidad_${materialDependenciaId}`]
        } else {
          // Buscar por coincidencia parcial
          for (const [key, valor] of Object.entries(cantidadesCalculadas)) {
            if (key.includes(materialDependenciaId) || materialDependenciaId.includes(key)) {
              cantidadBase = valor
              break
            }
          }
        }

        // Si aún no se encuentra, intentar usar la fórmula directamente
        if (cantidadBase === 0 && materialProducto.formula) {
          console.log(`⚠️ No se encontró cantidad base para ${material.nombre}, intentando usar fórmula directamente`)
          cantidadBase = calculator.calcularCantidad(materialProducto.formula)
        }

        // Aplicar multiplicador
        const multiplicador = Number.parseFloat(materialProducto.multiplicador) || 1
        const materialCalculado = cantidadBase * multiplicador

        console.log(
          `🔗 Calculando material dependiente: ${material.nombre} = ${cantidadBase} × ${multiplicador} = ${materialCalculado}`,
        )

        // Guardar cantidad calculada por si otro material depende de este
        cantidadesCalculadas[materialProducto.material_id] = materialCalculado
        cantidadesCalculadas[`cantidad_${materialProducto.material_id}`] = materialCalculado

        // También guardar usando el nombre del material
        const nombreMaterial = material.nombre?.toLowerCase().replace(/\s+/g, "_") || ""
        if (nombreMaterial) {
          cantidadesCalculadas[nombreMaterial] = materialCalculado
          cantidadesCalculadas[`cantidad_${nombreMaterial}`] = materialCalculado
        }

        // Actualizar el calculador con las nuevas cantidades
        calculator.actualizarCantidadesMateriales(cantidadesCalculadas)

        // Resto del código para calcular rendimiento, precios, etc.
        // ...

        // RENDIMIENTO: Material calculado ÷ área/longitud del material
        const areaLongitudMaterial = material.area_longitud || 1
        const rendimiento = materialCalculado / areaLongitudMaterial

        // Verificar si es material de vidrio
        const esVidrio =
          material.categoria?.toLowerCase().includes("vidrio") || material.nombre?.toLowerCase().includes("vidrio")

        // PRECIO UNITARIO: Obtener precio del proveedor seleccionado
        let precioBase = 0
        let precioVariante = 0
        let nombreProveedor = "Sin proveedor"
        let tieneVariantes = false

        // Usar el proveedor específico para vidrio o el proveedor general para otros materiales
        const proveedorId = esVidrio ? proveedorVidrioSeleccionado : proveedorSeleccionado
        const proveedorMaterial = material.proveedores?.find((p: any) => p.proveedor_id === proveedorId)

        if (proveedorMaterial) {
          precioBase = proveedorMaterial.precio_unitario || 0
          nombreProveedor = proveedorMaterial.proveedor_nombre || "Proveedor sin nombre"

          // Verificar si el material tiene variantes
          tieneVariantes = proveedorMaterial.variantes_precios && proveedorMaterial.variantes_precios.length > 0

          if (tieneVariantes) {
            // Calcular precio de variante según el tipo de producto
            const tipoProducto = determinarTipoProducto()

            if (esVidrio && selecciones.tipoVidrio) {
              // Para vidrio, usar el tipo de vidrio seleccionado
              const vidrioVariante = proveedorMaterial.variantes_precios.find(
                (v: any) => v.variante_id === selecciones.tipoVidrio,
              )
              if (vidrioVariante) {
                precioVariante = vidrioVariante.precio_adicional || 0
              }
            } else if (tipoProducto === "pvc" && selecciones.colorPVC) {
              // Para PVC, usar el color PVC seleccionado
              const variantePrecio = proveedorMaterial.variantes_precios.find(
                (v: any) => v.variante_id === selecciones.colorPVC,
              )
              if (variantePrecio) {
                precioVariante = variantePrecio.precio_adicional || 0
              }
            } else if (tipoProducto === "aluminio" && selecciones.colorAluminio) {
              // Para aluminio, usar el color aluminio seleccionado
              const variantePrecio = proveedorMaterial.variantes_precios.find(
                (v: any) => v.variante_id === selecciones.colorAluminio,
              )
              if (variantePrecio) {
                precioVariante = variantePrecio.precio_adicional || 0
              }
            }
          }
        }

        // PRECIO UNITARIO FINAL = precio base + precio variante
        const precioUnitario = precioBase + precioVariante

        // IMPORTE: Precio unitario × rendimiento
        const importe = precioUnitario * rendimiento

        totalMateriales += importe

        // Buscar el nombre del material del que depende
        const materialDependencia = detalles.find((d) => d.material_id === materialDependenciaId)
        const nombreDependencia = materialDependencia ? materialDependencia.nombre : "Desconocido"

        detalles.push({
          material_id: material._id,
          nombre: material.nombre,
          proveedor: nombreProveedor,
          es_vidrio: esVidrio,
          tiene_variantes: tieneVariantes,
          es_dependiente: true,
          material_dependencia_id: materialDependenciaId,
          material_dependencia_nombre: nombreDependencia,
          multiplicador: multiplicador,
          // Información del cálculo paso a paso
          material_calculado: materialCalculado, // Cantidad base × multiplicador
          cantidad_base: cantidadBase, // Cantidad del material del que depende
          area_longitud_material: areaLongitudMaterial, // Área/longitud del material
          rendimiento: rendimiento, // Material calculado ÷ área/longitud
          precio_base: precioBase,
          precio_variante: precioVariante,
          precio_unitario: precioUnitario, // Precio base + variante
          importe: importe, // Precio unitario × rendimiento
          unidad_medida: material.unidad_medida,
          unidad_medida_produccion: material.unidad_medida_produccion,
          // Información adicional para debugging
          calculo_detalle: {
            dependencia_calculo: `${cantidadBase.toFixed(4)} × ${multiplicador} = ${materialCalculado.toFixed(4)}`,
            rendimiento_calculo: `${materialCalculado.toFixed(4)} ÷ ${areaLongitudMaterial} = ${rendimiento.toFixed(4)}`,
            precio_calculo: tieneVariantes
              ? `${precioBase} + ${precioVariante} = ${precioUnitario}`
              : `${precioBase} (sin variantes)`,
            importe_calculo: `${precioUnitario} × ${rendimiento.toFixed(4)} = ${importe.toFixed(2)}`,
          },
        })
      }

      // Resto del código para calcular mano de obra, totales, etc.
      // ...

      // Calcular mano de obra usando el nuevo sistema
      const tipoProducto = determinarTipoProducto()
      const calculator2 = new CotizacionCalculatorV2(dimensiones, tipoProducto, parametrosManoObra, detalles)

      const costosManoObra = calculator2.calcularTodosLosCostos()
      const manoObraFabricacion = costosManoObra.manoObraFabricacion
      const manoObraInstalacion = costosManoObra.manoObraInstalacion
      const manoObraMalla = costosManoObra.malla.total

      console.log("💼 Costos calculados:", costosManoObra)

      // Calcular totales
      const subtotal = totalMateriales + manoObraFabricacion + manoObraInstalacion + manoObraMalla
      const gananciaNeta = subtotal * (margenGanancia / 100)
      const total = (subtotal + gananciaNeta) * cantidad

      const resultadoCalculado = {
        materiales: detalles,
        costos: {
          totalMateriales,
          manoObraFabricacion,
          manoObraInstalacion,
          manoObraMalla,
          subtotal,
          gananciaNeta,
          total,
        },
        dimensiones,
        selecciones,
        cantidad,
        margenGanancia,
        costosManoObraDetalle: costosManoObra.detalles,
        proveedor: proveedoresDisponibles.find((p) => p._id === proveedorSeleccionado),
        proveedorVidrio: proveedoresVidrio.find((p) => p.proveedor_id === proveedorVidrioSeleccionado),
      }

      setResultado(resultadoCalculado)
      setDetallesMateriales(detalles)

      console.log("✅ Cotización calculada exitosamente:", resultadoCalculado)
    } catch (error) {
      console.error("❌ Error calculando cotización:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al calcular la cotización",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDimensionChange = (field: string, value: number) => {
    setDimensiones((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSeleccionChange = (tipo: string, value: string) => {
    setSelecciones((prev) => ({
      ...prev,
      [tipo]: value,
    }))
  }

  const handleParametroChange = (parametro: string, campo: string, valor: any) => {
    setParametrosManoObra((prev) => ({
      ...prev,
      [parametro]: {
        ...prev[parametro as keyof ParametrosCotizacion],
        [campo]: valor,
      },
    }))
  }

  const toggleMaterialMalla = (materialId: string) => {
    const materiales = [...parametrosManoObra.malla.materiales_contribuyen]
    const index = materiales.indexOf(materialId)

    if (index > -1) {
      materiales.splice(index, 1)
    } else {
      materiales.push(materialId)
    }

    setParametrosManoObra((prev) => ({
      ...prev,
      malla: {
        ...prev.malla,
        materiales_contribuyen: materiales,
      },
    }))
  }

  const agregarACotizacion = () => {
    if (!resultado) return

    const itemCotizacion = {
      producto_id: producto._id,
      producto_nombre: producto.nombre,
      producto_imagen: producto.imagen,
      dimensiones,
      selecciones,
      cantidad,
      margenGanancia,
      proveedor: resultado.proveedor,
      proveedorVidrio: resultado.proveedorVidrio,
      costos: resultado.costos,
      materiales: resultado.materiales,
      precio_unitario: resultado.costos.total / cantidad,
      precio_total: resultado.costos.total,
      caracteristicas: {
        ColorPVC: selecciones.colorPVC
          ? variantes.coloresPVC.find((c: any) => c._id === selecciones.colorPVC)?.nombre
          : "No aplicable",
        ColorAluminio: selecciones.colorAluminio
          ? variantes.coloresAluminio.find((c: any) => c._id === selecciones.colorAluminio)?.nombre
          : "No aplicable",
        TipoVidrio: selecciones.tipoVidrio
          ? variantes.tiposVidrio.find((v: any) => v._id === selecciones.tipoVidrio)?.nombre
          : "No aplicable",
      },
      parametros_mano_obra: parametrosManoObra,
    }

    console.log("➕ Agregando producto a cotización:", itemCotizacion)

    onAgregarCotizacion(itemCotizacion)
    onClose()
    resetForm()

    toast({
      title: "¡Producto agregado!",
      description: "El producto ha sido agregado a la cotización",
    })
  }

  const resetForm = () => {
    setDimensiones({
      ancho: 1.5,
      alto: 1.2,
      divisionHorizontal: 0,
      divisionVertical: 0,
      decoradoHorizontal: 0,
      decoradoVertical: 0,
    })
    setSelecciones({
      colorPVC: "",
      colorAluminio: "",
      tipoVidrio: "",
    })
    setProveedorSeleccionado("")
    setProveedorVidrioSeleccionado("")
    setMargenGanancia(30)
    setCantidad(1)
    setResultado(null)
    setDetallesMateriales([])
    setMostrarDetalles(false)
    setMaterialVidrio(null)
    setProveedoresVidrio([])
  }

  if (!producto) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p>No se ha seleccionado un producto para cotizar.</p>
              <Button onClick={onClose} className="mt-4">
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const tipoProducto = producto ? determinarTipoProducto() : "pvc"

  if (loadingData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cargando datos...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Cargando datos de cotización...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg -m-6 mb-6">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold">Cotizar Producto</div>
              <div className="text-blue-100 text-sm font-normal">{producto?.nombre}</div>
            </div>
            <div className="ml-auto flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => calcularCotizacion()}
                disabled={loading}
              >
                <Calculator className="w-4 h-4 mr-1" />
                Calcular
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setMostrarDetalles(!mostrarDetalles)}
              >
                {mostrarDetalles ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Detalles
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {/* Panel 1 - Imagen y Info del Producto */}
          <div className="xl:col-span-1 space-y-4">
            {/* Imagen del producto */}
            <Card className="overflow-hidden border-2 border-blue-100">
              <CardContent className="p-0 relative">
                {producto?.imagen ? (
                  <div className="relative">
                    <img
                      src={producto.imagen || "/placeholder.svg"}
                      alt={producto.nombre}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2 left-2 text-white">
                      <div className="text-sm font-medium">{producto.nombre}</div>
                      <div className="text-xs opacity-90">{tipoProducto.toUpperCase()}</div>
                    </div>
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vista previa del área calculada */}
            <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-green-600" />
                  Área Calculada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-700">
                    {(dimensiones.ancho * dimensiones.alto).toFixed(2)} m²
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {dimensiones.ancho}m × {dimensiones.alto}m
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del producto */}
            <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-600" />
                  Información
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Tipo:</span>
                  <Badge variant="secondary" className="text-xs">
                    {tipoProducto.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Materiales:</span>
                  <span className="font-medium">{materialesProducto.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Proveedores:</span>
                  <span className="font-medium">{proveedoresDisponibles.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel 2 - Dimensiones y Configuración */}
          <div className="xl:col-span-1 space-y-4">
            {/* Dimensiones */}
            <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 text-sm">
                  <Ruler className="w-4 h-4" />
                  Dimensiones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="ancho" className="text-xs font-medium text-blue-600">
                      Ancho (m)
                    </Label>
                    <Input
                      id="ancho"
                      type="number"
                      step="0.01"
                      min="0.1"
                      value={dimensiones.ancho}
                      onChange={(e) => handleDimensionChange("ancho", Number.parseFloat(e.target.value) || 0)}
                      className="border-blue-200 focus:border-blue-400 h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="alto" className="text-xs font-medium text-blue-600">
                      Alto (m)
                    </Label>
                    <Input
                      id="alto"
                      type="number"
                      step="0.01"
                      min="0.1"
                      value={dimensiones.alto}
                      onChange={(e) => handleDimensionChange("alto", Number.parseFloat(e.target.value) || 0)}
                      className="border-blue-200 focus:border-blue-400 h-8 text-sm"
                    />
                  </div>
                </div>

                {camposActivos.decorado && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-200">
                    <div className="space-y-1">
                      <Label htmlFor="decH" className="text-xs font-medium text-purple-600">
                        Decorado H
                      </Label>
                      <Input
                        id="decH"
                        type="number"
                        min="0"
                        value={dimensiones.decoradoHorizontal}
                        onChange={(e) =>
                          handleDimensionChange("decoradoHorizontal", Number.parseInt(e.target.value) || 0)
                        }
                        className="border-purple-200 focus:border-purple-400 h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="decV" className="text-xs font-medium text-purple-600">
                        Decorado V
                      </Label>
                      <Input
                        id="decV"
                        type="number"
                        min="0"
                        value={dimensiones.decoradoVertical}
                        onChange={(e) =>
                          handleDimensionChange("decoradoVertical", Number.parseInt(e.target.value) || 0)
                        }
                        className="border-purple-200 focus:border-purple-400 h-8 text-sm"
                      />
                    </div>
                  </div>
                )}

                {camposActivos.division && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-200">
                    <div className="space-y-1">
                      <Label htmlFor="divH" className="text-xs font-medium text-green-600">
                        División H
                      </Label>
                      <Input
                        id="divH"
                        type="number"
                        min="0"
                        value={dimensiones.divisionHorizontal}
                        onChange={(e) =>
                          handleDimensionChange("divisionHorizontal", Number.parseInt(e.target.value) || 0)
                        }
                        className="border-green-200 focus:border-green-400 h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="divV" className="text-xs font-medium text-green-600">
                        División V
                      </Label>
                      <Input
                        id="divV"
                        type="number"
                        min="0"
                        value={dimensiones.divisionVertical}
                        onChange={(e) =>
                          handleDimensionChange("divisionVertical", Number.parseInt(e.target.value) || 0)
                        }
                        className="border-green-200 focus:border-green-400 h-8 text-sm"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Configuración general */}
            <Card className="border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 text-sm">
                  <Settings className="w-4 h-4" />
                  Configuración
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="cantidad" className="text-xs font-medium text-orange-600">
                    Cantidad
                  </Label>
                  <Input
                    id="cantidad"
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(Number.parseInt(e.target.value) || 1)}
                    className="border-orange-200 focus:border-orange-400 h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="margen" className="text-xs font-medium text-orange-600">
                    Margen de ganancia (%)
                  </Label>
                  <Input
                    id="margen"
                    type="number"
                    min="0"
                    max="100"
                    value={margenGanancia}
                    onChange={(e) => setMargenGanancia(Number.parseInt(e.target.value) || 0)}
                    className="border-orange-200 focus:border-orange-400 h-8 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Proveedores */}
            <Card className="border-2 border-gray-100 bg-gradient-to-br from-gray-50 to-slate-50">
              <CardHeader>
                <CardTitle className="text-sm text-gray-700">Proveedor General</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={proveedorSeleccionado} onValueChange={setProveedorSeleccionado}>
                  <SelectTrigger className="border-gray-200 h-8 text-sm">
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedoresDisponibles.map((proveedor) => (
                      <SelectItem key={proveedor._id} value={proveedor._id}>
                        {proveedor.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Proveedor de Vidrio */}
            {materialVidrio && proveedoresVidrio.length > 0 && (
              <Card className="border-2 border-cyan-100 bg-gradient-to-br from-cyan-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="text-sm text-cyan-700">Proveedor de Vidrio</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={proveedorVidrioSeleccionado} onValueChange={setProveedorVidrioSeleccionado}>
                    <SelectTrigger className="border-cyan-200 h-8 text-sm">
                      <SelectValue placeholder="Seleccionar proveedor de vidrio" />
                    </SelectTrigger>
                    <SelectContent>
                      {proveedoresVidrio.map((proveedor) => (
                        <SelectItem key={proveedor.proveedor_id} value={proveedor.proveedor_id}>
                          {proveedor.proveedor_nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Panel 3 - Selecciones y Variantes */}
          <div className="xl:col-span-1 space-y-4">
            {/* Selección de Color PVC */}
            {tipoProducto === "pvc" && variantes.coloresPVC.length > 0 && (
              <Card className="border-2 border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50">
                <CardHeader>
                  <CardTitle className="text-sm text-pink-700 flex items-center gap-2">
                    <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                    Color PVC
                    {selecciones.colorPVC && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {variantes.coloresPVC.map((color: any) => (
                      <button
                        key={color._id}
                        onClick={() => handleSeleccionChange("colorPVC", color._id)}
                        className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                          selecciones.colorPVC === color._id
                            ? "border-pink-500 bg-pink-100 shadow-md scale-105 ring-2 ring-pink-200"
                            : "border-gray-200 hover:border-pink-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="text-center">
                          <div
                            className="w-4 h-4 rounded-full mx-auto mb-1 border border-gray-300"
                            style={{ backgroundColor: color.codigo_hex || "#ccc" }}
                          />
                          <span className="text-xs font-medium">{color.nombre}</span>
                          {selecciones.colorPVC === color._id && (
                            <CheckCircle2 className="w-3 h-3 text-green-600 mx-auto mt-1" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  {!selecciones.colorPVC && (
                    <p className="text-xs text-pink-600 mt-2 text-center">Selecciona un color para continuar</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Selección de Color Aluminio */}
            {tipoProducto === "aluminio" && variantes.coloresAluminio.length > 0 && (
              <Card className="border-2 border-slate-100 bg-gradient-to-br from-slate-50 to-gray-50">
                <CardHeader>
                  <CardTitle className="text-sm text-slate-700 flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                    Color Aluminio
                    {selecciones.colorAluminio && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {variantes.coloresAluminio.map((color: any) => (
                      <button
                        key={color._id}
                        onClick={() => handleSeleccionChange("colorAluminio", color._id)}
                        className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                          selecciones.colorAluminio === color._id
                            ? "border-slate-500 bg-slate-100 shadow-md scale-105 ring-2 ring-slate-200"
                            : "border-gray-200 hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="text-center">
                          <div
                            className="w-4 h-4 rounded-full mx-auto mb-1 border border-gray-300"
                            style={{ backgroundColor: color.codigo_hex || "#ccc" }}
                          />
                          <span className="text-xs font-medium">{color.nombre}</span>
                          {selecciones.colorAluminio === color._id && (
                            <CheckCircle2 className="w-3 h-3 text-green-600 mx-auto mt-1" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  {!selecciones.colorAluminio && (
                    <p className="text-xs text-slate-600 mt-2 text-center">Selecciona un color para continuar</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Selección de Tipo de Vidrio */}
            {materialVidrio && variantes.tiposVidrio.length > 0 && (
              <Card className="border-2 border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50">
                <CardHeader>
                  <CardTitle className="text-sm text-teal-700 flex items-center gap-2">
                    <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                    Tipo de Vidrio
                    {selecciones.tipoVidrio && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selecciones.tipoVidrio}
                    onValueChange={(value) => handleSeleccionChange("tipoVidrio", value)}
                  >
                    <SelectTrigger className="border-teal-200 h-8 text-sm">
                      <SelectValue placeholder="Seleccione tipo de vidrio" />
                    </SelectTrigger>
                    <SelectContent>
                      {variantes.tiposVidrio.map((vidrio: any) => (
                        <SelectItem key={vidrio._id} value={vidrio._id}>
                          {vidrio.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!selecciones.tipoVidrio && (
                    <p className="text-xs text-teal-600 mt-2 text-center">Selecciona un tipo de vidrio</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Parámetros de Mano de Obra */}
            <Card className="border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700 text-sm">
                  <Wrench className="w-4 h-4" />
                  Mano de Obra
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Fabricación */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-indigo-600">
                      Fabricación {tipoProducto.toUpperCase()}
                    </Label>
                    <Switch
                      checked={
                        tipoProducto === "pvc"
                          ? parametrosManoObra.fabricacion_pvc.activo
                          : parametrosManoObra.fabricacion_aluminio.activo
                      }
                      onCheckedChange={(checked) =>
                        handleParametroChange(
                          tipoProducto === "pvc" ? "fabricacion_pvc" : "fabricacion_aluminio",
                          "activo",
                          checked,
                        )
                      }
                    />
                  </div>
                  {(tipoProducto === "pvc"
                    ? parametrosManoObra.fabricacion_pvc.activo
                    : parametrosManoObra.fabricacion_aluminio.activo) && (
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        tipoProducto === "pvc"
                          ? parametrosManoObra.fabricacion_pvc.tarifa
                          : parametrosManoObra.fabricacion_aluminio.tarifa
                      }
                      onChange={(e) =>
                        handleParametroChange(
                          tipoProducto === "pvc" ? "fabricacion_pvc" : "fabricacion_aluminio",
                          "tarifa",
                          Number.parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="Tarifa por m²"
                      className="border-indigo-200 focus:border-indigo-400 h-8 text-sm"
                    />
                  )}
                </div>

                {/* Instalación */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-indigo-600">
                      Instalación {tipoProducto.toUpperCase()}
                    </Label>
                    <Switch
                      checked={
                        tipoProducto === "pvc"
                          ? parametrosManoObra.instalacion_pvc.activo
                          : parametrosManoObra.instalacion_aluminio.activo
                      }
                      onCheckedChange={(checked) =>
                        handleParametroChange(
                          tipoProducto === "pvc" ? "instalacion_pvc" : "instalacion_aluminio",
                          "activo",
                          checked,
                        )
                      }
                    />
                  </div>
                  {(tipoProducto === "pvc"
                    ? parametrosManoObra.instalacion_pvc.activo
                    : parametrosManoObra.instalacion_aluminio.activo) && (
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        tipoProducto === "pvc"
                          ? parametrosManoObra.instalacion_pvc.tarifa
                          : parametrosManoObra.instalacion_aluminio.tarifa
                      }
                      onChange={(e) =>
                        handleParametroChange(
                          tipoProducto === "pvc" ? "instalacion_pvc" : "instalacion_aluminio",
                          "tarifa",
                          Number.parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="Tarifa por m²"
                      className="border-indigo-200 focus:border-indigo-400 h-8 text-sm"
                    />
                  )}
                </div>

                {/* Malla */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-indigo-600">Malla</Label>
                    <Switch
                      checked={parametrosManoObra.malla.activo}
                      onCheckedChange={(checked) => handleParametroChange("malla", "activo", checked)}
                    />
                  </div>
                  {parametrosManoObra.malla.activo && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-indigo-500">Incluir mano de obra</Label>
                        <Switch
                          checked={parametrosManoObra.malla.incluye_mano_obra}
                          onCheckedChange={(checked) => handleParametroChange("malla", "incluye_mano_obra", checked)}
                        />
                      </div>
                      {parametrosManoObra.malla.incluye_mano_obra && (
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={parametrosManoObra.malla.tarifa_mano_obra}
                          onChange={(e) =>
                            handleParametroChange("malla", "tarifa_mano_obra", Number.parseFloat(e.target.value) || 0)
                          }
                          placeholder="Tarifa mano obra por m²"
                          className="border-indigo-200 focus:border-indigo-400 h-8 text-sm"
                        />
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel 4 - Estado y Resumen */}
          <div className="xl:col-span-1 space-y-4">
            {/* Estado de cálculo */}
            <Card
              className={`border-2 ${loading ? "border-yellow-200 bg-yellow-50" : resultado ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}
            >
              <CardContent className="p-4 text-center">
                {loading ? (
                  <div className="flex items-center justify-center gap-2 text-yellow-700">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                    <span className="text-sm">Calculando...</span>
                  </div>
                ) : resultado ? (
                  <div className="text-green-700">
                    <div className="text-sm font-medium">✅ Cotización Lista</div>
                    <div className="text-xs opacity-75">Última actualización: {new Date().toLocaleTimeString()}</div>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <div className="text-sm">⏳ Configurando...</div>
                    <div className="text-xs">Complete los datos para calcular</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumen de Costos Mejorado */}
            {resultado && (
              <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
                <CardHeader>
                  <CardTitle className="text-emerald-700 flex items-center gap-2 text-sm">
                    <Calculator className="w-4 h-4" />
                    Resumen de Costos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs text-gray-600">Materiales:</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        L {resultado.costos.totalMateriales.toFixed(2)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs text-gray-600">M.O. Fabricación:</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        L {resultado.costos.manoObraFabricacion.toFixed(2)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs text-gray-600">M.O. Instalación:</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        L {resultado.costos.manoObraInstalacion.toFixed(2)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs text-gray-600">Malla:</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        L {resultado.costos.manoObraMalla.toFixed(2)}
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t border-emerald-200 pt-2">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs font-medium text-gray-700">Subtotal:</span>
                      <Badge variant="secondary" className="font-mono text-xs">
                        L {resultado.costos.subtotal.toFixed(2)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs text-gray-600">Ganancia ({margenGanancia}%):</span>
                      <Badge variant="outline" className="font-mono text-green-600 text-xs">
                        L {resultado.costos.gananciaNeta.toFixed(2)}
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t-2 border-emerald-300 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-emerald-800">Total:</span>
                      <Badge className="bg-emerald-600 text-white text-sm font-bold px-2 py-1">
                        L {resultado.costos.total.toFixed(2)}
                      </Badge>
                    </div>
                    {cantidad > 1 && (
                      <div className="text-center mt-2 text-xs text-emerald-600">
                        L {(resultado.costos.total / cantidad).toFixed(2)} por unidad
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Acciones rápidas */}
            <Card className="border-2 border-gray-200">
              <CardContent className="p-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => calcularCotizacion()}
                    disabled={loading}
                    className="text-xs h-8"
                  >
                    <Calculator className="w-3 h-3 mr-1" />
                    Recalcular
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => resetForm()} className="text-xs h-8">
                    <Settings className="w-3 h-3 mr-1" />
                    Resetear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel 5 - Detalle de Materiales */}
          <div className="xl:col-span-1 space-y-4">
            <Collapsible open={mostrarDetalles} onOpenChange={setMostrarDetalles}>
              <Card className="border-2 border-blue-200">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-blue-50 transition-colors">
                    <CardTitle className="flex items-center justify-between text-blue-700 text-sm">
                      <span>Detalle de Materiales</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {detallesMateriales.length} materiales
                        </Badge>
                        {mostrarDetalles ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="max-h-80 overflow-y-auto">
                    {detallesMateriales.length > 0 ? (
                      <div className="space-y-3">
                        {detallesMateriales.map((material, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                              material.es_dependiente
                                ? "bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200"
                                : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="font-medium flex items-center gap-2 text-xs">
                                  {material.nombre}
                                  {material.es_vidrio && (
                                    <Badge variant="outline" className="text-xs bg-cyan-100 text-cyan-700">
                                      Vidrio
                                    </Badge>
                                  )}
                                  {material.tiene_variantes && (
                                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                      Variantes
                                    </Badge>
                                  )}
                                  {material.es_dependiente && (
                                    <Badge variant="outline" className="text-xs bg-indigo-100 text-indigo-700">
                                      Dependiente
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">{material.proveedor}</div>
                                {material.es_dependiente && (
                                  <div className="text-xs text-purple-600 mt-1">
                                    Depende de: {material.material_dependencia_nombre} (×{material.multiplicador})
                                  </div>
                                )}
                              </div>
                              <Badge
                                className={`${material.es_dependiente ? "bg-purple-600" : "bg-blue-600"} text-white font-mono text-xs`}
                              >
                                L {material.importe.toFixed(2)}
                              </Badge>
                            </div>

                            {/* Detalle del cálculo compacto */}
                            <div className="text-xs space-y-1 bg-white p-2 rounded border border-blue-100">
                              <div className="grid grid-cols-1 gap-1">
                                {material.es_dependiente ? (
                                  <div>
                                    <span className="font-medium text-purple-600">Dependencia:</span>
                                    <div className="font-mono text-purple-800 text-xs">
                                      {material.calculo_detalle.dependencia_calculo}
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="font-medium text-blue-600">Fórmula:</span>
                                    <div className="font-mono text-blue-800 text-xs">
                                      {material.calculo_detalle.formula_aplicada}
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium text-green-600">Rendimiento:</span>
                                  <div className="font-mono text-green-800 text-xs">
                                    {material.calculo_detalle.rendimiento_calculo}
                                  </div>
                                </div>
                              </div>
                              <div className="text-center pt-1 border-t border-blue-100">
                                <span className="text-gray-600 font-medium text-xs">
                                  {material.rendimiento.toFixed(4)}{" "}
                                  {material.unidad_medida_produccion || material.unidad_medida}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Configure las opciones para ver el detalle</p>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        </div>

        {/* Footer con acciones principales */}
        <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 -mx-6 px-6 py-4 -mb-6 rounded-b-lg">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {resultado ? (
                <span className="flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Cotización lista
                </span>
              ) : (
                <span className="flex items-center gap-1 text-orange-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Configurando...
                </span>
              )}
            </div>
            {resultado && (
              <div className="text-sm font-medium text-blue-700">Total: L {resultado.costos.total.toFixed(2)}</div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="px-6">
              Cancelar
            </Button>
            <Button
              onClick={agregarACotizacion}
              disabled={!resultado || loading}
              className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Calculando...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Agregar a Cotización
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
