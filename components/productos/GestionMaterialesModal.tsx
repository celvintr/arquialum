"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Plus,
  Trash2,
  Package,
  AlertCircle,
  Loader2,
  Calculator,
  CheckCircle2,
  Lightbulb,
  Copy,
  Info,
  Zap,
  Target,
  Edit3,
  Save,
  X,
  Star,
  TrendingUp,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface GestionMaterialesModalProps {
  isOpen: boolean
  onClose: () => void
  producto: any
  onSuccess?: () => void
}

// Fórmulas reales extraídas del SQL de producción
const FORMULAS_REALES_PRODUCCION = {
  perfiles: [
    {
      formula: "(ancho + alto) * 2",
      descripcion: "Perímetro completo",
      uso: "Marco exterior, contramarcos",
      ejemplo: "Ventana 1.5×2m = (1.5+2)×2 = 7m",
      contexto: "Fórmula más común para marcos",
      frecuencia: "muy-alta",
      categoria: "basica",
    },
    {
      formula: "(ancho * 2) + (alto * 4)",
      descripcion: "Marco con refuerzos verticales",
      uso: "Ventanas corredizas, marcos reforzados",
      ejemplo: "Ancho: 2 perfiles, Alto: 4 perfiles",
      contexto: "Para ventanas de 2-3 carriles",
      frecuencia: "alta",
      categoria: "intermedia",
    },
    {
      formula: "ancho + (alto * 2)",
      descripcion: "Marco en U",
      uso: "Rieles, contramarcos superiores",
      ejemplo: "Riel superior + 2 laterales",
      contexto: "Sin perfil inferior",
      frecuencia: "alta",
      categoria: "basica",
    },
    {
      formula: "alto * 2",
      descripcion: "Solo verticales",
      uso: "Jambas, parantes laterales",
      ejemplo: "2 perfiles verticales",
      contexto: "Elementos laterales únicamente",
      frecuencia: "media",
      categoria: "basica",
    },
    {
      formula: "ancho * 1",
      descripcion: "Solo horizontal",
      uso: "Rieles, travesaños",
      ejemplo: "Un riel horizontal",
      contexto: "Elementos horizontales únicamente",
      frecuencia: "media",
      categoria: "basica",
    },
  ],
  herrajes: [
    {
      formula: "(alto < 1 ? 8 : REDONDEAR.MENOS(alto / 0.5, 0) * 4)",
      descripcion: "Herrajes por altura cada 50cm",
      uso: "Rodos, bisagras distribuidas",
      ejemplo: "Alto 2m: 2÷0.5×4 = 16 rodos",
      contexto: "Distribución uniforme según altura",
      frecuencia: "muy-alta",
      categoria: "avanzada",
    },
    {
      formula: "(ancho > 1.5 ? 3 : 2) + (alto > 1.5 ? 6 : 4)",
      descripcion: "Cantidad según tamaño de ventana",
      uso: "Herrajes principales",
      ejemplo: "Ventana grande: 3+6=9 piezas",
      contexto: "Más herrajes para ventanas grandes",
      frecuencia: "muy-alta",
      categoria: "avanzada",
    },
    {
      formula: "2 * 1",
      descripcion: "Par de elementos",
      uso: "Cerrador izq/der, bisagras",
      ejemplo: "1 cerrador izquierdo + 1 derecho",
      contexto: "Elementos que van en pares",
      frecuencia: "muy-alta",
      categoria: "basica",
    },
    {
      formula: "4 * 1",
      descripcion: "Cuatro esquinas",
      uso: "Esquineros, topes, tapones",
      ejemplo: "4 tapones de drenaje",
      contexto: "Elementos en las 4 esquinas",
      frecuencia: "alta",
      categoria: "basica",
    },
    {
      formula: "6 * 1",
      descripcion: "Seis por hoja",
      uso: "Tornillos por hoja",
      ejemplo: "6 tornillos por hoja corrediza",
      contexto: "Cantidad estándar por elemento",
      frecuencia: "alta",
      categoria: "basica",
    },
  ],
  vidrios: [
    {
      formula: "ancho * alto",
      descripcion: "Área completa",
      uso: "Vidrio principal",
      ejemplo: "Ventana 1.5×2m = 3m²",
      contexto: "Para vidrios que cubren todo el vano",
      frecuencia: "muy-alta",
      categoria: "basica",
    },
    {
      formula: "ancho * alto * 0.5",
      descripcion: "Media área",
      uso: "Vidrio con divisiones",
      ejemplo: "Ventana dividida en 2 = 1.5m²",
      contexto: "Cuando hay divisiones horizontales",
      frecuencia: "muy-alta",
      categoria: "basica",
    },
    {
      formula: "(ancho / 2) * alto",
      descripcion: "División vertical",
      uso: "Vidrios corredizos",
      ejemplo: "Cada hoja corrediza",
      contexto: "Ventanas corredizas de 2 hojas",
      frecuencia: "alta",
      categoria: "intermedia",
    },
  ],
  selladores: [
    {
      formula: "(ancho + alto) * 2",
      descripcion: "Perímetro de sellado",
      uso: "Silicon alrededor del marco",
      ejemplo: "7m de silicon para ventana 1.5×2m",
      contexto: "Sellado perimetral completo",
      frecuencia: "muy-alta",
      categoria: "basica",
    },
    {
      formula: "1 * 1",
      descripcion: "Una unidad por ventana",
      uso: "Bote de silicon, rollo de felpa",
      ejemplo: "1 bote por ventana",
      contexto: "Consumibles de cantidad fija",
      frecuencia: "muy-alta",
      categoria: "basica",
    },
  ],
}

