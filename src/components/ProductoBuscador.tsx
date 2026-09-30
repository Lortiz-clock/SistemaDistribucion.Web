import { useState, useRef, useEffect } from 'react'

interface Producto {
  codigoProducto: number
  nombre: string
}

interface Props {
  productos: Producto[]
  seleccionado: number
  onSeleccionar: (producto: Producto | null) => void
}

function ProductoBuscador({ productos, seleccionado, onSeleccionar }: Props) {
  const [texto, setTexto] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState(0) // índice resaltado con el teclado
  const contenedorRef = useRef<HTMLDivElement>(null)
  const itemActivoRef = useRef<HTMLLIElement | null>(null)

  // Nombre del producto ya seleccionado (lo que se muestra cuando está cerrado)
  const nombreSeleccionado = productos.find(
    (p) => p.codigoProducto === seleccionado
  )?.nombre ?? ''

  // Cerrado = muestra el nombre seleccionado. Abierto = muestra lo que escribes.
  const valorInput = abierto ? texto : nombreSeleccionado

  const filtrados =
    texto.trim() === ''
      ? productos // sin texto = lista completa (como un select normal)
      : productos.filter((p) =>
          p.nombre.toLowerCase().includes(texto.toLowerCase())
        )

  // Cierra la lista al hacer clic fuera del componente
  useEffect(() => {
    const cerrar = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [])

  // Mantiene visible la opción resaltada al navegar con flechas
  useEffect(() => {
    itemActivoRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activo, abierto])

  const abrir = () => {
    setTexto('')
    setActivo(0)
    setAbierto(true)
  }

  const elegir = (p: Producto) => {
    onSeleccionar(p)
    setAbierto(false)
  }

  const manejarTeclas = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActivo((a) => Math.min(a + 1, filtrados.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActivo((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault() // evita que envíe el formulario
      if (filtrados[activo]) elegir(filtrados[activo])
    } else if (e.key === 'Escape') {
      setAbierto(false)
    }
  }

  return (
    <div className="position-relative" ref={contenedorRef}>
      <input
        type="text"
        className="form-control"
        placeholder="Seleccione o busque..."
        value={valorInput}
        autoComplete="off"
        onFocus={abierto ? undefined : abrir}
        onClick={abierto ? undefined : abrir}
        onChange={(e) => {
          setTexto(e.target.value)
          setActivo(0)
          onSeleccionar(null) // si escribe de nuevo, invalida la selección anterior
        }}
        onKeyDown={manejarTeclas}
        style={{ paddingRight: '2rem' }}
      />

      {/* Flechita estilo <select> */}
      <span
        onClick={abierto ? () => setAbierto(false) : abrir}
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: abierto ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
          transition: 'transform 0.15s',
          cursor: 'pointer',
          color: '#6c757d',
          fontSize: '0.9rem',
          userSelect: 'none'
        }}
      >
        ▾
      </span>

      {abierto && (
        <ul
          className="list-group position-absolute shadow"
          style={{
            maxHeight: '250px',
            overflowY: 'auto',
            zIndex: 1050,
            top: '100%',
            width: '100%'
          }}
        >
          {filtrados.length === 0 ? (
            <li className="list-group-item text-muted">Sin resultados</li>
          ) : (
            filtrados.map((p, i) => (
              <li
                key={p.codigoProducto}
                ref={i === activo ? itemActivoRef : undefined}
                className={`list-group-item list-group-item-action ${i === activo ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setActivo(i)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  elegir(p)
                }}
              >
                {p.nombre}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

export default ProductoBuscador