import { useEffect, useMemo, useState } from "react";
import Colaboradores from "./Colaboradores";
import Toast from "./Toast";
import ConfirmModal from "./ConfirmModal";

function Gestor() {
  const [telaAtual, setTelaAtual] = useState("dashboard");
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFiltro, setStatusFiltro] = useState("TODOS");
  const [veiculoFiltro, setVeiculoFiltro] = useState("");
  const [selecionado, setSelecionado] = useState(null);
  const [observacao, setObservacao] = useState("");

  const [toast, setToast] = useState({
    visivel: false,
    mensagem: "",
    tipo: "info"
  });

  const [confirmModal, setConfirmModal] = useState({
    aberto: false,
    titulo: "",
    mensagem: "",
    onConfirmar: null
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

  const abrirConfirmacao = (titulo, mensagem, onConfirmar) => {
    setConfirmModal({
      aberto: true,
      titulo,
      mensagem,
      onConfirmar
    });
  };

  const fecharConfirmacao = () => {
    setConfirmModal({
      aberto: false,
      titulo: "",
      mensagem: "",
      onConfirmar: null
    });
  };

  const carregarChecklists = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3001/checklists");
      const data = await response.json();
      setChecklists(data);
    } catch (error) {
      console.error(error);
      mostrarToast("Erro ao carregar checklists", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarChecklists();
  }, []);

  const veiculosUnicos = useMemo(() => {
    const lista = checklists.map(
      (c) => `${c.tipo_carro || c.modelo} - ${c.placa_informada || c.placa}`
    );
    return [...new Set(lista)];
  }, [checklists]);

  const checklistsFiltrados = useMemo(() => {
    return checklists.filter((c) => {
      const matchStatus =
        statusFiltro === "TODOS" ? true : c.status === statusFiltro;

      const nomeVeiculo = `${c.tipo_carro || c.modelo} - ${c.placa_informada || c.placa}`;
      const matchVeiculo =
        veiculoFiltro === "" ? true : nomeVeiculo === veiculoFiltro;

      return matchStatus && matchVeiculo;
    });
  }, [checklists, statusFiltro, veiculoFiltro]);

  const resumo = useMemo(() => {
    const pendentes = checklists.filter((c) => c.status === "PENDENTE").length;
    const aprovados = checklists.filter((c) => c.status === "APROVADO").length;
    const reprovados = checklists.filter((c) => c.status === "REPROVADO").length;

    return { pendentes, aprovados, reprovados };
  }, [checklists]);

  const abrirDetalhes = (checklist) => {
    setSelecionado(checklist);
    setObservacao(checklist.observacao || "");
  };

  const fecharDetalhes = () => {
    setSelecionado(null);
    setObservacao("");
  };

  const validarChecklist = async (status) => {
    if (!selecionado) return;

    if (status === "REPROVADO" && !observacao.trim()) {
      mostrarToast("Ao reprovar, a justificativa/observação é obrigatória.", "warning");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/checklist/${selecionado.id}/validar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status,
            observacao: observacao.trim()
          })
        }
      );

      if (!response.ok) {
        mostrarToast("Erro ao validar checklist", "error");
        return;
      }

      mostrarToast(`Checklist ${status.toLowerCase()} com sucesso!`, "success");
      fecharDetalhes();
      carregarChecklists();
    } catch (error) {
      console.error(error);
      mostrarToast("Erro ao validar checklist", "error");
    }
  };

  const excluirChecklist = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/checklist/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        mostrarToast("Erro ao excluir checklist", "error");
        return;
      }

      if (selecionado?.id === id) {
        fecharDetalhes();
      }

      mostrarToast("Checklist excluído com sucesso!", "success");
      carregarChecklists();
    } catch (error) {
      console.error(error);
      mostrarToast("Erro ao excluir checklist", "error");
    }
  };

  const excluirTodos = async () => {
    try {
      const response = await fetch("http://localhost:3001/checklists", {
        method: "DELETE"
      });

      if (!response.ok) {
        mostrarToast("Erro ao excluir todos os checklists", "error");
        return;
      }

      fecharDetalhes();
      mostrarToast("Todos os checklists foram excluídos!", "success");
      carregarChecklists();
    } catch (error) {
      console.error(error);
      mostrarToast("Erro ao excluir todos os checklists", "error");
    }
  };

  const corStatus = (status) => {
    if (status === "APROVADO") return "#61e77b";
    if (status === "REPROVADO") return "#ff6767";
    return "#ffc247";
  };

  const fotoFrente = (checklist) => {
    if (!checklist.fotos || checklist.fotos.length === 0) return null;
    const frente = checklist.fotos.find((f) => f.tipo === "frente");
    return frente ? frente.url : checklist.fotos[0]?.url || null;
  };

  if (telaAtual === "colaboradores") {
    return <Colaboradores voltarParaGestor={() => setTelaAtual("dashboard")} />;
  }

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
            <h1 style={{ margin: 0, fontSize: 34 }}>Dashboard de Validação</h1>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setTelaAtual("colaboradores")}
              style={logoutButtonStyle}
            >
              Colaboradores
            </button>

            <button
              onClick={() =>
                abrirConfirmacao(
                  "Excluir todos os checklists",
                  "Deseja realmente excluir TODOS os checklists?",
                  excluirTodos
                )
              }
              style={deleteAllButtonStyle}
            >
              Excluir todos
            </button>

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
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 24
          }}
        >
          <div style={resumoCardStyle("#ffc247")}>
            <div style={resumoTituloStyle}>Pendentes</div>
            <div style={resumoNumeroStyle}>{resumo.pendentes}</div>
          </div>

          <div style={resumoCardStyle("#61e77b")}>
            <div style={resumoTituloStyle}>Aprovados</div>
            <div style={resumoNumeroStyle}>{resumo.aprovados}</div>
          </div>

          <div style={resumoCardStyle("#ff6767")}>
            <div style={resumoTituloStyle}>Reprovados</div>
            <div style={resumoNumeroStyle}>{resumo.reprovados}</div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr auto",
            gap: 14,
            marginBottom: 24
          }}
        >
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            style={inputStyle}
          >
            <option value="TODOS" style={{ background: "#1a2130", color: "#ffffff" }}>
              Todos os status
            </option>
            <option value="PENDENTE" style={{ background: "#3b2f0d", color: "#ffc247" }}>
              Pendentes
            </option>
            <option value="APROVADO" style={{ background: "#0d2f19", color: "#61e77b" }}>
              Aprovados
            </option>
            <option value="REPROVADO" style={{ background: "#3a1212", color: "#ff6767" }}>
              Reprovados
            </option>
          </select>

          <select
            value={veiculoFiltro}
            onChange={(e) => setVeiculoFiltro(e.target.value)}
            style={inputStyle}
          >
            <option value="" style={{ background: "#1a2130", color: "#ffffff" }}>
              Todos os veículos
            </option>
            {veiculosUnicos.map((veiculo, index) => (
              <option
                key={index}
                value={veiculo}
                style={{ background: "#1a2130", color: "#ffffff" }}
              >
                {veiculo}
              </option>
            ))}
          </select>

          <button onClick={carregarChecklists} style={atualizarButtonStyle}>
            Atualizar
          </button>
        </div>

        <div style={{ marginBottom: 16, fontSize: 28, fontWeight: 700 }}>
          Histórico por veículo
        </div>

        {loading ? (
          <div style={mensagemBoxStyle}>Carregando checklists...</div>
        ) : checklistsFiltrados.length === 0 ? (
          <div style={mensagemBoxStyle}>Nenhum checklist encontrado.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18
            }}
          >
            {checklistsFiltrados.map((c) => (
              <div key={c.id} style={cardChecklistStyle}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 1fr",
                    gap: 16,
                    alignItems: "stretch"
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: 140,
                      borderRadius: 18,
                      overflow: "hidden",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    {fotoFrente(c) ? (
                      <img
                        src={fotoFrente(c)}
                        alt="Frente do veículo"
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

                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        gap: 12
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 24, fontWeight: 700 }}>
                          {c.tipo_carro || c.modelo} - {c.placa_informada || c.placa}
                        </div>
                        <div style={{ color: "#aeb7c7", marginTop: 6 }}>
                          Checklist #{c.id}
                        </div>
                      </div>

                      <div
                        style={{
                          padding: "8px 14px",
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.06)",
                          border: `1px solid ${corStatus(c.status)}`,
                          color: corStatus(c.status),
                          fontWeight: 700,
                          minWidth: 110,
                          textAlign: "center"
                        }}
                      >
                        {c.status}
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 16,
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                        color: "#d5dbe6"
                      }}
                    >
                      <div><strong>KM:</strong> {c.km}</div>
                      <div><strong>Data:</strong> {new Date(c.data).toLocaleDateString("pt-BR")}</div>
                      <div><strong>Responsável:</strong> {c.responsavel || "-"}</div>
                      <div><strong>Proprietário:</strong> {c.proprietario || "-"}</div>
                      <div><strong>Tipo:</strong> {c.tipo_carro || "-"}</div>
                      <div><strong>Ano:</strong> {c.ano_carro || "-"}</div>
                    </div>

                    {c.status === "PENDENTE" && (
                      <div
                        style={{
                          marginTop: 14,
                          color: "#ffc247",
                          fontWeight: 700
                        }}
                      >
                        Alerta: checklist pendente de validação.
                      </div>
                    )}

                    {c.status === "REPROVADO" && (
                      <div
                        style={{
                          marginTop: 14,
                          color: "#ff7070",
                          fontWeight: 700
                        }}
                      >
                        Atenção: checklist reprovado.
                      </div>
                    )}

                    <div
                      style={{
                        marginTop: 16,
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: 10
                      }}
                    >
                      <button
                        onClick={() => abrirDetalhes(c)}
                        style={detalhesButtonStyle}
                      >
                        Ver detalhes / validar
                      </button>

                      <button
                        onClick={() =>
                          abrirConfirmacao(
                            "Excluir checklist",
                            "Deseja realmente excluir este checklist?",
                            () => excluirChecklist(c.id)
                          )
                        }
                        style={deleteOneButtonStyle}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selecionado && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18
              }}
            >
              <div>
                <div style={{ color: "#96a0b4", fontSize: 14 }}>Detalhes do Checklist</div>
                <div style={{ fontSize: 30, fontWeight: 700 }}>
                  {selecionado.tipo_carro || selecionado.modelo} - {selecionado.placa_informada || selecionado.placa}
                </div>
              </div>

              <button onClick={fecharDetalhes} style={fecharButtonStyle}>
                Fechar
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 20
              }}
            >
              <div style={infoBoxStyle}><strong>ID:</strong> {selecionado.id}</div>
              <div style={infoBoxStyle}><strong>Status:</strong> {selecionado.status}</div>
              <div style={infoBoxStyle}><strong>KM:</strong> {selecionado.km}</div>
              <div style={infoBoxStyle}><strong>Data:</strong> {new Date(selecionado.data).toLocaleString("pt-BR")}</div>
              <div style={infoBoxStyle}><strong>Responsável:</strong> {selecionado.responsavel || "-"}</div>
              <div style={infoBoxStyle}><strong>Proprietário:</strong> {selecionado.proprietario || "-"}</div>
              <div style={infoBoxStyle}><strong>Tipo:</strong> {selecionado.tipo_carro || "-"}</div>
              <div style={infoBoxStyle}><strong>Ano:</strong> {selecionado.ano_carro || "-"}</div>
            </div>

            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              Respostas do checklist
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 22
              }}
            >
              {(selecionado.respostas || []).map((r, index) => (
                <div key={index} style={respostaItemStyle}>
                  <div style={{ marginBottom: 8 }}>{r.pergunta}</div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: r.resposta === "SIM" ? "#61e77b" : "#ff7070"
                    }}
                  >
                    {r.resposta}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              Fotos anexadas
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 12,
                marginBottom: 22
              }}
            >
              {(selecionado.fotos || []).map((foto, index) => (
                <div key={index} style={fotoModalCardStyle}>
                  <img
                    src={foto.url}
                    alt={foto.tipo}
                    style={{
                      width: "100%",
                      height: 130,
                      objectFit: "cover",
                      borderRadius: 12,
                      marginBottom: 10
                    }}
                  />
                  <div style={{ textAlign: "center", textTransform: "capitalize", fontWeight: 700 }}>
                    {foto.tipo}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>
              Observação / justificativa
            </div>

            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Digite uma observação. Em caso de reprovação, este campo é obrigatório."
              style={textareaStyle}
            />

            <div
              style={{
                marginTop: 18,
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12
              }}
            >
              <button
                onClick={() => validarChecklist("APROVADO")}
                style={aprovarButtonStyle}
              >
                Aprovar Checklist
              </button>

              <button
                onClick={() => validarChecklist("REPROVADO")}
                style={reprovarButtonStyle}
              >
                Reprovar Checklist
              </button>

              <button
                onClick={() =>
                  abrirConfirmacao(
                    "Excluir checklist",
                    "Deseja realmente excluir este checklist?",
                    () => excluirChecklist(selecionado.id)
                  )
                }
                style={deleteOneButtonStyle}
              >
                Excluir Checklist
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        visivel={toast.visivel}
        mensagem={toast.mensagem}
        tipo={toast.tipo}
      />

      <ConfirmModal
        aberto={confirmModal.aberto}
        titulo={confirmModal.titulo}
        mensagem={confirmModal.mensagem}
        textoConfirmar="Confirmar"
        textoCancelar="Cancelar"
        onCancelar={fecharConfirmacao}
        onConfirmar={() => {
          if (confirmModal.onConfirmar) {
            confirmModal.onConfirmar();
          }
          fecharConfirmacao();
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
  background: "rgba(26, 33, 48, 0.95)",
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

const deleteAllButtonStyle = {
  padding: "12px 18px",
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg,#ff7676,#ff4b4b)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer"
};

const atualizarButtonStyle = {
  padding: "15px 18px",
  borderRadius: 16,
  border: "none",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  fontSize: 17,
  fontWeight: 700,
  cursor: "pointer"
};

const resumoCardStyle = (cor) => ({
  background: "rgba(255,255,255,0.03)",
  border: `1px solid ${cor}`,
  borderRadius: 22,
  padding: 20,
  boxShadow: `0 0 18px rgba(0,0,0,0.18)`
});

const resumoTituloStyle = {
  color: "#b0bacb",
  fontSize: 16,
  marginBottom: 12
};

const resumoNumeroStyle = {
  fontSize: 42,
  fontWeight: 800
};

const mensagemBoxStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 20,
  padding: 24,
  color: "#cad2df",
  fontSize: 18
};

const cardChecklistStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 22,
  padding: 20
};

const detalhesButtonStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: 14,
  border: "none",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  fontSize: 17,
  fontWeight: 700,
  cursor: "pointer"
};

const deleteOneButtonStyle = {
  padding: "14px 18px",
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg,#ff7676,#ff4b4b)",
  color: "#fff",
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer"
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
  zIndex: 999
};

const modalStyle = {
  width: "95%",
  maxWidth: 1300,
  maxHeight: "92vh",
  overflowY: "auto",
  background: "radial-gradient(circle at top, #202533 0%, #11141d 55%, #090c12 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 28,
  padding: 24,
  color: "#fff"
};

const fecharButtonStyle = {
  padding: "10px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700
};

const infoBoxStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  padding: 14,
  color: "#d7ddea"
};

const respostaItemStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  padding: 14
};

const fotoModalCardStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  padding: 10
};

const textareaStyle = {
  width: "100%",
  minHeight: 120,
  padding: 16,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  fontSize: 16,
  outline: "none",
  resize: "vertical",
  boxSizing: "border-box"
};

const aprovarButtonStyle = {
  padding: "16px",
  borderRadius: 16,
  border: "none",
  background: "linear-gradient(135deg,#79ff8a,#42d46a)",
  color: "#081019",
  fontSize: 18,
  fontWeight: 800,
  cursor: "pointer"
};

const reprovarButtonStyle = {
  padding: "16px",
  borderRadius: 16,
  border: "none",
  background: "linear-gradient(135deg,#ff7575,#ff4f4f)",
  color: "#fff",
  fontSize: 18,
  fontWeight: 800,
  cursor: "pointer"
};

export default Gestor;