const FORMULA_INTELIGENTE = {
  perfiles: {
    keywords: [
      "contramarco",
      "hoja",
      "batiente",
      "moldura",
      "traslape",
      "refuerzo",
      "riel",
      "marco",
      "perfil",
      "serie",
      "s60",
      "s80",
    ],
    formulas: FORMULAS_REALES_PRODUCCION.perfiles,
  },
  herrajes: {
    keywords: [
      "rodos",
      "cerrador",
      "haladera",
      "tornillo",
      "tapones",
      "bisagra",
      "manija",
      "cerradura",
      "herraje",
      "impacto",
    ],
    formulas: FORMULAS_REALES_PRODUCCION.herrajes,
  },
  vidrios: {
    keywords: ["vidrio", "cristal", "panel", "lamina", "claro", "bronce", "reflectivo", "laminado", "templado"],
    formulas: FORMULAS_REALES_PRODUCCION.vidrios,
  },
  selladores: {
    keywords: ["silicon", "felpa", "sello", "empaque", "adhesivo", "masilla"],
    formulas: FORMULAS_REALES_PRODUCCION.selladores,
  },
  textiles: {
    keywords: ["fibra", "malla", "mosquitero", "vinil", "tela"],
    formulas: [
      {
        formula: "ancho * alto",
        descripcion: "Área completa",
        uso: "Malla mosquitero",
        ejemplo: "3m² de fibra",
        contexto: "Cubre toda el área del vano",
        frecuencia: "muy-alta",
        categoria: "basica",
      },
    ],
  },
}

const detectarTipoMaterial = (nombre: string, categoria = ""): string => {
  const texto = `${nombre} ${categoria}`.toLowerCase()
  for (const [tipo, config] of Object.entries(FORMULA_INTELIGENTE)) {
    if (config.keywords.some((keyword) => texto.includes(keyword))) {
      return tipo
    }
  }
  return "general"
}

const FORMULAS_GENERALES = [
  {
    formula: "ancho * alto",
    descripcion: "Área total",
    uso: "Materiales por superficie",
    ejemplo: "1.5m × 2m = 3m²",
    contexto: "Cálculo básico de área",
    frecuencia: "muy-alta",
    categoria: "basica",
  },
  {
    formula: "(ancho + alto) * 2",
    descripcion: "Perímetro",
    uso: "Materiales lineales",
    ejemplo: "(1.5+2) × 2 = 7m",
    contexto: "Cálculo básico de perímetro",
    frecuencia: "muy-alta",
    categoria: "basica",
  },
  {
    formula: "1",
    descripcion: "Cantidad fija",
    uso: "Una unidad por producto",
    ejemplo: "1 pieza",
    contexto: "Elementos únicos",
    frecuencia: "muy-alta",
    categoria: "basica",
  },
]

