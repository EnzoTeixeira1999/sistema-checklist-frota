import { useState } from "react";

function Registro({ voltarParaLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [matricula, setMatricula] = useState("");
  const [ra, setRa] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("info");

  const mostrarMensagem = (texto, tipo = "info") => {
    setMensagem(texto);
    setTipoMensagem(tipo);
  };

  const handleRegistro = async () => {
    if (!email.trim() || !senha.trim() || !matricula.trim() || !ra.trim()) {
      mostrarMensagem("Preencha email, senha, matrícula e RA.", "warning");
      return;
    }

    try {
      setCarregando(true);
      setMensagem("");

      const response = await fetch("http://localhost:3001/registrar-colaborador", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          senha,
          matricula,
          ra
        })
      });

      const data = await response.json();

      if (!response.ok) {
        mostrarMensagem(data.error || "Erro ao concluir registro.", "error");
        return;
      }

      mostrarMensagem("Registro concluído com sucesso! Redirecionando para o login...", "success");

      setTimeout(() => {
        voltarParaLogin();
      }, 1800);
    } catch (error) {
      console.error(error);
      mostrarMensagem("Erro ao conectar com o servidor.", "error");
    } finally {
      setCarregando(false);
    }
  };

  const estiloMensagem =
    tipoMensagem === "success"
      ? {
          background: "rgba(15, 18, 25, 0.95)",
          border: "1px solid #61e77b",
          color: "#9df0ad"
        }
      : tipoMensagem === "error"
      ? {
          background: "rgba(15, 18, 25, 0.95)",
          border: "1px solid #ff6767",
          color: "#ff8b8b"
        }
      : tipoMensagem === "warning"
      ? {
          background: "rgba(15, 18, 25, 0.95)",
          border: "1px solid #ffc247",
          color: "#ffd57d"
        }
      : {
          background: "rgba(15, 18, 25, 0.95)",
          border: "1px solid #4da3ff",
          color: "#9cccff"
        };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #202533 0%, #11141d 55%, #090c12 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        fontFamily: "Arial, sans-serif",
        color: "#fff"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 620,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 34,
          padding: 36,
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)"
        }}
      >
        <div style={{ color: "#9aa5b8", fontSize: 15, marginBottom: 8 }}>
          Primeiro acesso do colaborador
        </div>

        <h1 style={{ margin: 0, fontSize: 36, marginBottom: 24 }}>
          Registre-se
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Matrícula"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value.toUpperCase())}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="RA"
          value={ra}
          onChange={(e) => setRa(e.target.value.toUpperCase())}
          style={inputStyle}
        />

        <button onClick={handleRegistro} style={botaoPrincipalStyle} disabled={carregando}>
          {carregando ? "Registrando..." : "Concluir registro"}
        </button>

        {mensagem && (
          <div
            style={{
              marginTop: 14,
              marginBottom: 12,
              padding: 14,
              borderRadius: 16,
              fontSize: 15,
              fontWeight: 700,
              boxShadow: "0 0 18px rgba(0,0,0,0.18)",
              ...estiloMensagem
            }}
          >
            {mensagem}
          </div>
        )}

        <button onClick={voltarParaLogin} style={botaoSecundarioStyle}>
          Voltar para login
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "16px 18px",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  fontSize: 17,
  outline: "none",
  boxSizing: "border-box",
  marginBottom: 16
};

const botaoPrincipalStyle = {
  width: "100%",
  padding: "18px",
  borderRadius: 18,
  border: "none",
  background: "linear-gradient(135deg,#4da3ff,#6b7cff)",
  color: "#fff",
  fontSize: 20,
  fontWeight: 700,
  cursor: "pointer",
  marginBottom: 12
};

const botaoSecundarioStyle = {
  width: "100%",
  padding: "16px",
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer"
};

export default Registro;