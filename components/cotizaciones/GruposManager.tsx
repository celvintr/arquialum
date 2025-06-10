"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  Users,
  ImageIcon,
  Upload,
  X,
  Check,
  ChefHat,
  Bed,
  Bath,
  Car,
  Building,
  Trees,
  Sofa,
  Briefcase,
  Sparkles,
  Crown,
  Zap,
  HardDrive,
  CheckCircle,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { SessionManager } from "@/lib/utils/session-manager"

interface GruposManagerProps {
  grupos: any[]
  grupoActivo: string
  items: any[]
  onGrupoSeleccionado: (grupoId: string) => void
  onCrearGrupo: (nombre: string, imagen?: File, descripcion?: string) => void
  onEliminarGrupo: (grupoId: string) => void
  onActualizarGrupo: (grupoId: string, datos: any) => void
}

// Plantillas predefinidas para grupos
const PLANTILLAS_GRUPOS = [
  {
    id: "sala",
    nombre: "Sala de Estar",
    descripcion: "Ventanas, puertas y elementos para la sala principal",
    icono: Sofa,
    color: "from-blue-500 to-blue-600",
    imagen: "/placeholder.svg?height=200&width=300&text=Sala+de+Estar",
  },
  {
    id: "cocina",
    nombre: "Cocina",
    descripcion: "Ventanas, puertas de alacena y elementos de cocina",
    icono: ChefHat,
    color: "from-orange-500 to-red-500",
    imagen: "/placeholder.svg?height=200&width=300&text=Cocina",
  },
  {
    id: "dormitorio",
    nombre: "Dormitorio Principal",
    descripcion: "Ventanas, puertas de closet y elementos del dormitorio",
    icono: Bed,
    color: "from-purple-500 to-pink-500",
    imagen: "/placeholder.svg?height=200&width=300&text=Dormitorio",
  },
  {
    id: "bano",
    nombre: "Baño",
    descripcion: "Puertas de ducha, ventanas y elementos de baño",
    icono: Bath,
    color: "from-cyan-500 to-blue-500",
    imagen: "/placeholder.svg?height=200&width=300&text=Baño",
  },
  {
    id: "exterior",
    nombre: "Área Exterior",
    descripcion: "Puertas principales, ventanas exteriores y fachada",
    icono: Trees,
    color: "from-green-500 to-emerald-500",
    imagen: "/placeholder.svg?height=200&width=300&text=Área+Exterior",
  },
  {
    id: "oficina",
    nombre: "Oficina/Estudio",
    descripcion: "Ventanas de oficina, puertas y elementos de trabajo",
    icono: Briefcase,
    color: "from-gray-600 to-gray-700",
    imagen: "/placeholder.svg?height=200&width=300&text=Oficina",
  },
  {
    id: "garage",
    nombre: "Garaje",
    descripcion: "Puertas de garaje, ventanas y elementos de almacenamiento",
    icono: Car,
    color: "from-yellow-500 to-orange-500",
    imagen: "/placeholder.svg?height=200&width=300&text=Garaje",
  },
  {
    id: "comercial",
    nombre: "Espacio Comercial",
    descripcion: "Vitrinas, puertas comerciales y elementos de negocio",
    icono: Building,
    color: "from-indigo-500 to-purple-500",
    imagen: "/placeholder.svg?height=200&width=300&text=Comercial",
  },
  {
    id: "premium",
    nombre: "Área Premium",
    descripcion: "Elementos de lujo, diseños especiales y acabados premium",
    icono: Crown,
    color: "from-yellow-400 to-yellow-600",
    imagen: "/placeholder.svg?height=200&width=300&text=Premium",
  },
  {
    id: "personalizado",
    nombre: "Personalizado",
    descripcion: "Crear un grupo completamente personalizado",
    icono: Sparkles,
    color: "from-pink-500 to-rose-500",
    imagen: null,
  },
]

