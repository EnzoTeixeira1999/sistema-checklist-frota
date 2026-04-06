import { useEffect, useMemo, useState } from "react";
import Toast from "./Toast";

function Colaborador() {
  const user = JSON.parse(localStorage.getItem("user"));
  const responsavel = user?.matricula || "";
  const [enviando, setEnviando] = useState(false);
  const [pontosAnimados, setPontosAnimados] = useState("");
  const [placa, setPlaca] = useState("");
  const [proprietario, setProprietario] = useState("");
  const [tipoCarro, setTipoCarro] = useState("");
  const [anoCarro, setAnoCarro] = useState("");
  const [km, setKm] = useState("");

  const [toast, setToast] = useState({
    visivel: false,
    mensagem: "",
    tipo: "info"
  });
  
  useEffect(() => {
    if (!enviando) {
      setPontosAnimados("");
      return;
    }

  const interval = setInterval(() => {
    setPontosAnimados((prev) => {
      if (prev === "") return ".";
      if (prev === ".") return "..";
      if (prev === "..") return "...";
      return "";
    });
  }, 400);

  return () => clearInterval(interval);
}, [enviando]);

  const [respostas, setRespostas] = useState([
    { pergunta: "Documentação em dia?", resposta: "" },
    { pergunta: "Equipamentos obrigatórios presentes?", resposta: "" },
    { pergunta: "Existem avarias visíveis?", resposta: "" },
    { pergunta: "O veículo está apto para uso?", resposta: "" },
    { pergunta: "Os pneus aparentam condição adequada?", resposta: "" },
    { pergunta: "Freios estão funcionando normalmente?", resposta: "" },
    { pergunta: "Faróis e lanternas estão funcionando?", resposta: "" },
    { pergunta: "Nível de combustível é suficiente para a operação?", resposta: "" },
    { pergunta: "Há vazamentos aparentes no veículo?", resposta: "" },
    { pergunta: "Painel apresenta alguma luz de alerta acesa?", resposta: "" }
  ]);

  const [fotos, setFotos] = useState({
    frente: null,
    lateral: null,
    pneu: null,
    interna: null,
    painel: null
  });

  const hoje = new Date().toLocaleDateString("pt-BR");

  const mostrarToast = (mensagem, tipo = "info") => {
    setToast({
      visivel: true,
      mensagem,
      tipo
    });

    setTimeout(() => {
      setToast({
        visivel: false,
        mensagem: "",
        tipo: "info"
      });
    }, 5000);
  };

  const limiteKm = useMemo(() => {
    const tipo = tipoCarro.toLowerCase();
    if (tipo.includes("hatch")) return 15000;
    if (tipo.includes("sedan")) return 18000;
    if (tipo.includes("suv")) return 22000;
    if (tipo.includes("pickup")) return 28000;
    return 18000;
  }, [tipoCarro]);

  const kmNumero = Number(km || 0);

  const indicador = useMemo(() => {
    if (!kmNumero) return { cor: "#4ea1ff", texto: "Sem leitura", progresso: 0 };
    const percentual = Math.min((kmNumero / limiteKm) * 100, 100);
    if (percentual <= 60) return { cor: "#7bff6a", texto: "Rodagem baixa", progresso: percentual };
    if (percentual <= 85) return { cor: "#ffc24a", texto: "Rodagem moderada", progresso: percentual };
    return { cor: "#ff6262", texto: "Rodagem alta", progresso: percentual };
  }, [kmNumero, limiteKm]);

  const angulo = -120 + (indicador.progresso / 100) * 240;

  const handleResposta = (index, valor) => {
    const novas = [...respostas];
    novas[index].resposta = valor;
    setRespostas(novas);
  };

  const handleFoto = (tipo, arquivo) => {
    setFotos((prev) => ({ ...prev, [tipo]: arquivo }));
  };

  const enviarChecklist = async () => {
  if (enviando) return;

  const checklistPreenchido = respostas.every((item) => item.resposta !== "");
  const fotosObrigatoriasOk =
    fotos.frente &&
    fotos.lateral &&
    fotos.pneu &&
    fotos.interna &&
    fotos.painel;

  const dadosBasicosOk =
    responsavel.trim() &&
    proprietario.trim() &&
    tipoCarro.trim() &&
    placa.trim() &&
    anoCarro.trim() &&
    km.trim();

  if (!dadosBasicosOk) {
    mostrarToast("Preencha responsável, proprietário, tipo de carro, placa, ano e KM.", "warning");
    return;
  }

  if (!checklistPreenchido) {
    mostrarToast("Responda todas as perguntas.", "warning");
    return;
  }

  if (!fotosObrigatoriasOk) {
    mostrarToast("Anexe todas as fotos obrigatórias.", "warning");
    return;
  }

  try {
    setEnviando(true);

    const response = await fetch("http://localhost:3001/checklist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        vehicle_id: 1,
        km: Number(km),
        respostas,
        responsavel,
        proprietario,
        tipo_carro: tipoCarro,
        ano_carro: Number(anoCarro),
        placa_informada: placa
      })
    });

    const data = await response.json();

    if (!response.ok) {
      mostrarToast(data.error || "Erro ao criar checklist.", "error");
      return;
    }

    const checklistId = data.id;
    const tiposDeFoto = ["frente", "lateral", "pneu", "interna", "painel"];

    for (const tipo of tiposDeFoto) {
      const formData = new FormData();
      formData.append("file", fotos[tipo]);
      formData.append("tipo", tipo);

      const fotoResponse = await fetch(
        `http://localhost:3001/checklist/${checklistId}/photo`,
        {
          method: "POST",
          body: formData
        }
      );

      if (!fotoResponse.ok) {
        mostrarToast(`Erro ao enviar a foto ${tipo}.`, "error");
        return;
      }
    }

    mostrarToast("Checklist enviado com sucesso!", "success");

    setProprietario("");
    setTipoCarro("");
    setPlaca("");
    setAnoCarro("");
    setKm("");
    setRespostas([
      { pergunta: "Documentação em dia?", resposta: "" },
      { pergunta: "Equipamentos obrigatórios presentes?", resposta: "" },
      { pergunta: "Existem avarias visíveis?", resposta: "" },
      { pergunta: "O veículo está apto para uso?", resposta: "" },
      { pergunta: "Os pneus aparentam condição adequada?", resposta: "" },
      { pergunta: "Freios estão funcionando normalmente?", resposta: "" },
      { pergunta: "Faróis e lanternas estão funcionando?", resposta: "" },
      { pergunta: "Nível de combustível é suficiente para a operação?", resposta: "" },
      { pergunta: "Há vazamentos aparentes no veículo?", resposta: "" },
      { pergunta: "Painel apresenta alguma luz de alerta acesa?", resposta: "" }
    ]);
    setFotos({
      frente: null,
      lateral: null,
      pneu: null,
      interna: null,
      painel: null
    });

  } catch (error) {
    console.error(error);
    mostrarToast("Erro ao conectar com o servidor.", "error");
  } finally {
    setEnviando(false);
  }
};

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #202533 0%, #11141d 55%, #090c12 100%)",
        color: "#fff",
        padding: 24,
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div
        style={{
          maxWidth: 1380,
          margin: "0 auto",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 34,
          padding: 26,
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 22,
            gap: 12
          }}
        >
          <div>
            <div style={{ color: "#9aa5b8", fontSize: 14 }}>Área do Colaborador</div>
            <h1 style={{ margin: 0, fontSize: 34 }}>Checklist do Veículo</h1>
          </div>

          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={logoutButtonStyle}
          >
            Sair
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginBottom: 20
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 14
            }}
          >
            <input
              style={inputStyle}
              placeholder="Proprietário"
              value={proprietario}
              onChange={(e) => setProprietario(e.target.value)}
            />

            <input
              style={inputStyle}
              placeholder="Tipo de carro"
              value={tipoCarro}
              onChange={(e) => setTipoCarro(e.target.value)}
            />

            <input
              style={inputStyle}
              placeholder="Placa"
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 14
            }}
          >
            <input
              style={inputStyle}
              placeholder="Ano"
              type="number"
              value={anoCarro}
              onChange={(e) => setAnoCarro(e.target.value)}
            />

            <input
              style={{ ...inputStyle, opacity: 0.85 }}
              placeholder="Responsável"
              value={responsavel}
              disabled
            />

            <input
              style={inputStyle}
              placeholder="KM atual"
              type="number"
              value={km}
              onChange={(e) => setKm(e.target.value)}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 14
            }}
          >
            <div></div>

            <input
              style={{
                ...inputStyle,
                textAlign: "center",
                fontWeight: 700,
                opacity: 0.85
              }}
              value={`Data: ${hoje}`}
              disabled
            />

            <div></div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
          <div
            style={{
              width: 860,
              height: 340,
              position: "relative",
              display: "flex",
              justifyContent: "center"
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 35,
                width: 700,
                height: 700,
                borderRadius: "50%",
                background: `conic-gradient(from 210deg,
                  ${indicador.cor} 0deg,
                  ${indicador.cor} ${Math.max(indicador.progresso * 2.4, 10)}deg,
                  rgba(255,255,255,0.08) ${Math.max(indicador.progresso * 2.4, 10)}deg,
                  rgba(255,255,255,0.08) 240deg,
                  transparent 240deg)`,
                clipPath: "inset(0 0 50% 0)",
                filter: `drop-shadow(0 0 16px ${indicador.cor})`
              }}
            />

            <div
              style={{
                position: "absolute",
                top: 58,
                width: 650,
                height: 650,
                borderRadius: "50%",
                background: "radial-gradient(circle, #18202e 0%, #111722 55%, #0d1119 100%)",
                clipPath: "inset(0 0 50% 0)",
                boxShadow: "inset 0 0 40px rgba(0,0,0,0.5)"
              }}
            />

            <div
              style={{
                position: "absolute",
                top: 80,
                width: 600,
                height: 600,
                borderRadius: "50%",
                borderTop: "2px solid rgba(255,255,255,0.22)",
                borderLeft: "2px solid rgba(255,255,255,0.1)",
                borderRight: "2px solid rgba(255,255,255,0.1)",
                clipPath: "inset(0 0 50% 0)"
              }}
            />

            <div
              style={{
                position: "absolute",
                bottom: 52,
                width: 12,
                height: 150,
                borderRadius: 12,
                background: indicador.cor,
                transform: `rotate(${angulo}deg)`,
                transformOrigin: "50% 100%",
                boxShadow: `0 0 18px ${indicador.cor}`
              }}
            />

            <div
              style={{
                position: "absolute",
                bottom: 40,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: indicador.cor,
                boxShadow: `0 0 18px ${indicador.cor}`
              }}
            />

            <div style={{ position: "absolute", top: 120, textAlign: "center" }}>
              <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1 }}>
                {km || "0"} <span style={{ fontSize: 26, fontWeight: 400 }}>KM</span>
              </div>
              <div style={{ marginTop: 14, color: indicador.cor, fontSize: 24, fontWeight: 700 }}>
                {indicador.texto}
              </div>
              <div style={{ marginTop: 20, color: "#c3cada", fontSize: 18 }}>
                Data: {hoje}
              </div>
            </div>
          </div>
        </div>

        <h2 style={{ marginBottom: 16, fontSize: 30 }}>Checklist do Veículo</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
            alignItems: "stretch"
          }}
        >
          {respostas.map((item, index) => (
            <div key={index} style={cardPerguntaStyle}>
              <div style={tituloPerguntaStyle}>{item.pergunta}</div>

              <div style={areaBotoesStyle}>
                <button
                  style={{
                    ...btnOpcaoStyle,
                    background:
                      item.resposta === "SIM"
                        ? "linear-gradient(135deg,#79ff8a,#42d46a)"
                        : "rgba(255,255,255,0.06)",
                    color: item.resposta === "SIM" ? "#081019" : "#fff"
                  }}
                  onClick={() => handleResposta(index, "SIM")}
                >
                  SIM
                </button>

                <button
                  style={{
                    ...btnOpcaoStyle,
                    background:
                      item.resposta === "NÃO"
                        ? "linear-gradient(135deg,#ff7575,#ff4f4f)"
                        : "rgba(255,255,255,0.06)",
                    color: "#fff"
                  }}
                  onClick={() => handleResposta(index, "NÃO")}
                >
                  NÃO
                </button>
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: 28, marginTop: 20, marginBottom: 12 }}>Fotos obrigatórias</h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {["frente", "lateral", "pneu", "interna", "painel"].map((tipo) => (
            <label key={tipo} style={fotoCardStyle}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{fotos[tipo] ? "✓" : "+"}</div>
              <div style={{ fontSize: 20, fontWeight: 700, textTransform: "capitalize" }}>{tipo}</div>
              <div style={{ fontSize: 12, color: "#adb6c6", marginTop: 8 }}>
                {fotos[tipo] ? fotos[tipo].name : "Selecionar foto"}
              </div>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFoto(tipo, e.target.files[0])}
              />
            </label>
          ))}
        </div>

        <div style={{ marginTop: 14, color: "#cad1df" }}>
          Envie obrigatoriamente as fotos de frente, lateral, pneu, parte interna e painel.
        </div>

        <div style={{ marginTop: 6, color: "#ff6b6b" }}>
          Anexe todas as fotos para liberar o envio.
        </div>

        <button
  style={{
    ...botaoEnviarStyle,
    color: enviando ? "#ffe66d" : "#6bb8ff",
    textShadow: enviando
      ? "0 0 10px rgba(255,230,109,0.65)"
      : "0 0 10px rgba(107,184,255,0.65)",
    opacity: enviando ? 0.95 : 1,
    cursor: enviando ? "not-allowed" : "pointer"
  }}
  onClick={enviarChecklist}
  disabled={enviando}
