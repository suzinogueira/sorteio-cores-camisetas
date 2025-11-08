import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [qtdPessoas, setQtdPessoas] = useState("");
  const [resultado, setResultado] = useState([]);
  const [loading, setLoading] = useState(false);

  const cores = ["Verde", "Rosa", "Amarelo", "Azul"];

  const sortear = () => {
    const pessoas = parseInt(qtdPessoas);

    if (!pessoas || pessoas <= 0) {
      alert("Por favor, insira um número válido de pessoas.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const distribuicao = {
        Verde: 0,
        Rosa: 0,
        Amarelo: 0,
        Azul: 0,
      };

      // distribuição mais equilibrada possível
      for (let i = 0; i < pessoas; i++) {
        const cor = cores[i % cores.length];
        distribuicao[cor]++;
      }

      // embaralhar resultado
      const resultadoFinal = [];
      Object.entries(distribuicao).forEach(([cor, quantidade]) => {
        for (let i = 0; i < quantidade; i++) {
          resultadoFinal.push(cor);
        }
      });

      setResultado(resultadoFinal.sort(() => Math.random() - 0.5));
      setLoading(false);
    }, 800);
  };

  return (
    <div className="container">
      <h1>🎨 Embaralhador de Camisetas</h1>

      <div className="input-group">
        <input
          type="number"
          placeholder="Número de pessoas"
          value={qtdPessoas}
          onChange={(e) => setQtdPessoas(e.target.value)}
        />
        <button onClick={sortear} disabled={loading}>
          {loading ? "Sorteando..." : "Sortear Cores"}
        </button>
      </div>

      {resultado.length > 0 && (
        <div className="resultado">
          {resultado.map((cor, index) => (
            <div key={index} className={`item ${cor.toLowerCase()}`}>
              {cor}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
