import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { generateFileName } from "@/lib/utils/file-upload"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log("🔍 GET Producto - ID:", id)

    const { db } = await connectToDatabase()

    // Buscar producto con lookup de tipo_producto y materiales
    const producto = await db
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

    if (!producto || producto.length === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    console.log("✅ Producto encontrado:", producto[0].nombre)

    return NextResponse.json({
      success: true,
      producto: producto[0],
    })
  } catch (error) {
    console.error("❌ Error obteniendo producto:", error)
    return NextResponse.json({ error: "Error interno del servidor", details: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log("🔄 PUT Producto - ID:", id)

    const { db } = await connectToDatabase()

    // Obtener producto actual para manejar imagen anterior
    const productoActual = await db.collection("productos").findOne({ _id: id })
    if (!productoActual) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Check if request is FormData (with image) or JSON
    const contentType = request.headers.get("content-type")
    let data: any
    let nuevaImagenPath = ""

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
        estado: formData.get("estado") === "true",
        imagenActual: formData.get("imagenActual") as string,
      }

      // Handle new image upload
      const nuevaImagen = formData.get("imagen") as File
      if (nuevaImagen && nuevaImagen.size > 0) {
        console.log("📷 Procesando nueva imagen:", nuevaImagen.name)

        try {
          // Subir imagen a través de la API de uploads
          const fileName = generateFileName(nuevaImagen.name, `${id}_`)

          // Crear FormData para la subida
          const uploadFormData = new FormData()
          uploadFormData.append("file", nuevaImagen)
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
          nuevaImagenPath = uploadResult.path

          console.log("✅ Nueva imagen guardada en:", nuevaImagenPath)

          // Eliminar imagen anterior si existe y es diferente
          if (productoActual.imagen && productoActual.imagen !== nuevaImagenPath) {
            console.log("🗑️ Eliminando imagen anterior:", productoActual.imagen)

            // Llamar a la API para eliminar la imagen anterior
            await fetch(
              `${new URL("/api/uploads", request.url).toString()}?path=${encodeURIComponent(productoActual.imagen)}`,
              {
                method: "DELETE",
              },
            )
          }
        } catch (error) {
          console.error("❌ Error guardando nueva imagen:", error)
          return NextResponse.json(
            {
              error: "Error al guardar la nueva imagen",
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

    console.log("📝 Actualizando producto:", data)

    // Validar campos requeridos
    if (!data.nombre) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    if (!data.tipo_producto_id) {
      return NextResponse.json({ error: "El tipo de producto es requerido" }, { status: 400 })
    }

    // Determinar qué imagen usar
    let imagenFinal = productoActual.imagen || ""

    if (nuevaImagenPath) {
      // Usar nueva imagen
      imagenFinal = nuevaImagenPath
    } else if (data.imagenActual === "" && productoActual.imagen) {
      // Usuario eliminó la imagen actual
      console.log("🗑️ Eliminando imagen actual:", productoActual.imagen)

      // Llamar a la API para eliminar la imagen
      await fetch(
        `${new URL("/api/uploads", request.url).toString()}?path=${encodeURIComponent(productoActual.imagen)}`,
        {
          method: "DELETE",
        },
      )

      imagenFinal = ""
    } else if (data.imagenActual) {
      // Mantener imagen actual
      imagenFinal = data.imagenActual
    }

    // Preparar datos para actualizar
    const updateData = {
      nombre: data.nombre,
      identificador: data.identificador || "",
      descripcion: data.descripcion || "",
      tipo_producto_id: data.tipo_producto_id,
      categoria: data.categoria || "",
      precio_base: data.precio_base || 0,
      estado: data.estado ?? true,
      imagen: imagenFinal,
      svg: data.svg || "",
      updatedAt: new Date(),
    }

    console.log("💾 Datos a actualizar:", updateData)

    // Actualizar producto
    const result = await db.collection("productos").updateOne({ _id: id }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Obtener producto actualizado con lookup
    const productoActualizado = await db
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

    console.log("✅ Producto actualizado exitosamente")

    return NextResponse.json({
      success: true,
      message: "Producto actualizado exitosamente",
      producto: productoActualizado[0],
    })
  } catch (error) {
    console.error("❌ Error actualizando producto:", error)
    return NextResponse.json({ error: "Error interno del servidor", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log("🗑️ DELETE Producto - ID:", id)

    const { db } = await connectToDatabase()

    // Obtener producto antes de eliminar para limpiar imagen
    const producto = await db.collection("productos").findOne({ _id: id })
    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Eliminar imagen si existe
    if (producto.imagen) {
      console.log("🗑️ Eliminando imagen del producto:", producto.imagen)

      // Llamar a la API para eliminar la imagen
      await fetch(`${new URL("/api/uploads", request.url).toString()}?path=${encodeURIComponent(producto.imagen)}`, {
        method: "DELETE",
      })
    }

    // Eliminar producto
    const result = await db.collection("productos").deleteOne({ _id: id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    console.log("✅ Producto eliminado exitosamente")

    return NextResponse.json({
      success: true,
      message: "Producto eliminado exitosamente",
    })
  } catch (error) {
    console.error("❌ Error eliminando producto:", error)
    return NextResponse.json({ error: "Error interno del servidor", details: error.message }, { status: 500 })
  }
}
