import { useState } from "react";
import Registro from "./Registro";

function Login() {
  const [erro, setErro] = useState("");
  const [modoRegistro, setModoRegistro] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      setErro("Preencha email e senha.");
      return;
    }

    try {
      setCarregando(true);
      setErro("");

      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          senha
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        window.location.reload();
      } else {
        setErro(data.error || "Email ou senha inválidos.");
      }
    } catch (error) {
      console.error(error);
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  };

  if (modoRegistro) {
    return <Registro voltarParaLogin={() => setModoRegistro(false)} />;
  }

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
          maxWidth: 1150,
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 24,
          alignItems: "stretch"
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 34,
            padding: 36,
            boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -120,
              left: -80,
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: "rgba(77, 163, 255, 0.12)",
              filter: "blur(30px)"
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: -100,
              right: -70,
              width: 260,
              height: 260,
              borderRadius: "50%",
              background: "rgba(123, 255, 106, 0.10)",
              filter: "blur(30px)"
            }}
          />

          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ color: "#9aa5b8", fontSize: 15, marginBottom: 12 }}>
              Sistema de Checklist de Frota
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 46,
                lineHeight: 1.1,
                maxWidth: 520
              }}
            >
              Acesso seguro para operação e gestão da frota
            </h1>

            <p
              style={{
                marginTop: 18,
                color: "#c2cbda",
                fontSize: 18,
                lineHeight: 1.6,
                maxWidth: 560
              }}
            >
              Realize checklists, acompanhe aprovações, valide inspeções e mantenha
              o histórico dos veículos com uma experiência profissional e organizada.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginTop: 28
              }}
            >
              <div style={infoCardStyle}>
                <div style={infoTitleStyle}>Colaborador</div>
                <div style={infoTextStyle}>
                  Preenche checklist, identifica o veículo, anexa fotos e envia a inspeção.
                </div>
              </div>

              <div style={infoCardStyle}>
                <div style={infoTitleStyle}>Gestor</div>
                <div style={infoTextStyle}>
                  Visualiza histórico, aprova ou reprova checklists e registra observações.
                </div>
              </div>

              <div style={infoCardStyle}>
                <div style={infoTitleStyle}>Automação</div>
                <div style={infoTextStyle}>
                  Bloqueio de envio sem fotos obrigatórias e atualização automática de status.
                </div>
              </div>

              <div style={infoCardStyle}>
                <div style={infoTitleStyle}>Rastreabilidade</div>
                <div style={infoTextStyle}>
                  Histórico por veículo, responsável, data e evidências em imagem.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 34,
            padding: 36,
            boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}
        >
          <div style={{ color: "#9aa5b8", fontSize: 15, marginBottom: 8 }}>
            Acesso ao sistema
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: 34,
              marginBottom: 26
            }}
          >
            Fazer login
          </h2>

          <label style={labelStyle}>Email</label>
          <input
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Senha</label>
          <input
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={inputStyle}
          />

          <button
            onClick={handleLogin}
            disabled={carregando}
            style={{
              marginTop: 20,
              width: "100%",
              padding: "18px",
              borderRadius: 18,
              border: "none",
              background: carregando
                ? "rgba(255,255,255,0.08)"
                : "linear-gradient(135deg,#4da3ff,#6b7cff)",
              color: "#fff",
              fontSize: 20,
              fontWeight: 700,
              cursor: carregando ? "not-allowed" : "pointer",
              boxShadow: carregando ? "none" : "0 0 24px rgba(77,163,255,0.35)"
            }}
          >
            {carregando ? "Entrando..." : "Entrar no sistema"}
          </button>

          {erro && (
            <div
              style={{
                marginTop: 14,
                padding: 14,
                borderRadius: 16,
                background: "rgba(15, 18, 25, 0.95)",
                border: "1px solid #ff6767",
                color: "#ff8b8b",
                fontSize: 15,
                fontWeight: 700,
                boxShadow: "0 0 18px rgba(255,103,103,0.18)"
              }}
            >
              {erro}
            </div>
          )}

          <div
            style={{
              marginTop: 16,
              textAlign: "center",
              color: "#b7c1d2",
              fontSize: 15
            }}
          >
            <span>Primeiro acesso? </span>
            <span
              onClick={() => setModoRegistro(true)}
              style={{
                cursor: "pointer",
                textDecoration: "underline",
                fontWeight: 700,
                color: "#9cccff"
              }}
            >
              Registre-se
            </span>
          </div>

          <div
            style={{
              marginTop: 18,
              padding: 16,
              borderRadius: 18,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#b7c1d2",
              fontSize: 14,
              lineHeight: 1.6
            }}
          >
            Use seu acesso de <strong>GESTOR</strong> ou <strong>COLABORADOR</strong>.
            O sistema direciona automaticamente para a área correta após o login.
          </div>
        </div>
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

const labelStyle = {
  display: "block",
  marginBottom: 8,
  color: "#c3cada",
  fontSize: 15,
  fontWeight: 600
};

const infoCardStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 20,
  padding: 18
};

const infoTitleStyle = {
  fontSize: 18,
  fontWeight: 700,
  marginBottom: 8
};

const infoTextStyle = {
  color: "#c0c8d8",
  fontSize: 14,
  lineHeight: 1.6
};

export default Login;