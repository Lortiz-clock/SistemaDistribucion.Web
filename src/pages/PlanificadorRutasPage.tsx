import { useCallback, useEffect, useState } from 'react'
import type { ChangeEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import {
  DndContext,
  useDndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MapPin, Trash2, UserPlus } from 'lucide-react'
import {
  asignarClientes,
  obtenerClientesDisponibles,
  obtenerRuta,
  obtenerVendedores,
  reordenarRuta,
  retirarCliente
} from '../services/planificadorService'
import type { ClienteDisponible } from '../interfaces/ClienteDisponible'
import type { ClienteRutaPlan } from '../interfaces/ClienteRutaPlan'
import type { VendedorPuesto } from '../interfaces/VendedorPuesto'

const DIAS = [
  { v: 1, n: 'Lunes' },
  { v: 2, n: 'Martes' },
  { v: 3, n: 'Miércoles' },
  { v: 4, n: 'Jueves' },
  { v: 5, n: 'Viernes' },
  { v: 6, n: 'Sábado' }
]

interface Alerta {
  tipo: 'success' | 'warning' | 'danger'
  texto: string
}

// Mouse: arrastre inmediato. El tacto lo maneja TouchSensor (presión larga),
// así arrastrar filas enteras no pelea con el scroll del celular.
class SensorMouse extends PointerSensor {
  static activators: typeof PointerSensor.activators = [
    {
      eventName: 'onPointerDown',
      handler: ({ nativeEvent: event }: ReactPointerEvent) => event.pointerType === 'mouse'
    }
  ]
}

interface FilaClienteProps {
  cliente: ClienteRutaPlan
  posicion: number
  ocupado: boolean
  onRetirar: (codigoClienteRuta: number) => void
}

function FilaCliente({ cliente, posicion, ocupado, onRetirar }: FilaClienteProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: cliente.codigoClienteRuta })

  const estilo = {
    transform: CSS.Transform.toString(transform) ?? undefined,
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <li className="list-group-item d-flex align-items-center gap-2" ref={setNodeRef} style={estilo}>
      <span
        {...attributes}
        {...listeners}
        title="Arrastra para reordenar"
        style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
      >
        <GripVertical size={18} className="text-muted" />
      </span>

      <span className="badge bg-dark">{posicion}</span>

      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <div className="fw-semibold text-truncate">{cliente.nombreCliente}</div>
        <small className="text-muted d-flex align-items-center gap-1">
          <MapPin size={12} className="flex-shrink-0" />
          <span className="text-truncate">{cliente.direccion || 'Sin dirección registrada'}</span>
        </small>
      </div>

      <button
        type="button"
        className="btn btn-sm btn-outline-danger"
        disabled={ocupado}
        onClick={() => onRetirar(cliente.codigoClienteRuta)}
        title="Quitar de la ruta"
      >
        <Trash2 size={16} />
      </button>
    </li>
  )
}

interface FilaDisponibleProps {
  cliente: ClienteDisponible
  marcado: boolean
  onAlternar: (codigoCliente: number) => void
}

function FilaDisponible({ cliente, marcado, onAlternar }: FilaDisponibleProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `disp-${cliente.codigoCliente}`,
    data: { codigoCliente: cliente.codigoCliente }
  })

  const estilo = {
    transform: CSS.Translate.toString(transform) ?? undefined,
    opacity: isDragging ? 0.4 : 1,
    touchAction: 'manipulation' as const
  }

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="list-group-item d-flex align-items-center gap-2"
      style={estilo}
    >
      <GripVertical size={16} className="text-muted flex-shrink-0" />
      <input
        className="form-check-input mt-0 flex-shrink-0"
        type="checkbox"
        checked={marcado}
        onChange={() => onAlternar(cliente.codigoCliente)}
        id={`cli-${cliente.codigoCliente}`}
      />
      <label
        htmlFor={`cli-${cliente.codigoCliente}`}
        className="flex-grow-1 mb-0"
        style={{ cursor: 'grab' }}
      >
        {cliente.nombre}
      </label>
    </li>
  )
}

// Zona verde punteada que se ilumina cuando arrastras un cliente disponible encima
function ZonaRuta({ children }: { children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'zona-ruta' })
  const { active, over } = useDndContext()

  const arrastrandoDisponible = !!active && String(active.id).startsWith('disp-')
  const encima = !!over && (over.id === 'zona-ruta' || typeof over.id === 'number')
  const resaltar = arrastrandoDisponible && (isOver || encima)

  return (
    <div
      ref={setNodeRef}
      className="rounded-3 p-1"
      style={{
        border: resaltar ? '2px dashed #198754' : '2px dashed transparent',
        backgroundColor: resaltar ? 'rgba(25, 135, 84, 0.08)' : undefined,
        transition: 'border-color 150ms, background-color 150ms',
        minHeight: 120
      }}
    >
      {children}
    </div>
  )
}

