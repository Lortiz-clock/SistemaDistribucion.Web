import { useState } from 'react'
import { agregarProducto } from '../services/productoServices'
import type { ProductoAgregar } from '../interfaces/ProductoAgregar'
import './AgregarProductoPage.css'
import { useNavigate } from 'react-router-dom'

function AgregarProductoPage() {

  const [producto, setProducto] =
    useState<ProductoAgregar>({
      nombre: '',
      costo: 0,
      margenMinimo: 0,
      precioMinimo: 0,
      stockMinimo: 0,
      estado: true,
      codigoCategoria: 0,
      fechaVencimiento:'',
      unidadesPorCaja: 0
    })

    const navigate = useNavigate()
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  const manejarCambio = (
    evento:
      React.ChangeEvent<
        HTMLInputElement |
        HTMLTextAreaElement |
        HTMLSelectElement
      >
  ) => {

   const { name, value } = evento.target;

    // Convertimos los campos numéricos y booleanos de acuerdo al esquema
    const camposNumericos = [
      'costo',
      'margenMinimo',
      'stockMinimo',
      'codigoCategoria',
      'unidadesPorCaja',
    ];

    setProducto({
      ...producto,
      [name]: camposNumericos.includes(name)
        ? Number(value)
        : name === 'estado'
          ? value === 'true'
          : value,
    });
  };

  const guardarProducto = async (evento: React.FormEvent) => {
    evento.preventDefault();

    try {
      const respuesta = await agregarProducto(producto);

      setMensaje(respuesta.mensaje);
      setExito(respuesta.exito);

      if (respuesta.exito) {
        setProducto({
          nombre: '',
          costo: 0,
          margenMinimo: 0,
          precioMinimo: 0,
          stockMinimo: 0,
          estado: true,
          codigoCategoria: 0,
          fechaVencimiento: '',
          unidadesPorCaja : 0
        });
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.');
      setExito(false);
    }
  };

  return (
    <div className="agregar-producto-page">
      <div className="agregar-producto-container">
        <div className="agregar-producto-header">
          <h1 className="agregar-producto-title">Agregar Producto</h1>
          <p className="agregar-producto-subtitle">
            Registra un nuevo producto en el catálogo.
          </p>
        </div>

        <div className="agregar-producto-card">
          <div className="agregar-producto-card-header">
            <h2>Información del Producto</h2>
          </div>

          {mensaje && (
            <div
              className={
                exito ? 'alert alert-success' : 'alert alert-danger'
              }
            >
              {mensaje}
            </div>
          )}

          <form onSubmit={guardarProducto}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Nombre del Producto</label>
                <input
                  type="text"
                  className="form-control"
                  name="nombre"
                  value={producto.nombre}
                  onChange={manejarCambio}
                  maxLength={300}
                  required
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Código Categoría</label>
                <input
                  type="number"
                  className="form-control"
                  name="codigoCategoria"
                  value={producto.codigoCategoria}
                  onChange={manejarCambio}
                  min="1"
                  required
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Estado</label>
                <select
                  className="form-select"
                  name="estado"
                  value={String(producto.estado)}
                  onChange={manejarCambio}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div className="col-md-3 mb-3">
                <label className="form-label">Costo</label>
                <input
                  type="number"
                  className="form-control"
                  name="costo"
                  value={producto.costo}
                  onChange={manejarCambio}
                  step="0.01"
                  required
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Margen Mínimo (%)</label>
                <input
                  type="number"
                  className="form-control"
                  name="margenMinimo"
                  value={producto.margenMinimo}
                  onChange={manejarCambio}
                  step="0.01"
                  required
                />
              </div>

              <div className="col-md-3 mb-3">
             <label className="form-label">Unidades por Caja</label>
             <input
              type="number"
              className="form-control"
              name="unidadesPorCaja"
              value={producto.unidadesPorCaja}
              onChange={manejarCambio}
              min="1"
               />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Stock Mínimo</label>
                <input
                  type="number"
                  className="form-control"
                  name="stockMinimo"
                  value={producto.stockMinimo}
                  onChange={manejarCambio}
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Fecha de Vencimiento</label>
                <input
                  type="date"
                  className="form-control"
                  name="fechaVencimiento"
                  value={producto.fechaVencimiento}
                  onChange={manejarCambio}
                  required
                />
              </div>
            </div>

            <div className="agregar-producto-actions">
              <button type="submit" className="btn btn-primary">
                Guardar Producto
              </button>

            <button 
        type="button" 
        className="btn btn-secondary" 
        onClick={() => navigate('/dashboard/productos')}
      >
        Regresar
      </button>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgregarProductoPage;
