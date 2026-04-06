import { useEffect, useState } from "react";

function ConfirmModal({
  aberto,
  titulo = "Confirmar ação",
  mensagem,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  onConfirmar,
  onCancelar
}) {
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    if (aberto) {
      setTimeout(() => setAtivo(true), 10);
    } else {
      setAtivo(false);
    }
  }, [aberto]);

  if (!aberto) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(6px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9998,
        padding: 20,
        opacity: ativo ? 1 : 0,
        transition: "opacity 0.3s ease"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "radial-gradient(circle at top, #202533 0%, #11141d 55%, #090c12 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 28,
          padding: 24,
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          color: "#fff",
          transform: ativo ? "translateY(0px) scale(1)" : "translateY(18px) scale(0.98)",
          transition: "all 0.3s ease"
        }}
      >
        <div style={{ color: "#9aa5b8", fontSize: 14, marginBottom: 8 }}>
          Confirmação
        </div>

        <h2 style={{ margin: 0, fontSize: 28, marginBottom: 12 }}>
          {titulo}
        </h2>

        <p style={{ color: "#d0d7e4", lineHeight: 1.7, marginBottom: 22 }}>
          {mensagem}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12
          }}
        >
          <button
            onClick={onCancelar}
            style={{
              padding: "14px 18px",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            {textoCancelar}
          </button>

          <button
            onClick={onConfirmar}
            style={{
              padding: "14px 18px",
              borderRadius: 16,
              border: "none",
              background: "linear-gradient(135deg,#ff7676,#ff4b4b)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 0 18px rgba(255,75,75,0.18)",
              transition: "all 0.2s ease"
            }}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;