export default function PlanificadorRutasPage() {
  const [vendedores, setVendedores] = useState<VendedorPuesto[]>([])
  const [vendedor, setVendedor] = useState(0)
  const [dia, setDia] = useState(1)
  const [ruta, setRuta] = useState<ClienteRutaPlan[]>([])
  const [disponibles, setDisponibles] = useState<ClienteDisponible[]>([])
  const [marcados, setMarcados] = useState<number[]>([])
  const [cargando, setCargando] = useState(true)
  const [ocupado, setOcupado] = useState(false)
  const [alerta, setAlerta] = useState<Alerta | null>(null)

  const sensors = useSensors(
    useSensor(SensorMouse, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor)
  )

  const cargarRuta = useCallback(async (codigoEmpleado: number, diaSemana: number) => {
    setCargando(true)
    try {
      const [resRuta, resDisponibles] = await Promise.all([
        obtenerRuta(codigoEmpleado, diaSemana),
        obtenerClientesDisponibles(diaSemana)
      ])

      if (resRuta.exito) setRuta(resRuta.datos ?? [])
      else setAlerta({ tipo: 'danger', texto: resRuta.mensaje })

      if (resDisponibles.exito) {
        setDisponibles(resDisponibles.datos ?? [])
        setMarcados([])
      } else {
        setAlerta({ tipo: 'danger', texto: resDisponibles.mensaje })
      }
    } catch {
      setAlerta({ tipo: 'danger', texto: 'No se pudo cargar la ruta. Revisa tu conexión.' })
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    let cancelado = false

    const cargar = async () => {
      try {
        const res = await obtenerVendedores('Vendedor')
        if (cancelado) return

        if (!res.exito) {
          setAlerta({ tipo: 'danger', texto: res.mensaje })
          setCargando(false)
          return
        }

        const lista = res.datos ?? []
        setVendedores(lista)

        if (lista.length === 0) {
          setAlerta({ tipo: 'warning', texto: 'No hay empleados con el puesto de Vendedor.' })
          setCargando(false)
          return
        }

        setVendedor(lista[0].codigoEmpleado)
      } catch {
        if (!cancelado) {
          setAlerta({ tipo: 'danger', texto: 'No se pudo cargar la lista de vendedores.' })
          setCargando(false)
        }
      }
    }

    void cargar()
    return () => {
      cancelado = true
    }
  }, [])

  useEffect(() => {
    if (vendedor > 0) void cargarRuta(vendedor, dia)
  }, [vendedor, dia, cargarRuta])

  const alternarMarcado = (codigoCliente: number) => {
    setMarcados(prev =>
      prev.includes(codigoCliente)
        ? prev.filter(c => c !== codigoCliente)
        : [...prev, codigoCliente]
    )
  }

  const asignarMarcados = async () => {
    if (marcados.length === 0) return
    setOcupado(true)
    setAlerta(null)
    try {
      const res = await asignarClientes({
        codigoEmpleado: vendedor,
        diaSemana: dia,
        clientes: marcados
      })
      if (res.exito) setAlerta({ tipo: 'success', texto: res.mensaje })
      else setAlerta({ tipo: 'warning', texto: res.mensaje })
      await cargarRuta(vendedor, dia)
    } catch {
      setAlerta({ tipo: 'danger', texto: 'Error de conexión al asignar clientes.' })
    } finally {
      setOcupado(false)
    }
  }

  const retirar = async (codigoClienteRuta: number) => {
    if (!window.confirm('¿Quitar este cliente de la ruta?')) return
    setOcupado(true)
    try {
      const res = await retirarCliente(codigoClienteRuta)
      if (res.exito) setAlerta({ tipo: 'success', texto: res.mensaje || 'Cliente retirado de la ruta.' })
      else setAlerta({ tipo: 'warning', texto: res.mensaje })
      await cargarRuta(vendedor, dia)
    } catch {
      setAlerta({ tipo: 'danger', texto: 'Error de conexión al retirar el cliente.' })
    } finally {
      setOcupado(false)
    }
  }

  const alSoltar = async (evento: DragEndEvent) => {
    const { active, over } = evento
    if (!over) return

    const idActivo = String(active.id)

    // ── Caso 1: soltó un cliente disponible sobre la ruta → asignarlo ──
    if (idActivo.startsWith('disp-')) {
      const cayoEnRuta =
        over.id === 'zona-ruta' || ruta.some(c => c.codigoClienteRuta === over.id)
      if (!cayoEnRuta) return

      const codigoCliente = Number(active.data.current?.codigoCliente)
      if (!codigoCliente) return

      setOcupado(true)
      try {
        const res = await asignarClientes({
          codigoEmpleado: vendedor,
          diaSemana: dia,
          clientes: [codigoCliente]
        })
        if (res.exito) setAlerta({ tipo: 'success', texto: res.mensaje })
        else setAlerta({ tipo: 'warning', texto: res.mensaje })
        await cargarRuta(vendedor, dia)
      } catch {
        setAlerta({ tipo: 'danger', texto: 'Error de conexión al asignar el cliente.' })
      } finally {
        setOcupado(false)
      }
      return
    }

    // ── Caso 2: reordenar dentro de la ruta ──
    if (active.id === over.id) return

    const indiceViejo = ruta.findIndex(c => c.codigoClienteRuta === active.id)
    const indiceNuevo = ruta.findIndex(c => c.codigoClienteRuta === over.id)
    if (indiceViejo < 0 || indiceNuevo < 0) return

    const nuevaRuta = arrayMove(ruta, indiceViejo, indiceNuevo)
    setRuta(nuevaRuta)
    setOcupado(true)
    try {
      const res = await reordenarRuta({
        codigoRuta: nuevaRuta[0].codigoRuta,
        asignaciones: nuevaRuta.map(c => c.codigoClienteRuta)
      })
      if (!res.exito) {
        setAlerta({ tipo: 'warning', texto: res.mensaje })
        await cargarRuta(vendedor, dia)
      }
    } catch {
      setAlerta({ tipo: 'danger', texto: 'No se pudo guardar el nuevo orden.' })
      await cargarRuta(vendedor, dia)
    } finally {
      setOcupado(false)
    }
  }

  const nombreDia = DIAS.find(d => d.v === dia)?.n ?? ''

  return (
    <div className="container-fluid p-3 p-lg-4">
      <h2 className="mb-1">Planificador de rutas</h2>
      <p className="text-muted">
        Arrastra clientes hasta la ruta para asignarlos y ordena el recorrido con la manija.
      </p>

      {alerta && (
        <div className={`alert alert-${alerta.tipo} alert-dismissible fade show`} role="alert">
          {alerta.texto}
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setAlerta(null)} />
        </div>
      )}

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label fw-semibold">Vendedor</label>
          <select
            className="form-select"
            value={vendedor}
            disabled={vendedores.length === 0}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setVendedor(Number(e.target.value))}
          >
            {vendedores.length === 0 && <option value={0}>(sin vendedores)</option>}
            {vendedores.map(v => (
              <option key={v.codigoEmpleado} value={v.codigoEmpleado}>
                {v.nombreCompleto}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label fw-semibold">Día</label>
          <div className="d-flex flex-wrap gap-2">
            {DIAS.map(d => (
              <button
                key={d.v}
                type="button"
                className={`btn btn-sm ${dia === d.v ? 'btn-dark' : 'btn-outline-dark'}`}
                onClick={() => setDia(d.v)}
              >
                {d.n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {cargando ? (
        <div className="d-flex justify-content-center align-items-center gap-2 text-muted py-5">
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
          Cargando…
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={alSoltar}>
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0">
                  Ruta del {nombreDia} <span className="badge bg-primary">{ruta.length}</span>
                </h5>
                {ocupado && <span className="spinner-border spinner-border-sm text-muted" role="status" />}
              </div>

              <ZonaRuta>
                {ruta.length === 0 ? (
                  <div className="border rounded-3 p-4 text-center text-muted bg-light">
                    Sin clientes para el {nombreDia.toLowerCase()}. Arrástralos aquí desde la derecha.
                  </div>
                ) : (
                  <SortableContext
                    items={ruta.map(c => c.codigoClienteRuta)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul className="list-group">
                      {ruta.map((c, i) => (
                        <FilaCliente
                          key={c.codigoClienteRuta}
                          cliente={c}
                          posicion={i + 1}
                          ocupado={ocupado}
                          onRetirar={retirar}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                )}
              </ZonaRuta>

              <small className="text-muted d-block mt-2">
                Suelta clientes aquí para asignarlos · la manija reordena · se guarda solo.
              </small>
            </div>

            <div className="col-lg-6">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0">
                  Clientes disponibles <span className="badge bg-secondary">{disponibles.length}</span>
                </h5>
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  disabled={ocupado || marcados.length === 0}
                  onClick={asignarMarcados}
                >
                  <UserPlus size={16} className="me-1" />
                  Asignar ({marcados.length})
                </button>
              </div>

              {disponibles.length === 0 ? (
                <div className="border rounded-3 p-4 text-center text-muted bg-light">
                  Todos los clientes ya tienen visita el {nombreDia.toLowerCase()}.
                </div>
              ) : (
                <ul className="list-group">
                  {disponibles.map(c => (
                    <FilaDisponible
                      key={c.codigoCliente}
                      cliente={c}
                      marcado={marcados.includes(c.codigoCliente)}
                      onAlternar={alternarMarcado}
                    />
                  ))}
                </ul>
              )}

              <small className="text-muted d-block mt-2">
                Arrastra un cliente hacia la ruta · en el celular mantén presionado medio segundo y mueve.
              </small>
            </div>
          </div>
        </DndContext>
      )}
    </div>
  )
}