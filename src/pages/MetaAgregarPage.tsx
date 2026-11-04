import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { agregarMeta } from '../services/metaService'
import { consultarEmpleados } from '../services/empleadoServices'
import type { EmpleadoConsulta } from '../interfaces/EmpleadoConsulta'

const nombreCompleto = (e: EmpleadoConsulta) =>
  [e.primerNombre, e.segundoNombre, e.primerApellido, e.segundoApellido]
    .filter(Boolean)
    .join(' ')

export default function MetaAgregarPage() {
  const navigate = useNavigate()

  const [vendedores, setVendedores] = useState<EmpleadoConsulta[]>([])
  const [codigoEmpleado, setCodigoEmpleado] = useState('')
  const [utilidadSemanal, setUtilidadSemanal] = useState('')
  const [vigenteDesde, setVigenteDesde] = useState('')
  const [estado, setEstado] = useState(true)

  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)
  const DIA_INICIO_META = 2

  useEffect(() => {
    const cargarVendedores = async () => {
      try {
        const respuesta = await consultarEmpleados()

        if (respuesta.exito && Array.isArray(respuesta.datos)) {
          setVendedores(
            respuesta.datos.filter(
              (e) =>
                e.estado && e.nombrePuesto.toLowerCase().includes('vendedor')
            )
          )
        }
      } catch {
        setMensaje('No fue posible cargar la lista de vendedores.')
      }
    }

    cargarVendedores()
  }, [])

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    setMensaje('')

    const monto = Number(utilidadSemanal)

    if (!codigoEmpleado) {
      setMensaje('Debe seleccionar un vendedor.')
      return
    }
    if (!monto || monto <= 0) {
      setMensaje('La utilidad semanal debe ser mayor a cero.')
      return
    }
    if (!vigenteDesde) {
      setMensaje('Debe indicar la fecha de inicio.')
      return
    }
    // 'T00:00:00' evita que la fecha se corra un día por la zona horaria
    if (new Date(vigenteDesde + 'T00:00:00').getDay() !== DIA_INICIO_META) {
  setMensaje('La meta debe iniciar un martes.')
  return
}

    try {
      setGuardando(true)

      const respuesta = await agregarMeta({
        codigoEmpleado: Number(codigoEmpleado),
        utilidadSemanal: monto,
        vigenteDesde,
        estado,
      })

      if (respuesta.exito) {
        navigate('/dashboard/metas')
      } else {
        setMensaje(respuesta.mensaje)
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="meta-page pagina-lista">
      <div className="pagina-lista-interna">
        <div className="mb-3">
          <h1>Agregar Meta</h1>
          <p>Registra una nueva meta de utilidad semanal para un vendedor.</p>
        </div>

        <div className="tarjeta-lista">
          {mensaje && (
            <div className="alert alert-danger" role="alert">
              {mensaje}
            </div>
          )}

          <form onSubmit={guardar}>
            <div className="mb-3">
              <label className="form-label">Vendedor</label>
              <select
                className="form-select"
                value={codigoEmpleado}
                onChange={(e) => setCodigoEmpleado(e.target.value)}
              >
                <option value="">Seleccione un vendedor</option>
                {vendedores.map((v) => (
                  <option key={v.codigoEmpleado} value={v.codigoEmpleado}>
                    {nombreCompleto(v)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Utilidad semanal</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={utilidadSemanal}
                onChange={(e) => setUtilidadSemanal(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Vigente desde (martes)</label>
              <input
                type="date"
                className="form-control"
                value={vigenteDesde}
                onChange={(e) => setVigenteDesde(e.target.value)}
              />
            </div>

            <div className="form-check mb-3">
              <input
                id="estadoMeta"
                type="checkbox"
                className="form-check-input"
                checked={estado}
                onChange={(e) => setEstado(e.target.checked)}
              />
              <label htmlFor="estadoMeta" className="form-check-label">
                Meta activa (desactiva la meta actual del vendedor)
              </label>
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={guardando}
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
              <Link to="/dashboard/metas" className="btn btn-secondary">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}