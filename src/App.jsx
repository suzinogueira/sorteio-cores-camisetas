import { useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";

export default function App() {
  const [nomes, setNomes] = useState("");
  const [generoAtivo, setGeneroAtivo] = useState(false);
  const [resultado, setResultado] = useState([]);

  const cores = ["Verde", "Rosa", "Amarelo", "Azul"];
  const coresHex = {
    Verde: "#2E8B57",
    Rosa: "#FF69B4",
    Amarelo: "#FFD700",
    Azul: "#1E90FF",
  };

  const textoCor = {
    Verde: "#ffffff",
    Rosa: "#ffffff",
    Amarelo: "#000000",
    Azul: "#ffffff",
  };

  function sortearCores() {
    const lista = nomes
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n !== "");

    if (lista.length === 0) {
      alert("Adicione nomes antes de sortear!");
      return;
    }

    const grupos = generoAtivo
      ? {
          masculino: lista.filter((n) =>
            n.toLowerCase().includes("(m)")
          ),
          feminino: lista.filter((n) =>
            n.toLowerCase().includes("(f)")
          ),
        }
      : { todos: lista };

    const novoResultado = [];

    for (const grupo in grupos) {
      const pessoas = grupos[grupo];
      const sorteio = [];
      let i = 0;

      for (const pessoa of pessoas) {
        sorteio.push({
          nome: pessoa,
          cor: cores[i % cores.length],
        });
        i++;
      }

      novoResultado.push(...sorteio.sort(() => Math.random() - 0.5));
    }

    setResultado(novoResultado);
  }

  function baixarTXT() {
    const texto = resultado.map((r) => `${r.nome}: ${r.cor}`).join("\n");
    const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sorteio.txt";
    link.click();
  }

  function baixarExcel() {
    const ws = XLSX.utils.json_to_sheet(resultado);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sorteio");
    XLSX.writeFile(wb, "sorteio.xlsx");
  }

  return (
    <div className="app-container">
      <h1 className="titulo">🎨 Sorteio de Cores</h1>

      <textarea
        className="area-texto"
        placeholder="Digite um nome por linha (adicione (M) ou (F) se quiser sortear por gênero)"
        value={nomes}
        onChange={(e) => setNomes(e.target.value)}
      />

      <div className="botoes">
        <button onClick={sortearCores}>Sortear</button>
        <button onClick={baixarTXT}>Baixar TXT</button>
        <button onClick={baixarExcel}>Baixar Excel</button>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={generoAtivo}
            onChange={() => setGeneroAtivo(!generoAtivo)}
          />
          Sortear por gênero
        </label>
      </div>

      {resultado.length > 0 && (
        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cor</th>
            </tr>
          </thead>
          <tbody>
            {resultado.map((r, i) => (
              <tr
                key={i}
                style={{
                  backgroundColor: coresHex[r.cor],
                  color: textoCor[r.cor],
                }}
              >
                <td>{r.nome}</td>
                <td>{r.cor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