>
  {enviando ? `Enviando${pontosAnimados}` : "Enviar Checklist"}
</button>
      </div>

      <Toast
        visivel={toast.visivel}
        mensagem={toast.mensagem}
        tipo={toast.tipo}
      />
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "15px 18px",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  fontSize: 18,
  outline: "none",
  boxSizing: "border-box"
};

const logoutButtonStyle = {
  padding: "12px 18px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer"
};

const cardPerguntaStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 20,
  padding: 18,
  minHeight: 150,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  boxSizing: "border-box"
};

const tituloPerguntaStyle = {
  fontSize: 21,
  lineHeight: 1.3,
  minHeight: 56,
  display: "flex",
  alignItems: "flex-start"
};

const areaBotoesStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginTop: 14
};

const btnOpcaoStyle = {
  width: "100%",
  height: 52,
  borderRadius: 14,
  border: "none",
  fontSize: 18,
  fontWeight: 700,
  cursor: "pointer"
};

const fotoCardStyle = {
  minHeight: 132,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  textAlign: "center",
  padding: 10
};

const botaoEnviarStyle = {
  width: "100%",
  marginTop: 20,
  padding: "18px",
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.06)",
  fontSize: 22,
  fontWeight: 700,
  transition: "all 0.25s ease",
  boxShadow: "0 0 18px rgba(255,255,255,0.06)"
};

export default Colaborador;