export default function GestionMaterialesModal({ isOpen, onClose, producto, onSuccess }: GestionMaterialesModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const [materiales, setMateriales] = useState<any[]>([])
  const [materialesProducto, setMaterialesProducto] = useState<any[]>([])

  const [materialSeleccionado, setMaterialSeleccionado] = useState<any>(null)
  const [formula, setFormula] = useState("")
  const [showSugerencias, setShowSugerencias] = useState(false)
  const [tipoDetectado, setTipoDetectado] = useState<string>("general")

  const [esDependiente, setEsDependiente] = useState(false)
  const [materialDependencia, setMaterialDependencia] = useState("")
  const [multiplicador, setMultiplicador] = useState("2")

  const [editandoMaterial, setEditandoMaterial] = useState<string | null>(null)
  const [formulaEditando, setFormulaEditando] = useState("")

  const [editandoDependencia, setEditandoDependencia] = useState(false)
  const [materialDependenciaEditando, setMaterialDependenciaEditando] = useState("")
  const [multiplicadorEditando, setMultiplicadorEditando] = useState("2")

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [materialAEliminar, setMaterialAEliminar] = useState<string | null>(null)

  const materialesAgregadosIds = useMemo(() => {
    return new Set(materialesProducto.map((mp) => mp.material_id))
  }, [materialesProducto])

  const materialesDisponibles = useMemo(() => {
    if (!materiales || materiales.length === 0) return []
    return materiales.filter((material) => !materialesAgregadosIds.has(material._id))
  }, [materiales, materialesAgregadosIds])

  const materialesFiltrados = useMemo(() => {
    let filtered = [...materialesDisponibles]
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (material) =>
          (material.nombre && material.nombre.toLowerCase().includes(term)) ||
          (material.categoria && material.categoria.toLowerCase().includes(term)) ||
          (material.codigo && material.codigo.toLowerCase().includes(term)),
      )
    }
    return filtered
  }, [materialesDisponibles, searchTerm])

  const materialesPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return materialesFiltrados.slice(startIndex, startIndex + itemsPerPage)
  }, [materialesFiltrados, currentPage])

  const totalPages = Math.ceil(materialesFiltrados.length / itemsPerPage)

  const sugerenciasInteligentes = useMemo(() => {
    if (!materialSeleccionado && !editandoMaterial) return FORMULAS_GENERALES
    const materialParaAnalizar = materialSeleccionado || materiales.find((m) => m._id === editandoMaterial)
    if (!materialParaAnalizar) return FORMULAS_GENERALES

    const tipo = detectarTipoMaterial(materialParaAnalizar.nombre, materialParaAnalizar.categoria)
    setTipoDetectado(tipo)

    if (tipo !== "general" && FORMULA_INTELIGENTE[tipo]) {
      return FORMULA_INTELIGENTE[tipo].formulas.sort((a, b) => {
        const frecuenciaOrder = { "muy-alta": 4, alta: 3, media: 2, baja: 1 }
        const categoriaOrder = { basica: 3, intermedia: 2, avanzada: 1 }
        const frecuenciaA = frecuenciaOrder[a.frecuencia] || 0
        const frecuenciaB = frecuenciaOrder[b.frecuencia] || 0
        if (frecuenciaA !== frecuenciaB) {
          return frecuenciaB - frecuenciaA
        }
        const categoriaA = categoriaOrder[a.categoria] || 0
        const categoriaB = categoriaOrder[b.categoria] || 0
        return categoriaB - categoriaA
      })
    }
    return FORMULAS_GENERALES
  }, [materialSeleccionado, editandoMaterial, materiales])

  useEffect(() => {
    if (isOpen && producto) {
      cargarDatos()
    }
  }, [isOpen, producto])

  const cargarDatos = async () => {
    try {
      setLoadingData(true)

      // Validar que tenemos un producto válido
      if (!producto) {
        console.error("❌ No hay producto seleccionado")
        toast({
          title: "Error",
          description: "No se ha seleccionado un producto válido",
          variant: "destructive",
        })
        return
      }

      console.log("🔄 Cargando datos para producto:", producto)

      // Cargar materiales generales
      const materialesRes = await fetch("/api/materiales")
      const materialesData = await materialesRes.json()

      console.log("📦 Respuesta materiales:", materialesData)

      if (materialesData.success) {
        setMateriales(materialesData.materiales || [])
      } else {
        console.error("❌ Error en respuesta de materiales:", materialesData)
        setMateriales([])
      }

      // Cargar materiales del producto si tenemos un ID válido
      if (producto._id) {
        console.log("🔄 Cargando materiales del producto ID:", producto._id)

        const productosRes = await fetch(`/api/productos/${producto._id}/materiales`)
        const productosData = await productosRes.json()

        console.log("📦 Respuesta materiales del producto:", productosData)

        if (productosData.success) {
          setMaterialesProducto(productosData.materiales || [])
        } else {
          console.error("❌ Error en respuesta de materiales del producto:", productosData)
          setMaterialesProducto([])
        }
      } else {
        console.warn("⚠️ Producto sin ID válido:", producto)
        setMaterialesProducto([])
      }
    } catch (error) {
      console.error("❌ Error cargando datos:", error)
      toast({
        title: "Error",
        description: `Error cargando datos: ${error?.message || "Error desconocido"}`,
        variant: "destructive",
      })
      setMateriales([])
      setMaterialesProducto([])
    } finally {
      setLoadingData(false)
    }
  }

  const seleccionarMaterial = (material: any) => {
    setMaterialSeleccionado(material)
    const nombre = material.nombre.toLowerCase()
    const esProbablementeDependiente =
      nombre.includes("tornillo") ||
      nombre.includes("tuerca") ||
      nombre.includes("arandela") ||
      nombre.includes("perno") ||
      nombre.includes("clavo")

    if (esProbablementeDependiente && materialesProducto.length > 0) {
      setEsDependiente(true)
      setFormula("")
    } else {
      setEsDependiente(false)
      const tipo = detectarTipoMaterial(material.nombre, material.categoria)
      const sugerencias =
        tipo !== "general" && FORMULA_INTELIGENTE[tipo] ? FORMULA_INTELIGENTE[tipo].formulas : FORMULAS_GENERALES
      setFormula(sugerencias[0]?.formula || "1")
    }
    setShowSugerencias(true)
    toast({
      title: "Material seleccionado",
      description: esProbablementeDependiente
        ? "Material dependiente detectado"
        : `Tipo detectado: ${detectarTipoMaterial(material.nombre, material.categoria)}`,
    })
  }

  const aplicarFormula = (formulaEjemplo: string) => {
    if (editandoMaterial) {
      setFormulaEditando(formulaEjemplo)
    } else {
      setFormula(formulaEjemplo)
    }
    toast({
      title: "Fórmula aplicada",
      description: `Se aplicó: ${formulaEjemplo}`,
    })
  }

  const copiarFormula = (formulaEjemplo: string) => {
    navigator.clipboard.writeText(formulaEjemplo)
    toast({
      title: "Fórmula copiada",
      description: "La fórmula se copió al portapapeles",
    })
  }

  const agregarMaterial = async () => {
    try {
      if (!materialSeleccionado) {
        toast({
          title: "Error",
          description: "Selecciona un material",
          variant: "destructive",
        })
        return
      }

      if (esDependiente) {
        if (!materialDependencia) {
          toast({
            title: "Error",
            description: "Selecciona el material del cual depende",
            variant: "destructive",
          })
          return
        }
        if (!multiplicador.trim()) {
          toast({
            title: "Error",
            description: "Ingresa el multiplicador",
            variant: "destructive",
          })
          return
        }
      } else {
        if (!formula.trim()) {
          toast({
            title: "Error",
            description: "Ingresa una fórmula",
            variant: "destructive",
          })
          return
        }
      }

      if (!producto || !producto._id) {
        toast({
          title: "Error",
          description: "No se ha seleccionado un producto válido",
          variant: "destructive",
        })
        return
      }

      setLoading(true)

      const response = await fetch(`/api/productos/${producto._id}/materiales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          material_id: materialSeleccionado._id,
          formula: esDependiente ? `cantidad_${materialDependencia} * ${multiplicador}` : formula.trim(),
          es_dependiente: esDependiente,
          material_dependencia: esDependiente ? materialDependencia : null,
          multiplicador: esDependiente ? multiplicador : null,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: "¡Material agregado!",
          description: `${materialSeleccionado.nombre} ha sido agregado al producto`,
        })

        const nuevoMaterial = {
          _id: result.relacion._id,
          material_id: materialSeleccionado._id,
          producto_id: producto._id,
          formula: esDependiente ? `cantidad_${materialDependencia} * ${multiplicador}` : formula.trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        setMaterialesProducto((prev) => [...prev, nuevoMaterial])

        setMaterialSeleccionado(null)
        setFormula("")
        setShowSugerencias(false)
        setTipoDetectado("general")
        setEsDependiente(false)
        setMaterialDependencia("")
        setMultiplicador("2")

        if (onSuccess) onSuccess()
      } else {
        throw new Error(result.error || "Error al agregar material")
      }
    } catch (error) {
      console.error("Error agregando material:", error)
      toast({
        title: "Error al agregar",
        description: error.message || "No se pudo agregar el material",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const iniciarEdicion = (materialId: string, formulaActual: string) => {
    setEditandoMaterial(materialId)
    const esDependienteActual = formulaActual.includes("cantidad_")
    setEditandoDependencia(esDependienteActual)

    if (esDependienteActual) {
      const match = formulaActual.match(/cantidad_(\w+)\s*\*\s*(\d+(?:\.\d+)?)/)
      if (match) {
        setMaterialDependenciaEditando(match[1])
        setMultiplicadorEditando(match[2])
      }
      setFormulaEditando("")
    } else {
      setFormulaEditando(formulaActual)
      setMaterialDependenciaEditando("")
      setMultiplicadorEditando("2")
    }
    setShowSugerencias(true)
  }

  const cancelarEdicion = () => {
    setEditandoMaterial(null)
    setFormulaEditando("")
    setShowSugerencias(false)
    setEditandoDependencia(false)
    setMaterialDependenciaEditando("")
    setMultiplicadorEditando("2")
  }

  const guardarEdicion = async () => {
    if (!editandoMaterial) return

    if (editandoDependencia) {
      if (!materialDependenciaEditando || !multiplicadorEditando.trim()) {
        toast({
          title: "Error",
          description: "Complete los datos de dependencia",
          variant: "destructive",
        })
        return
      }
    } else {
      if (!formulaEditando.trim()) {
        toast({
          title: "Error",
          description: "Ingrese una fórmula",
          variant: "destructive",
        })
        return
      }
    }

    try {
      setLoading(true)

      const response = await fetch(`/api/productos/${producto._id}/materiales`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          material_id: editandoMaterial,
          formula: editandoDependencia
            ? `cantidad_${materialDependenciaEditando} * ${multiplicadorEditando}`
            : formulaEditando.trim(),
          es_dependiente: editandoDependencia,
          material_dependencia: editandoDependencia ? materialDependenciaEditando : null,
          multiplicador: editandoDependencia ? multiplicadorEditando : null,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setMaterialesProducto((prev) =>
          prev.map((mp) =>
            mp.material_id === editandoMaterial
              ? {
                  ...mp,
                  formula: editandoDependencia
                    ? `cantidad_${materialDependenciaEditando} * ${multiplicadorEditando}`
                    : formulaEditando.trim(),
                }
              : mp,
          ),
        )

        toast({
          title: "Fórmula actualizada",
          description: "La fórmula se ha guardado correctamente",
        })

        setEditandoMaterial(null)
        setFormulaEditando("")
        setShowSugerencias(false)
        setEditandoDependencia(false)
        setMaterialDependenciaEditando("")
        setMultiplicadorEditando("2")

        if (onSuccess) onSuccess()
      } else {
        throw new Error(result.error || "Error al actualizar fórmula")
      }
    } catch (error) {
      console.error("Error actualizando fórmula:", error)
      toast({
        title: "Error al guardar",
        description: error.message || "No se pudo actualizar la fórmula",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const confirmarEliminarMaterial = (materialId: string) => {
    setMaterialAEliminar(materialId)
    setShowDeleteDialog(true)
  }

  const eliminarMaterial = async () => {
    if (!materialAEliminar || !producto || !producto._id) return

    try {
      setLoading(true)

      const response = await fetch(`/api/productos/${producto._id}/materiales`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ material_id: materialAEliminar }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const materialEliminado = obtenerNombreMaterial(materialAEliminar)
        toast({
          title: "Material eliminado",
          description: `${materialEliminado} ha sido eliminado del producto`,
        })

        setMaterialesProducto((prev) => prev.filter((mp) => mp.material_id !== materialAEliminar))

        if (onSuccess) onSuccess()
      } else {
        throw new Error(result.error || "Error al eliminar material")
      }
    } catch (error) {
      console.error("Error eliminando material:", error)
      toast({
        title: "Error al eliminar",
        description: error.message || "No se pudo eliminar el material",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setShowDeleteDialog(false)
      setMaterialAEliminar(null)
    }
  }

  const obtenerNombreMaterial = (materialId: string) => {
    if (!materiales) return "Material no encontrado"
    const material = materiales.find((m) => m._id === materialId)
    return material?.nombre || "Material no encontrado"
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "perfiles":
        return "🔲"
      case "herrajes":
        return "🔧"
      case "vidrios":
        return "🪟"
      case "selladores":
        return "🧴"
      case "textiles":
        return "🕸️"
      default:
        return "📦"
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "perfiles":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "herrajes":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "vidrios":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200"
      case "selladores":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "textiles":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getFrecuenciaIcon = (frecuencia: string) => {
    switch (frecuencia) {
      case "muy-alta":
        return <Star className="w-3 h-3 text-yellow-500" />
      case "alta":
        return <TrendingUp className="w-3 h-3 text-green-500" />
      case "media":
        return <Target className="w-3 h-3 text-blue-500" />
      default:
        return null
    }
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "basica":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      case "intermedia":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
      case "avanzada":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  if (loadingData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p>Cargando materiales...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Gestionar Materiales - {producto?.nombre}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Agregar Material</h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Buscar materiales disponibles..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setCurrentPage(1)
                          }}
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {materialesFiltrados?.length || 0} de {materialesDisponibles?.length || 0} materiales
                        disponibles
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {!materialesPaginados || materialesPaginados.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <p>
                          {materialesDisponibles.length === 0
                            ? "Todos los materiales ya están agregados"
                            : "No se encontraron materiales"}
                        </p>
                        {searchTerm && (
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => setSearchTerm("")}>
                            Limpiar búsqueda
                          </Button>
                        )}
                      </div>
                    ) : (
                      <>
                        {materialesPaginados.map((material) => {
                          const tipoDetectadoMaterial = detectarTipoMaterial(material.nombre, material.categoria)
                          return (
                            <div
                              key={material._id}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                materialSeleccionado?._id === material._id
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                              }`}
                              onClick={() => seleccionarMaterial(material)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium">{material.nombre}</h4>
                                    <Badge className={`text-xs ${getTipoColor(tipoDetectadoMaterial)}`}>
                                      {getTipoIcon(tipoDetectadoMaterial)} {tipoDetectadoMaterial}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{material.categoria}</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {material.proveedores?.slice(0, 2).map((prov: any, idx: number) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {prov.proveedor_nombre || "Sin nombre"}
                                      </Badge>
                                    ))}
                                    {material.proveedores?.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{material.proveedores.length - 2} más
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {materialSeleccionado?._id === material._id && (
                                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}

                        {totalPages > 1 && (
                          <div className="flex justify-between items-center pt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                            >
                              Anterior
                            </Button>
                            <span className="text-sm text-gray-500">
                              Página {currentPage} de {totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              disabled={currentPage === totalPages}
                            >
                              Siguiente
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {materialSeleccionado && (
                    <div className="mt-6 pt-6 border-t space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 flex items-center">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {materialSeleccionado.nombre}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${getTipoColor(tipoDetectado)}`}>
                            {getTipoIcon(tipoDetectado)} {tipoDetectado}
                          </Badge>
                          <span className="text-sm text-blue-700 dark:text-blue-300">
                            {materialSeleccionado.categoria}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              checked={!esDependiente}
                              onChange={() => setEsDependiente(false)}
                              className="text-blue-600"
                            />
                            <span className="text-sm">Fórmula normal</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              checked={esDependiente}
                              onChange={() => setEsDependiente(true)}
                              disabled={materialesProducto.length === 0}
                              className="text-blue-600"
                            />
                            <span className="text-sm">Depende de otro material</span>
                          </label>
                        </div>

                        {esDependiente ? (
                          <div className="space-y-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <Label className="text-orange-700 font-medium">Configurar Dependencia</Label>

                            <div className="space-y-2">
                              <Label className="text-sm">Material del cual depende:</Label>
                              <select
                                value={materialDependencia}
                                onChange={(e) => setMaterialDependencia(e.target.value)}
                                className="w-full p-2 border rounded-md"
                              >
                                <option value="">Seleccionar material...</option>
                                {materialesProducto.map((mp) => {
                                  const nombreMat = obtenerNombreMaterial(mp.material_id)
                                  return (
                                    <option key={mp.material_id} value={mp.material_id}>
                                      {nombreMat}
                                    </option>
                                  )
                                })}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm">Multiplicador:</Label>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">cantidad × </span>
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  value={multiplicador}
                                  onChange={(e) => setMultiplicador(e.target.value)}
                                  className="w-20"
                                  placeholder="2"
                                />
                              </div>
                              <p className="text-xs text-orange-600">
                                Ejemplo: Si hay 4 haladeras y multiplicador es 2, se calcularán 8 tornillos
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Label className="flex items-center">
                              <Calculator className="w-4 h-4 mr-2" />
                              Fórmula de Cálculo
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" className="ml-2 p-1 h-auto">
                                    <Info className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Variables: ancho, alto, decoradoHorizontal, decoradoVertical</p>
                                  <p>Funciones: REDONDEAR.MENOS(), operadores ?, +, -, *, /</p>
                                </TooltipContent>
                              </Tooltip>
                            </Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                value={formula}
                                onChange={(e) => setFormula(e.target.value)}
                                placeholder="Ej: ancho * alto * 2"
                                className="flex-1"
                              />
                              <Button variant="outline" size="sm" onClick={() => setShowSugerencias(!showSugerencias)}>
                                <Zap className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Sugerencias inteligentes basadas en fórmulas reales de producción
                            </p>
                          </div>
                        )}
                      </div>

                      <Button onClick={agregarMaterial} disabled={loading} className="w-full">
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Agregando...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar Material
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {showSugerencias && (materialSeleccionado || editandoMaterial) && (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-green-500" />
                      Fórmulas de Producción Real
                      <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                        {getTipoIcon(tipoDetectado)} {tipoDetectado}
                      </Badge>
                    </h3>

                    <Tabs defaultValue="recomendadas" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="recomendadas">Recomendadas</TabsTrigger>
                        <TabsTrigger value="basicas">Básicas</TabsTrigger>
                        <TabsTrigger value="avanzadas">Avanzadas</TabsTrigger>
                      </TabsList>

                      <TabsContent value="recomendadas" className="space-y-3 max-h-80 overflow-y-auto">
                        {sugerenciasInteligentes
                          .filter((s) => s.frecuencia === "muy-alta" || s.frecuencia === "alta")
                          .slice(0, 6)
                          .map((sugerencia, idx) => (
                            <div
                              key={idx}
                              className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <code className="text-sm font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                                      {sugerencia.formula}
                                    </code>
                                    <div className="flex items-center gap-1">
                                      {getFrecuenciaIcon(sugerencia.frecuencia)}
                                      <Badge className={`text-xs ${getCategoriaColor(sugerencia.categoria)}`}>
                                        {sugerencia.categoria}
                                      </Badge>
                                    </div>
                                  </div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {sugerencia.descripcion}
                                  </p>
                                  <p className="text-xs text-green-600 dark:text-green-400 mb-1">
                                    💡 {sugerencia.ejemplo}
                                  </p>
                                  <p className="text-xs text-gray-500">{sugerencia.contexto}</p>
                                </div>
                                <div className="flex flex-col gap-1 ml-2">
                                  <Button variant="ghost" size="sm" onClick={() => copiarFormula(sugerencia.formula)}>
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => aplicarFormula(sugerencia.formula)}>
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </TabsContent>

                      <TabsContent value="basicas" className="space-y-3 max-h-80 overflow-y-auto">
                        {sugerenciasInteligentes
                          .filter((s) => s.categoria === "basica")
                          .map((sugerencia, idx) => (
                            <div
                              key={idx}
                              className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <code className="text-sm font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                                      {sugerencia.formula}
                                    </code>
                                    <div className="flex items-center gap-1">
                                      {getFrecuenciaIcon(sugerencia.frecuencia)}
                                      <Badge className={`text-xs ${getCategoriaColor(sugerencia.categoria)}`}>
                                        {sugerencia.categoria}
                                      </Badge>
                                    </div>
                                  </div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {sugerencia.descripcion}
                                  </p>
                                  <p className="text-xs text-green-600 dark:text-green-400 mb-1">
                                    💡 {sugerencia.ejemplo}
                                  </p>
                                  <p className="text-xs text-gray-500">{sugerencia.contexto}</p>
                                </div>
                                <div className="flex flex-col gap-1 ml-2">
                                  <Button variant="ghost" size="sm" onClick={() => copiarFormula(sugerencia.formula)}>
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => aplicarFormula(sugerencia.formula)}>
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </TabsContent>

                      <TabsContent value="avanzadas" className="space-y-3 max-h-80 overflow-y-auto">
                        {sugerenciasInteligentes
                          .filter((s) => s.categoria === "avanzada" || s.categoria === "intermedia")
                          .map((sugerencia, idx) => (
                            <div
                              key={idx}
                              className="p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <code className="text-sm font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded border text-xs">
                                      {sugerencia.formula}
                                    </code>
                                    <div className="flex items-center gap-1">
                                      {getFrecuenciaIcon(sugerencia.frecuencia)}
                                      <Badge className={`text-xs ${getCategoriaColor(sugerencia.categoria)}`}>
                                        {sugerencia.categoria}
                                      </Badge>
                                    </div>
                                  </div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {sugerencia.descripcion}
                                  </p>
                                  <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">
                                    💡 {sugerencia.ejemplo}
                                  </p>
                                  <p className="text-xs text-gray-500">{sugerencia.contexto}</p>
                                </div>
                                <div className="flex flex-col gap-1 ml-2">
                                  <Button variant="ghost" size="sm" onClick={() => copiarFormula(sugerencia.formula)}>
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => aplicarFormula(sugerencia.formula)}>
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </TabsContent>
                    </Tabs>

                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 flex items-center">
                        <Lightbulb className="w-3 h-3 mr-1" />
                        Fórmulas extraídas de la base de datos de producción real con más de 13,000 registros
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Materiales del Producto ({materialesProducto?.length || 0})
                  </h3>

                  {!materialesProducto || materialesProducto.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-8 h-8 mx-auto mb-2" />
                      <p>No hay materiales agregados</p>
                      <p className="text-sm">Selecciona materiales de la lista de la izquierda</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {materialesProducto.map((materialProducto) => {
                        const nombreMaterial = obtenerNombreMaterial(materialProducto.material_id)
                        const materialCompleto = materiales.find((m) => m._id === materialProducto.material_id)
                        const tipoMaterial = materialCompleto
                          ? detectarTipoMaterial(materialCompleto.nombre, materialCompleto.categoria)
                          : "general"

                        const estaEditando = editandoMaterial === materialProducto.material_id

                        return (
                          <div
                            key={materialProducto._id || materialProducto.material_id}
                            className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium flex items-center">
                                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                                    {nombreMaterial}
                                  </h4>
                                  <Badge className={`text-xs ${getTipoColor(tipoMaterial)}`}>
                                    {getTipoIcon(tipoMaterial)}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center gap-2">
                                    <Calculator className="w-3 h-3" />
                                    {estaEditando ? (
                                      <div className="flex-1 space-y-2">
                                        <div className="flex items-center space-x-4">
                                          <label className="flex items-center space-x-2">
                                            <input
                                              type="radio"
                                              checked={!editandoDependencia}
                                              onChange={() => setEditandoDependencia(false)}
                                              className="text-blue-600"
                                            />
                                            <span className="text-xs">Normal</span>
                                          </label>
                                          <label className="flex items-center space-x-2">
                                            <input
                                              type="radio"
                                              checked={editandoDependencia}
                                              onChange={() => setEditandoDependencia(true)}
                                              className="text-blue-600"
                                            />
                                            <span className="text-xs">Dependiente</span>
                                          </label>
                                        </div>

                                        {editandoDependencia ? (
                                          <div className="space-y-2">
                                            <select
                                              value={materialDependenciaEditando}
                                              onChange={(e) => setMaterialDependenciaEditando(e.target.value)}
                                              className="w-full p-1 border rounded text-xs"
                                            >
                                              <option value="">Seleccionar...</option>
                                              {materialesProducto
                                                .filter((mp) => mp.material_id !== editandoMaterial)
                                                .map((mp) => (
                                                  <option key={mp.material_id} value={mp.material_id}>
                                                    {obtenerNombreMaterial(mp.material_id)}
                                                  </option>
                                                ))}
                                            </select>
                                            <div className="flex items-center space-x-1">
                                              <span className="text-xs">×</span>
                                              <Input
                                                type="number"
                                                step="0.1"
                                                value={multiplicadorEditando}
                                                onChange={(e) => setMultiplicadorEditando(e.target.value)}
                                                className="w-16 h-6 text-xs"
                                              />
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex gap-2">
                                            <Input
                                              value={formulaEditando}
                                              onChange={(e) => setFormulaEditando(e.target.value)}
                                              className="text-xs h-8"
                                              placeholder="Editar fórmula..."
                                            />
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setShowSugerencias(!showSugerencias)}
                                              className="h-8 px-2"
                                            >
                                              <Zap className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <code className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                                          {materialProducto.formula || "Sin fórmula"}
                                        </code>
                                        {materialProducto.formula?.includes("cantidad_") && (
                                          <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700">
                                            Dependiente
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1 ml-2">
                                {estaEditando ? (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={guardarEdicion}
                                      disabled={loading}
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    >
                                      <Save className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={cancelarEdicion}
                                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        iniciarEdicion(materialProducto.material_id, materialProducto.formula || "")
                                      }
                                      disabled={loading}
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => confirmarEliminarMaterial(materialProducto.material_id)}
                                      disabled={loading}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar material?</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de que deseas eliminar este material del producto? Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={eliminarMaterial} className="bg-red-600 hover:bg-red-700 text-white">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
