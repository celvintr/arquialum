import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { generateFileName } from "@/lib/utils/file-upload"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const { searchParams } = new URL(request.url)

    // Parámetros de paginación y filtrado
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const tipo = searchParams.get("tipo") || "all"

    const skip = (page - 1) * limit

    // Construir filtro
    const filter: any = {}

    if (search) {
      filter.$or = [
        { nombre: { $regex: search, $options: "i" } },
        { identificador: { $regex: search, $options: "i" } },
        { descripcion: { $regex: search, $options: "i" } },
      ]
    }

    if (tipo && tipo !== "all") {
      // Convertir string a ObjectId si es necesario
      try {
        filter.tipo_producto_id = new ObjectId(tipo)
      } catch {
        filter.tipo_producto_id = tipo
      }
    }

    console.log("🔍 Filtro productos:", filter)

    // Contar total de productos
    const totalProductos = await db.collection("productos").countDocuments(filter)
    const totalPages = Math.ceil(totalProductos / limit)

    // Obtener productos con lookup para tipo_producto y conteo de materiales
    const productos = await db
      .collection("productos")
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "tipos_producto",
            let: { tipoId: "$tipo_producto_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$_id", "$$tipoId"] },
                      { $eq: [{ $toString: "$_id" }, "$$tipoId"] },
                      { $eq: ["$_id", { $toObjectId: "$$tipoId" }] },
                    ],
                  },
                },
              },
            ],
            as: "tipoProducto",
          },
        },
        {
          $lookup: {
            from: "producto_materiales",
            localField: "_id",
            foreignField: "producto_id",
            as: "materiales",
          },
        },
        {
          $addFields: {
            tipoProducto: { $arrayElemAt: ["$tipoProducto", 0] },
            total_materiales: { $size: "$materiales" },
            tiene_materiales: { $gt: [{ $size: "$materiales" }, 0] },
          },
        },
        { $skip: skip },
        { $limit: limit },
        { $sort: { createdAt: -1 } },
      ])
      .toArray()

    console.log("📦 Productos obtenidos:", productos.length)

    return NextResponse.json({
      success: true,
      productos,
      pagination: {
        total: totalProductos,
        page,
        limit,
        totalPages,
      },
    })
  } catch (error) {
    console.error("❌ Error obteniendo productos:", error)
    return NextResponse.json({ error: "Error interno del servidor", details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    // Check if request is FormData (with image) or JSON
    const contentType = request.headers.get("content-type")
    let data: any
    let imagenPath = ""

    if (contentType?.includes("multipart/form-data")) {
      // Handle FormData (with image)
      const formData = await request.formData()
      data = {
        nombre: formData.get("nombre") as string,
        identificador: formData.get("identificador") as string,
        descripcion: formData.get("descripcion") as string,
        tipo_producto_id: formData.get("tipo_producto_id") as string,
        categoria: formData.get("categoria") as string,
        precio_base: Number(formData.get("precio_base")) || 0,
        svg: formData.get("svg") as string,
        activo: formData.get("activo") === "true",
      }

      // Handle image upload
      const imagen = formData.get("imagen") as File
      if (imagen && imagen.size > 0) {
        console.log("📷 Procesando imagen:", imagen.name, "Tamaño:", imagen.size)

        try {
          // Subir imagen a través de la API de uploads
          const fileName = generateFileName(imagen.name, `prod_${Date.now().toString(36)}_`)

          // Crear FormData para la subida
          const uploadFormData = new FormData()
          uploadFormData.append("file", imagen)
          uploadFormData.append("directory", "productos")
          uploadFormData.append("filename", fileName)

          // Llamar a la API de uploads
          const uploadResponse = await fetch(new URL("/api/uploads", request.url).toString(), {
            method: "POST",
            body: uploadFormData,
          })

          if (!uploadResponse.ok) {
            throw new Error("Error al subir la imagen")
          }

          const uploadResult = await uploadResponse.json()
          imagenPath = uploadResult.path

          console.log("✅ Imagen guardada en:", imagenPath)
        } catch (error) {
          console.error("❌ Error guardando imagen:", error)
          return NextResponse.json(
            {
              error: "Error al guardar la imagen",
              details: error.message,
            },
            { status: 500 },
          )
        }
      }
    } else {
      // Handle JSON data
      data = await request.json()
    }

    console.log("📝 Creando producto:", data)

    // Validar campos requeridos
    if (!data.nombre) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    if (!data.tipo_producto_id) {
      return NextResponse.json({ error: "El tipo de producto es requerido" }, { status: 400 })
    }

    // Generar ID personalizado si no se proporciona
    const id = data._id || `prod_${Date.now().toString(36)}`

    // Preparar datos para insertar
    const productoData = {
      _id: id,
      nombre: data.nombre,
      identificador: data.identificador || "",
      descripcion: data.descripcion || "",
      tipo_producto_id: data.tipo_producto_id,
      categoria: data.categoria || "",
      precio_base: data.precio_base || 0,
      estado: data.activo !== false,
      imagen: imagenPath || "",
      svg: data.svg || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("💾 Datos del producto a insertar:", productoData)

    // Insertar producto
    await db.collection("productos").insertOne(productoData)

    // Obtener el producto con datos de tipo_producto y materiales
    const productoInsertado = await db
      .collection("productos")
      .aggregate([
        { $match: { _id: id } },
        {
          $lookup: {
            from: "tipos_producto",
            let: { tipoId: "$tipo_producto_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$_id", "$$tipoId"] },
                      { $eq: [{ $toString: "$_id" }, "$$tipoId"] },
                      { $eq: ["$_id", { $toObjectId: "$$tipoId" }] },
                    ],
                  },
                },
              },
            ],
            as: "tipoProducto",
          },
        },
        {
          $lookup: {
            from: "producto_materiales",
            localField: "_id",
            foreignField: "producto_id",
            as: "materiales",
          },
        },
        {
          $addFields: {
            tipoProducto: { $arrayElemAt: ["$tipoProducto", 0] },
            total_materiales: { $size: "$materiales" },
            tiene_materiales: { $gt: [{ $size: "$materiales" }, 0] },
          },
        },
      ])
      .toArray()

    console.log("✅ Producto creado exitosamente:", productoInsertado[0])

    return NextResponse.json({
      success: true,
      message: "Producto creado exitosamente",
      producto: productoInsertado[0],
    })
  } catch (error) {
    console.error("❌ Error creando producto:", error)
    return NextResponse.json({ error: "Error interno del servidor", details: error.message }, { status: 500 })
  }
}
