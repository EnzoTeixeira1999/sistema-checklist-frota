import { useEffect, useState } from "react";

function Toast({ mensagem, tipo = "info", visivel }) {
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    if (visivel) {
      setAtivo(true);
      setTimeout(() => setAtivo(false), 4500); // animação de saída antes de sumir
    }
  }, [visivel]);

  if (!visivel || !mensagem) return null;

  const cores = {
    success: "#61e77b",
    error: "#ff6767",
    warning: "#ffc247",
    info: "#4da3ff"
  };

  const cor = cores[tipo] || cores.info;

  return (
    <div
      style={{
        position: "fixed",
        top: 30,
        left: "50%",
        transform: ativo
          ? "translate(-50%, 0px)"
          : "translate(-50%, -20px)",
        opacity: ativo ? 1 : 0,
        transition: "all 0.4s ease",
        zIndex: 9999,
        minWidth: 320,
        maxWidth: 520,
        padding: "16px 20px",
        borderRadius: 18,

        background: "rgba(15, 18, 25, 0.95)",
        border: `1px solid ${cor}`,
        color: cor,

        fontWeight: 700,
        textAlign: "center",

        boxShadow: `0 0 25px ${cor}40`,
        backdropFilter: "blur(10px)",

        overflow: "hidden"
      }}
    >
      {mensagem}

      {/* Barra de tempo (estilo profissional) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 3,
          width: "100%",
          background: cor,
          animation: "progressBar 5s linear forwards"
        }}
      />

      <style>
        {`
          @keyframes progressBar {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}
      </style>
    </div>
  );
}

export default Toast;