import { useState } from "react";
import Login from "./Login";
import Colaborador from "./Colaborador";
import Gestor from "./Gestor";

function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogin = async () => {
  try {
    const response = await fetch("http://localhost:3001/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        senha: senha
      })
    });

    const data = await response.json();

    console.log("RESPOSTA:", data);

    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      alert("Login realizado com sucesso!");
      window.location.reload();

    } else {
      alert("Erro no login");
    }

  } catch (error) {
    console.error("ERRO:", error);
    alert("Erro ao conectar com o servidor");
  }
};

if (!user) {
  return <Login />;
}

  if (user.tipo?.toUpperCase() === "GESTOR") {
  return <Gestor />;
}

if (user.tipo?.toUpperCase() === "COLABORADOR") {
  return <Colaborador />;
}
  return <h1>Erro: tipo de usuário inválido</h1>;
}

export default App;