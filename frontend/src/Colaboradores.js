import { useEffect, useState } from "react";
import Toast from "./Toast";
import ConfirmModal from "./ConfirmModal";

function Colaboradores({ voltarParaGestor }) {
  const [colaboradores, setColaboradores] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [pesquisa, setPesquisa] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [sexo, setSexo] = useState("");
  const [dataEntrada, setDataEntrada] = useState("");
  const [foto, setFoto] = useState(null);

  const [toast, setToast] = useState({
    visivel: false,
    mensagem: "",
    tipo: "info"
  });

  const [modalConfirmacao, setModalConfirmacao] = useState({
    aberto: false,
    id: null,
    mensagem: ""
  });

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

  const carregarColaboradores = async () => {
    try {
      const response = await fetch("http://localhost:3001/colaboradores");
      const data = await response.json();
      setColaboradores(data);
    } catch (error) {
      console.error(error);
      mostrarToast("Erro ao carregar colaboradores", "error");
    }
  };

  useEffect(() => {
    carregarColaboradores();
  }, []);

  const cadastrarColaborador = async () => {
    if (!nomeCompleto.trim() || !sexo || !dataEntrada) {
      mostrarToast("Preencha nome completo, sexo e data de entrada.", "warning");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nome_completo", nomeCompleto);
      formData.append("email", email);
      formData.append("cpf", cpf);
      formData.append("sexo", sexo);
      formData.append("data_entrada", dataEntrada);

      if (foto) {
        formData.append("foto", foto);
      }

      const response = await fetch("http://localhost:3001/colaboradores", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        mostrarToast(data.error || "Erro ao cadastrar colaborador", "error");
        return;
      }

      mostrarToast(
        `Colaborador cadastrado! Matrícula: ${data.matricula} | RA: ${data.ra}`,
        "success"
      );

      setNomeCompleto("");
      setEmail("");
      setCpf("");
      setSexo("");
      setDataEntrada("");
      setFoto(null);
      setMostrarFormulario(false);

      carregarColaboradores();
    } catch (error) {
      console.error(error);
      mostrarToast("Erro ao cadastrar colaborador", "error");
    }
  };

  const excluirColaborador = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/colaboradores/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        mostrarToast("Erro ao excluir colaborador", "error");
        return;
      }

      mostrarToast("Colaborador excluído com sucesso!", "success");
      carregarColaboradores();
    } catch (error) {
      console.error(error);
      mostrarToast("Erro ao excluir colaborador", "error");
    }
  };

  const corStatus = (status) => {
    if (status === "ATIVO") return "#61e77b";
    return "#ffc247";
  };

  const colaboradoresFiltrados = colaboradores.filter((c) => {
    const termo = pesquisa.toLowerCase().trim();

    if (!termo) return true;

    return (
      (c.matricula || "").toLowerCase().includes(termo) ||
      (c.ra || "").toLowerCase().includes(termo) ||
      (c.sexo || "").toLowerCase().includes(termo)
    );
  });

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
          maxWidth: 1450,
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
            <div style={{ color: "#9aa5b8", fontSize: 14 }}>Área do Gestor</div>
            <h1 style={{ margin: 0, fontSize: 34 }}>Colaboradores</h1>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={voltarParaGestor} style={botaoSecundarioStyle}>
              Voltar
            </button>

            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              style={botaoPrincipalStyle}
            >
              Registrar novo colaborador
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 20
          }}
        >
          <input
            style={{
              ...inputStyle,
              maxWidth: 500,
              textAlign: "center"
            }}
            placeholder="Pesquisar por matrícula, RA ou sexo"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>

        {mostrarFormulario && (
          <div style={blocoFormularioStyle}>
            <h2 style={{ marginTop: 0 }}>Pré-cadastro do colaborador</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <input
                style={inputStyle}
                placeholder="Nome completo"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
              />

              <input
                style={inputStyle}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                style={inputStyle}
                placeholder="CPF (opcional)"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
              />

              <select
  style={inputStyle}
  value={sexo}
  onChange={(e) => setSexo(e.target.value)}
>
  <option value="" style={{ background: "#1a2130", color: "#ffffff" }}>
    Sexo
  </option>
  <option value="Masculino" style={{ background: "#1a2130", color: "#ffffff" }}>
    Masculino
  </option>
  <option value="Feminino" style={{ background: "#1a2130", color: "#ffffff" }}>
    Feminino
  </option>
  <option value="Outro" style={{ background: "#1a2130", color: "#ffffff" }}>
    Outro
  </option>
</select>

              <input
                style={inputStyle}
                type="date"
                value={dataEntrada}
                onChange={(e) => setDataEntrada(e.target.value)}
              />

              <label
  style={{
    ...inputStyle,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    minHeight: 56
  }}
>
  <span style={{ color: "#cfd7e6", fontWeight: 600 }}>
    Escolha a foto de perfil
  </span>

  <span
    style={{
      color: foto ? "#9df0ad" : "#9aa5b8",
      fontSize: 14,
      marginLeft: 12,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: 180
    }}
  >
    {foto ? foto.name : "Nenhum arquivo selecionado"}
  </span>

  <input
    type="file"
    accept="image/*"
    style={{ display: "none" }}
    onChange={(e) => setFoto(e.target.files[0])}
  />
</label>
            </div>

            <div style={{ marginTop: 16 }}>
              <button onClick={cadastrarColaborador} style={botaoPrincipalStyle}>
                Salvar pré-cadastro
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
            marginTop: 20
          }}
        >
          {colaboradoresFiltrados.map((c) => (
            <div
              key={c.id}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 22,
                padding: 24
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "260px 1fr",
                  gap: 20,
                  alignItems: "center"
                }}
              >
                <div
                  style={{
                    width: 260,
                    height: 260,
                    borderRadius: 24,
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
                  }}
                >
                  {c.foto_url ? (
                    <img
                      src={c.foto_url}
                      alt={c.nome_completo}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  ) : (
                    <span style={{ color: "#9ca7b9" }}>Sem foto</span>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      gap: 12,
                      marginBottom: 14,
                      width: "100%"
                    }}
                  >
                    <div style={{ fontSize: 28, fontWeight: 700 }}>
                      {c.nome_completo}
                    </div>

                    <div
                      style={{
                        padding: "8px 14px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.06)",
                        border: `1px solid ${corStatus(c.status)}`,
                        color: corStatus(c.status),
                        fontWeight: 700,
                        minWidth: 150,
                        textAlign: "center"
                      }}
                    >
                      {c.status === "ATIVO" ? "ATIVO" : "PRÉ-CADASTRADO"}
                    </div>
                  </div>

                  <div
                    style={{
                      color: "#d7ddea",
                      lineHeight: 2,
                      fontSize: 18,
                      textAlign: "left",
                      width: "100%"
                    }}
                  >
                    <div><strong>Sexo:</strong> {c.sexo || "-"}</div>
                    <div><strong>Data de entrada:</strong> {c.data_entrada ? new Date(c.data_entrada).toLocaleDateString("pt-BR") : "-"}</div>
                    <div><strong>Email:</strong> {c.email || "-"}</div>
                    <div><strong>CPF:</strong> {c.cpf || "-"}</div>
                    <div><strong>Matrícula:</strong> {c.matricula}</div>
                    <div><strong>RA:</strong> {c.ra}</div>
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <button
                      onClick={() =>
                        setModalConfirmacao({
                          aberto: true,
                          id: c.id,
                          mensagem: "Deseja realmente excluir este colaborador?"
                        })
                      }
                      style={botaoExcluirStyle}
                    >
                      Excluir colaborador
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Toast
        visivel={toast.visivel}
        mensagem={toast.mensagem}
        tipo={toast.tipo}
      />

      <ConfirmModal
        aberto={modalConfirmacao.aberto}
        mensagem={modalConfirmacao.mensagem}
        textoConfirmar="Excluir"
        textoCancelar="Cancelar"
        onCancelar={() =>
          setModalConfirmacao({
            aberto: false,
            id: null,
            mensagem: ""
          })
        }
        onConfirmar={() => {
          excluirColaborador(modalConfirmacao.id);
          setModalConfirmacao({
            aberto: false,
            id: null,
            mensagem: ""
          });
        }}
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
  fontSize: 16,
  outline: "none",
  boxSizing: "border-box"
};

const botaoPrincipalStyle = {
  padding: "14px 18px",
  borderRadius: 14,
  border: "none",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer"
};

const botaoSecundarioStyle = {
  padding: "14px 18px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer"
};

const botaoExcluirStyle = {
  padding: "12px 16px",
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg,#ff7676,#ff4b4b)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer"
};

const blocoFormularioStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 22,
  padding: 20
};

export default Colaboradores;