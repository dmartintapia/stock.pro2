import { alertasMock, kardexMock, movimientosMock, productosMock } from '../mock/data'

const wait = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

let productos = [...productosMock]
let movimientos = [...movimientosMock]
let kardex = [...kardexMock]

const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export async function getDashboardData() {
  await wait()

  const totalProductos = productos.length
  const stockTotal = productos.reduce((acc, p) => acc + p.stock, 0)
  const bajoMinimo = productos.filter((p) => p.stock > 0 && p.stock < p.stockMinimo)
  const sinStock = productos.filter((p) => p.stock === 0)

  const valorizadoInventario = productos.reduce((acc, p) => acc + p.stock * p.costo, 0)
  const valorPotencialVenta = productos.reduce((acc, p) => acc + p.stock * p.precio, 0)

  const porCategoria = productos.reduce((acc, producto) => {
    acc[producto.categoria] = (acc[producto.categoria] || 0) + producto.stock
    return acc
  }, {})

  const totalCategoria = Object.values(porCategoria).reduce((acc, val) => acc + val, 0) || 1
  const distribucionCategorias = Object.entries(porCategoria)
    .map(([categoria, stock]) => ({
      categoria,
      stock,
      porcentaje: Math.round((stock / totalCategoria) * 100),
    }))
    .sort((a, b) => b.stock - a.stock)

  const movimientosRecientes = [...movimientos]
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
    .slice(0, 6)

  const productosCriticos = [...productos]
    .filter((p) => p.stock <= p.stockMinimo)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6)

  return {
    resumen: {
      totalProductos,
      stockTotal,
      bajoMinimo: bajoMinimo.length,
      sinStock: sinStock.length,
      valorizadoInventario,
      valorPotencialVenta,
    },
    alertas: alertasMock,
    movimientosRecientes,
    productosCriticos,
    distribucionCategorias,
    money: {
      inventario: currency.format(valorizadoInventario),
      potencial: currency.format(valorPotencialVenta),
    },
  }
}

export async function getProductos() {
  await wait()
  return [...productos]
}

export async function createProducto(payload) {
  await wait()
  const nuevo = {
    id: Date.now(),
    ...payload,
    stock: Number(payload.stock),
    stockMinimo: Number(payload.stockMinimo),
    costo: Number(payload.costo),
    precio: Number(payload.precio),
  }
  productos = [nuevo, ...productos]
  return nuevo
}

export async function getMovimientos() {
  await wait()
  return [...movimientos]
}

export async function createMovimiento(payload) {
  await wait()
  const producto = productos.find((p) => p.id === Number(payload.productoId))
  const cantidad = Number(payload.cantidad)
  if (!producto) throw new Error('Producto no encontrado')

  if (payload.tipo === 'salida' && producto.stock < cantidad) {
    throw new Error('Stock insuficiente para registrar la salida')
  }

  producto.stock = payload.tipo === 'entrada' ? producto.stock + cantidad : producto.stock - cantidad

  const nuevoMovimiento = {
    id: Date.now(),
    fecha: payload.fecha,
    productoId: producto.id,
    producto: producto.nombre,
    tipo: payload.tipo,
    cantidad,
    referencia: payload.referencia,
  }

  movimientos = [nuevoMovimiento, ...movimientos]
  const nuevoKardex = {
    id: Date.now() + 1,
    fecha: payload.fecha,
    productoId: producto.id,
    producto: producto.nombre,
    tipo: payload.tipo,
    cantidad,
    saldo: producto.stock,
  }
  kardex = [nuevoKardex, ...kardex]

  return nuevoMovimiento
}

export async function getKardex(filters = {}) {
  await wait()
  const { productoId, tipo, desde, hasta } = filters

  return kardex.filter((item) => {
    const sameProducto = productoId ? item.productoId === Number(productoId) : true
    const sameTipo = tipo ? item.tipo === tipo : true
    const inDesde = desde ? item.fecha >= desde : true
    const inHasta = hasta ? item.fecha <= hasta : true
    return sameProducto && sameTipo && inDesde && inHasta
  })
}
