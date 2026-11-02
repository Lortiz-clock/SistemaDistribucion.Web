interface ConfirmarModalProps {
  visible: boolean
  titulo?: string
  mensaje: string
  textoAceptar?: string
  claseAceptar?: string // 'btn-danger' para quitar/finalizar, 'btn-primary' para aprobar
  onAceptar: () => void
  onCancelar: () => void
}

export default function ConfirmarModal({ visible, titulo = 'Confirmar', mensaje,
  textoAceptar = 'Aceptar', claseAceptar = 'btn-primary', onAceptar, onCancelar }: ConfirmarModalProps) {
  if (!visible) return null

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-3">
          <h5>{titulo}</h5>
          <hr />
          <p className="mb-0">{mensaje}</p>
          <div className="d-flex gap-2 justify-content-end mt-3">
            <button className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>
            <button className={`btn ${claseAceptar}`} onClick={onAceptar}>{textoAceptar}</button>
          </div>
        </div>
      </div>
    </div>
  )
}