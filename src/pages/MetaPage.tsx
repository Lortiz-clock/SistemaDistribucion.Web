import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { consultaMeta, editarMeta } from '../services/metaService'
import { consultarEmpleados } from '../services/empleadoServices'
import type { MetaConsulta } from '../interfaces/MetaConsulta'
import type { EmpleadoConsulta } from '../interfaces/EmpleadoConsulta'
import { isAxiosError } from 'axios'
import ConfirmarModal from '../components/ConfirmarModal'

const nombreCompleto = (e: EmpleadoConsulta) =>
  [e.primerNombre, e.segundoNombre, e.primerApellido, e.segundoApellido]
    .filter(Boolean)
    .join(' ')

export default function MetaPage() {
  const [meta, setMeta] = useState<MetaConsulta[]>([])
  const [mensaje, setMensaje] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [empleados, setEmpleados] = useState<Map<number, string>>(new Map())
  const [metaPendiente, setMetaPendiente] = useState<MetaConsulta | null>(null)

  const nombreEmpleado = (codigo: number) =>
    empleados.get(codigo) ?? String(codigo)

  const metasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase()
    return meta.filter(
      (item) =>
        item.codigoMeta.toString().includes(busqueda) ||
        nombreEmpleado(item.codigoEmpleado).toLowerCase().includes(texto)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta, busqueda, empleados])

  const cargarMeta = async () => {
    try {
      const respuesta = await consultaMeta()

      if (respuesta.exito && Array.isArray(respuesta.datos)) {
        setMeta(respuesta.datos)
        setMensaje(respuesta.mensaje)
      } else {
        setMeta([])
        setMensaje(respuesta.mensaje)
      }
    } catch (error) {
  if (isAxiosError(error) && error.response?.data?.mensaje) {
    setMensaje(error.response.data.mensaje)
  } else {
    setMensaje('No fue posible comunicarse con la API.')
  }
}
  }

  const cargarCatalogos = async () => {
    try {
      const resEmpleados = await consultarEmpleados()

      if (resEmpleados.exito && Array.isArray(resEmpleados.datos)) {
        setEmpleados(
          new Map(
            resEmpleados.datos.map((e) => [e.codigoEmpleado, nombreCompleto(e)])
          )
        )
      }
    } catch {
      // si falla, se muestran los códigos como respaldo
    }
  }

  const pedirConfirmacion = (item: MetaConsulta) => setMetaPendiente(item)

const confirmarCambio = async () => {
  if (!metaPendiente) return

  const item = metaPendiente
  setMetaPendiente(null)

  try {
    const respuesta = await editarMeta({
      codigoMeta: item.codigoMeta,
      estado: !item.estado,
    })

    if (respuesta.exito) {
      await cargarMeta()
    }
    setMensaje(respuesta.mensaje)
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.mensaje) {
      setMensaje(error.response.data.mensaje)
    } else {
      setMensaje('No fue posible comunicarse con la API.')
    }
  }
}
  useEffect(() => {
    cargarMeta()
    cargarCatalogos()
  }, [])

  return (
    <div className="meta-page pagina-lista">
      <div className="pagina-lista-interna">
        <div className="mb-3">
          <h1>Consulta de Metas</h1>
          <p>Consulta las metas de utilidad semanal de los vendedores.</p>
        </div>

        <div className="tarjeta-lista">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 m-0">Metas registradas</h2>
            <div className="d-flex align-items-center gap-3">
              <span>Total: {meta.length}</span>
              <Link
                to="/dashboard/metas/agregar"
                className="btn btn-primary btn-sm"
              >
                + Agregar Meta
              </Link>
            </div>
          </div>

          {mensaje && (
            <div className="alert alert-info" role="alert">
              {mensaje}
            </div>
          )}

          <div className="mb-3 flex-shrink-0">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por código de meta o vendedor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="tabla-scroll">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Vendedor</th>
                  <th>Utilidad semanal</th>
                  <th>Meta diaria</th>
                  <th>Vigente desde</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {metasFiltradas.length > 0 ? (
                  metasFiltradas.map((item) => (
                    <tr key={item.codigoMeta}>
                      <td>{item.codigoMeta}</td>
                      <td>{nombreEmpleado(item.codigoEmpleado)}</td>
                      <td>{item.utilidadSemanal.toFixed(2)}</td>
                      <td>{(item.utilidadSemanal / 6).toFixed(2)}</td>
                      <td>{item.vigenteDesde.slice(0, 10)}</td>
                      <td>
                        <span
                          className={`badge ${
                            item.estado ? 'bg-success' : 'bg-secondary'
                          }`}
                        >
                          {item.estado ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${
                            item.estado
                              ? 'btn-outline-danger'
                              : 'btn-outline-success'
                          }`}
                          onClick={() => pedirConfirmacion(item)}
                        >
                          {item.estado ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="sin-registros text-center">
                      No existen metas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ConfirmarModal
        visible={metaPendiente !== null}
        titulo={metaPendiente?.estado ? 'Desactivar meta' : 'Activar meta'}
        mensaje={
          metaPendiente
            ? metaPendiente.estado
              ? `${nombreEmpleado(metaPendiente.codigoEmpleado)} quedará sin meta activa. ¿Continuar?`
              : `Esto activará la meta ${metaPendiente.codigoMeta} y desactivará la meta actual de ${nombreEmpleado(metaPendiente.codigoEmpleado)}. ¿Continuar?`
            : ''
        }
        textoAceptar={metaPendiente?.estado ? 'Desactivar' : 'Activar'}
        claseAceptar={metaPendiente?.estado ? 'btn-danger' : 'btn-success'}
        onAceptar={confirmarCambio}
        onCancelar={() => setMetaPendiente(null)}
      />
    </div>
  )
}