export default function GruposManager({
  grupos,
  grupoActivo,
  items,
  onGrupoSeleccionado,
  onCrearGrupo,
  onEliminarGrupo,
  onActualizarGrupo,
}: GruposManagerProps) {
  const { toast } = useToast()
  const [modalCrear, setModalCrear] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [grupoEditando, setGrupoEditando] = useState<any>(null)
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<any>(null)
  const [paso, setPaso] = useState(1) // 1: Seleccionar plantilla, 2: Personalizar
  const [guardandoImagen, setGuardandoImagen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileInputEditRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    imagen: null as File | null,
    imagenPreview: "",
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImagenChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validacion = SessionManager.validarImagen(file)
    if (!validacion.valida) {
      toast({
        title: "❌ Error de imagen",
        description: validacion.error,
        variant: "destructive",
      })
      return
    }

    setGuardandoImagen(true)

    try {
      const previewUrl = URL.createObjectURL(file)
      setFormData((prev) => ({
        ...prev,
        imagen: file,
        imagenPreview: previewUrl,
      }))

      toast({
        title: "📷 Imagen cargada",
        description: `Archivo: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      })
    } catch (error) {
      toast({
        title: "❌ Error procesando imagen",
        description: "No se pudo procesar la imagen seleccionada",
        variant: "destructive",
      })
    } finally {
      setGuardandoImagen(false)
    }
  }

  const seleccionarPlantilla = (plantilla: any) => {
    setPlantillaSeleccionada(plantilla)

    if (plantilla.id === "personalizado") {
      // Para personalizado, ir directo al paso 2 con campos vacíos
      setFormData({
        nombre: "",
        descripcion: "",
        imagen: null,
        imagenPreview: "",
      })
    } else {
      // Para plantillas predefinidas, llenar los campos
      setFormData({
        nombre: plantilla.nombre,
        descripcion: plantilla.descripcion,
        imagen: null,
        imagenPreview: plantilla.imagen || "",
      })
    }

    setPaso(2)

    toast({
      title: "🎨 Plantilla seleccionada",
      description: `Has seleccionado: ${plantilla.nombre}`,
    })
  }

  const handleCrearGrupo = async () => {
    if (!formData.nombre.trim()) {
      toast({
        title: "⚠️ Campo requerido",
        description: "El nombre del grupo es requerido",
        variant: "destructive",
      })
      return
    }

    setGuardandoImagen(true)

    try {
      onCrearGrupo(formData.nombre, formData.imagen || undefined, formData.descripcion)
      resetForm()
      setModalCrear(false)

      toast({
        title: "🎉 ¡Grupo creado exitosamente!",
        description: `El grupo "${formData.nombre}" ha sido creado y ${formData.imagen ? "la imagen se guardará automáticamente" : "está listo para usar"}`,
        duration: 4000,
      })
    } catch (error) {
      toast({
        title: "❌ Error creando grupo",
        description: "No se pudo crear el grupo. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setGuardandoImagen(false)
    }
  }

  const handleEditarGrupo = async () => {
    if (!formData.nombre.trim()) {
      toast({
        title: "⚠️ Campo requerido",
        description: "El nombre del grupo es requerido",
        variant: "destructive",
      })
      return
    }

    setGuardandoImagen(true)

    try {
      onActualizarGrupo(grupoEditando.id, {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        imagen: formData.imagen,
      })

      resetForm()
      setModalEditar(false)
      setGrupoEditando(null)

      toast({
        title: "✅ Grupo actualizado",
        description: `El grupo "${formData.nombre}" ha sido actualizado ${formData.imagen ? "con nueva imagen" : "correctamente"}`,
      })
    } catch (error) {
      toast({
        title: "❌ Error actualizando grupo",
        description: "No se pudo actualizar el grupo. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setGuardandoImagen(false)
    }
  }

  const abrirModalEditar = (grupo: any) => {
    setGrupoEditando(grupo)
    setFormData({
      nombre: grupo.nombre,
      descripcion: grupo.descripcion || "",
      imagen: null,
      imagenPreview: grupo.imagenUrl || "",
    })
    setModalEditar(true)
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      imagen: null,
      imagenPreview: "",
    })
    setPlantillaSeleccionada(null)
    setPaso(1)
  }

  const contarItemsPorGrupo = (grupoId: string) => {
    return items.filter((item) => item.grupoId === grupoId || (!item.grupoId && grupoId === "default")).length
  }

  const eliminarImagen = () => {
    setFormData((prev) => ({
      ...prev,
      imagen: null,
      imagenPreview: "",
    }))

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    if (fileInputEditRef.current) {
      fileInputEditRef.current.value = ""
    }

    toast({
      title: "🗑️ Imagen eliminada",
      description: "La imagen ha sido eliminada del grupo",
    })
  }

  const volverAPaso1 = () => {
    setPaso(1)
    setPlantillaSeleccionada(null)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <FolderOpen className="w-5 h-5 mr-2" />
            Gestión de Grupos ({grupos.length})
            {grupos.some((g) => g.imagenGuardada) && (
              <Badge className="ml-2 bg-green-100 text-green-800">
                <HardDrive className="w-3 h-3 mr-1" />
                Con imágenes guardadas
              </Badge>
            )}
          </CardTitle>
          <Dialog
            open={modalCrear}
            onOpenChange={(open) => {
              setModalCrear(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Grupo
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {paso === 1 ? "🎨 Selecciona una Plantilla" : "✨ Personaliza tu Grupo"}
                </DialogTitle>
              </DialogHeader>

              {paso === 1 ? (
                // Paso 1: Selección de plantilla
                <div className="space-y-6 py-4">
                  <div className="text-center">
                    <p className="text-gray-600 mb-6">
                      Elige una plantilla para comenzar rápidamente o crea un grupo personalizado
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PLANTILLAS_GRUPOS.map((plantilla) => {
                      const IconoComponente = plantilla.icono
                      return (
                        <Card
                          key={plantilla.id}
                          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300 group"
                          onClick={() => seleccionarPlantilla(plantilla)}
                        >
                          <CardContent className="p-4">
                            <div className="text-center space-y-3">
                              <div
                                className={`w-16 h-16 rounded-full bg-gradient-to-r ${plantilla.color} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-200`}
                              >
                                <IconoComponente className="w-8 h-8 text-white" />
                              </div>

                              <div>
                                <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                                  {plantilla.nombre}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{plantilla.descripcion}</p>
                              </div>

                              {plantilla.id === "personalizado" && (
                                <Badge className="bg-gradient-to-r from-pink-500 to-rose-500">
                                  <Zap className="w-3 h-3 mr-1" />
                                  Personalizado
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ) : (
                // Paso 2: Personalización
                <div className="space-y-6 py-4">
                  {plantillaSeleccionada && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-r ${plantillaSeleccionada.color} flex items-center justify-center`}
                          >
                            <plantillaSeleccionada.icono className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">Plantilla: {plantillaSeleccionada.nombre}</p>
                            <p className="text-sm text-gray-600">{plantillaSeleccionada.descripcion}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={volverAPaso1}>
                          Cambiar Plantilla
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Información del grupo */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center">
                          <FolderOpen className="w-4 h-4 mr-2" />
                          Nombre del Grupo
                        </Label>
                        <Input
                          value={formData.nombre}
                          onChange={(e) => handleInputChange("nombre", e.target.value)}
                          placeholder="Ej: Área Exterior, Cocina, etc."
                          className="border-2 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center">
                          <Edit className="w-4 h-4 mr-2" />
                          Descripción
                        </Label>
                        <Textarea
                          value={formData.descripcion}
                          onChange={(e) => handleInputChange("descripcion", e.target.value)}
                          placeholder="Descripción del grupo..."
                          rows={4}
                          className="border-2 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Imagen del grupo */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Imagen del Grupo
                        {formData.imagen && (
                          <Badge className="ml-2 bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Se guardará físicamente
                          </Badge>
                        )}
                      </Label>

                      {formData.imagenPreview ? (
                        <div className="relative">
                          <img
                            src={formData.imagenPreview || "/placeholder.svg"}
                            alt="Vista previa"
                            className="w-full h-48 object-cover rounded-lg border-2 border-blue-300 shadow-md"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 rounded-full w-8 h-8 shadow-lg"
                            onClick={eliminarImagen}
                            disabled={guardandoImagen}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          {formData.imagen && (
                            <Badge className="absolute bottom-2 left-2 bg-green-500">
                              <HardDrive className="w-3 h-3 mr-1" />
                              Se guardará en disco
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                          <p className="text-sm text-gray-600 font-medium">Haga clic para seleccionar una imagen</p>
                          <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF o WebP (máx. 5MB)</p>
                          <p className="text-xs text-blue-600 mt-2 font-medium">
                            💾 La imagen se guardará físicamente en el servidor
                          </p>
                          <Input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImagenChange}
                            className="hidden"
                            disabled={guardandoImagen}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" onClick={volverAPaso1}>
                      ← Volver a Plantillas
                    </Button>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setModalCrear(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCrearGrupo}
                        disabled={guardandoImagen}
                        className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
                      >
                        {guardandoImagen ? (
                          <>
                            <Zap className="w-4 h-4 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Crear Grupo
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {grupos.map((grupo) => {
            const itemsCount = contarItemsPorGrupo(grupo.id)
            const isActive = grupo.id === grupoActivo

            return (
              <Card
                key={grupo.id}
                className={`cursor-pointer transition-all border-2 hover:shadow-lg ${
                  isActive
                    ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => {
                  onGrupoSeleccionado(grupo.id)
                  toast({
                    title: "📁 Grupo seleccionado",
                    description: `Ahora estás trabajando en: ${grupo.nombre}`,
                  })
                }}
              >
                <CardContent className="p-4">
                  {/* Imagen del grupo */}
                  <div className="relative mb-3">
                    {grupo.imagenUrl ? (
                      <img
                        src={grupo.imagenUrl || "/placeholder.svg"}
                        alt={grupo.nombre}
                        className="w-full h-24 object-cover rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="w-full h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <FolderOpen className="w-8 h-8 text-blue-500" />
                      </div>
                    )}

                    {/* Badge de items */}
                    <Badge
                      className={`absolute -top-2 -right-2 ${
                        itemsCount > 0
                          ? "bg-gradient-to-r from-green-500 to-green-600"
                          : "bg-gradient-to-r from-gray-400 to-gray-500"
                      }`}
                    >
                      {itemsCount}
                    </Badge>

                    {/* Badge de imagen guardada */}
                    {grupo.imagenGuardada && (
                      <Badge className="absolute -top-2 -left-2 bg-green-500">
                        <HardDrive className="w-3 h-3" />
                      </Badge>
                    )}
                  </div>

                  {/* Información del grupo */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm truncate">{grupo.nombre}</h3>
                      {isActive && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          Activo
                        </Badge>
                      )}
                    </div>

                    {grupo.descripcion && <p className="text-xs text-gray-600 line-clamp-2">{grupo.descripcion}</p>}

                    {/* Estadísticas */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {itemsCount} items
                      </div>
                      <div className="flex items-center space-x-2">
                        {grupo.imagenUrl && (
                          <div className="flex items-center">
                            <ImageIcon className="w-3 h-3 mr-1" />
                            Imagen
                          </div>
                        )}
                        {grupo.imagenGuardada && (
                          <div className="flex items-center text-green-600">
                            <HardDrive className="w-3 h-3 mr-1" />
                            Guardada
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    {grupo.id !== "default" && (
                      <div className="flex justify-end space-x-1 pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-blue-100 hover:text-blue-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            abrirModalEditar(grupo)
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-red-100 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEliminarGrupo(grupo.id)
                            toast({
                              title: "🗑️ Grupo eliminado",
                              description: `El grupo "${grupo.nombre}" ha sido eliminado. Los items se movieron al grupo general.`,
                              variant: "destructive",
                            })
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Modal de Editar */}
        <Dialog open={modalEditar} onOpenChange={setModalEditar}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">✏️ Editar Grupo</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Nombre del Grupo</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  placeholder="Nombre del grupo"
                  className="border-2 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Descripción</Label>
                <Textarea
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  placeholder="Descripción del grupo..."
                  rows={3}
                  className="border-2 focus:border-blue-500"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center">
                  Imagen del Grupo
                  {formData.imagen && (
                    <Badge className="ml-2 bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Nueva imagen
                    </Badge>
                  )}
                </Label>

                {formData.imagenPreview ? (
                  <div className="relative">
                    <img
                      src={formData.imagenPreview || "/placeholder.svg"}
                      alt="Vista previa"
                      className="w-full h-48 object-cover rounded-lg border-2 border-blue-300"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 rounded-full w-8 h-8"
                      onClick={eliminarImagen}
                      disabled={guardandoImagen}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    {formData.imagen && (
                      <Badge className="absolute bottom-2 left-2 bg-green-500">
                        <HardDrive className="w-3 h-3 mr-1" />
                        Se guardará en disco
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => fileInputEditRef.current?.click()}
                  >
                    <Upload className="w-10 h-10 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Haga clic para seleccionar una imagen</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF o WebP (máx. 5MB)</p>
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      💾 La imagen se guardará físicamente en el servidor
                    </p>
                    <Input
                      ref={fileInputEditRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImagenChange}
                      className="hidden"
                      disabled={guardandoImagen}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setModalEditar(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleEditarGrupo}
                  disabled={guardandoImagen}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
                >
                  {guardandoImagen ? (
                    <>
                      <Zap className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
