"use client"

import ProductosTable from "@/components/productos/ProductosTable"

export default function ProductosPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Productos</h1>
        <p className="text-gray-600 mt-2">Gestiona tu catálogo de productos</p>
      </div>

      <ProductosTable />
    </div>
  )
}
