import { useEffect, useState } from 'react'
import { getDashboardData } from '../services/dataService'

const kpiConfig = [
  { key: 'totalProductos', label: 'Productos activos', icon: '📦', color: 'primary' },
  { key: 'stockTotal', label: 'Unidades en stock', icon: '🏷️', color: 'success' },
  { key: 'bajoMinimo', label: 'Bajo stock', icon: '⚠️', color: 'warning' },
  { key: 'sinStock', label: 'Sin stock', icon: '⛔', color: 'danger' },
]

function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardData()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Cargando dashboard...</p>

  return (
    <div className="dashboard-modern">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 className="h3 mb-1">Dashboard</h1>
          <p className="text-muted mb-0">Visión general de inventario, alertas y movimientos recientes.</p>
        </div>
        <span className="badge text-bg-dark px-3 py-2">Sistema de Stock v1</span>
      </div>

      <div className="row g-3 mb-4">
        {kpiConfig.map((item) => (
          <div className="col-sm-6 col-xl-3" key={item.key}>
            <article className={`kpi-card border-${item.color}`}>
              <div className="kpi-icon">{item.icon}</div>
              <div>
                <p className="kpi-label mb-1">{item.label}</p>
                <h4 className="mb-0">{data.resumen[item.key]}</h4>
              </div>
            </article>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="card modern-card h-100">
            <div className="card-body">
              <h2 className="h5 mb-3">Valorización</h2>
              <div className="d-flex flex-column gap-3">
                <div className="metric-box">
                  <span>Valor costo inventario</span>
                  <strong>{data.money.inventario}</strong>
                </div>
                <div className="metric-box">
                  <span>Valor potencial de venta</span>
                  <strong>{data.money.potencial}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card modern-card h-100">
            <div className="card-body">
              <h2 className="h5 mb-3">Distribución por categoría</h2>
              <div className="d-flex flex-column gap-3">
                {data.distribucionCategorias.map((item) => (
                  <div key={item.categoria}>
                    <div className="d-flex justify-content-between small mb-1">
                      <span>{item.categoria}</span>
                      <span>{item.stock} uds · {item.porcentaje}%</span>
                    </div>
                    <div className="progress" style={{ height: 10 }}>
                      <div
                        className="progress-bar progress-bar-striped"
                        role="progressbar"
                        style={{ width: `${item.porcentaje}%` }}
                        aria-valuenow={item.porcentaje}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-7">
          <div className="card modern-card h-100">
            <div className="card-body table-responsive">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 mb-0">Movimientos recientes</h2>
                <span className="text-muted small">Últimos {data.movimientosRecientes.length}</span>
              </div>
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th>Cant.</th>
                    <th>Ref.</th>
                  </tr>
                </thead>
                <tbody>
                  {data.movimientosRecientes.map((mov) => (
                    <tr key={mov.id}>
                      <td>{mov.fecha}</td>
                      <td>{mov.producto}</td>
                      <td>
                        <span className={`badge ${mov.tipo === 'entrada' ? 'text-bg-success' : 'text-bg-danger'}`}>
                          {mov.tipo}
                        </span>
                      </td>
                      <td>{mov.cantidad}</td>
                      <td>{mov.referencia}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card modern-card h-100">
            <div className="card-body table-responsive">
              <h2 className="h5 mb-3">Productos críticos</h2>
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Stock</th>
                    <th>Mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.productosCriticos.map((prod) => (
                    <tr key={prod.id}>
                      <td>{prod.nombre}</td>
                      <td className="fw-semibold text-danger">{prod.stock}</td>
                      <td>{prod.stockMinimo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <section>
        <h2 className="h5 mb-3">Alertas</h2>
        <div className="d-flex flex-column gap-2">
          {data.alertas.map((alerta) => (
            <div key={alerta.id} className={`alert alert-${alerta.tipo} mb-0`} role="alert">
              {alerta.mensaje}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Dashboard
