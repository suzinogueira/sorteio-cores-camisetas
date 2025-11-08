import React, { useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import "./App.css";

const cores = ["Verde", "Azul", "Amarelo", "Rosa"];
const coresHomem = ["Verde", "Azul", "Amarelo"];

function App() {
  const [texto, setTexto] = useState("");
  const [dados, setDados] = useState([]);
  const [ordenarPor, setOrdenarPor] = useState("");

  // --- Parse da lista ---
  const parseDados = () => {
    const linhas = texto.split("\n").filter(l => l.trim() !== "");
    const parsed = linhas
      .map(linha => {
        const partes = linha.split(" - ").map(p => p.trim());
        if (partes.length < 4) return null;
        const [nome, modelo, tamanho, genero] = partes;
        return { nome, modelo, tamanho, genero: genero.toUpperCase(), cor: "" };
      })
      .filter(Boolean);
    setDados(parsed);
  };

  // --- Embaralhar ---
  const embaralharArray = arr => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // --- Distribuição equilibrada ---
  const distribuirCoresEquilibradas = (totalPessoas, coresDisponiveis) => {
    const qtdPorCorBase = Math.floor(totalPessoas / coresDisponiveis.length);
    let resto = totalPessoas % coresDisponiveis.length;

    const listaCores = [];
    coresDisponiveis.forEach(cor => {
      for (let i = 0; i < qtdPorCorBase; i++) listaCores.push(cor);
      if (resto > 0) {
        listaCores.push(cor);
        resto--;
      }
    });

    return embaralharArray(listaCores).slice(0, totalPessoas);
  };

  // --- Função cor do texto ---
  const corTexto = cor => {
    const claras = ["Amarelo", "Rosa", "Branco"];
    return claras.includes(cor) ? "#000" : "#fff";
  };

  // --- Sorteio geral ---
  const sortearGeral = () => {
    if (dados.length === 0) return alert("Carregue a lista primeiro!");
    const coresDistribuidas = distribuirCoresEquilibradas(dados.length, cores);
    const atualizados = dados.map((p, i) => ({
      ...p,
      cor: coresDistribuidas[i],
      numero: i + 1
    }));
    setDados(atualizados);
  };

  // --- Sorteio por gênero ---
  const sortearPorGenero = () => {
    if (dados.length === 0) return alert("Carregue a lista primeiro!");

    const homens = dados.filter(p => p.genero === "M");
    const mulheres = dados.filter(p => p.genero === "F");

    const coresH = distribuirCoresEquilibradas(homens.length, coresHomem);
    const coresF = distribuirCoresEquilibradas(mulheres.length, cores);

    const homensFinal = homens.map((p, i) => ({ ...p, cor: coresH[i] }));
    const mulheresFinal = mulheres.map((p, i) => ({ ...p, cor: coresF[i] }));

    const combinado = [...homensFinal, ...mulheresFinal];

    // --- Rebalanceia pra igualdade ---
    let todasCores = [];
    const total = combinado.length;
    const porCor = Math.floor(total / cores.length);
    let resto = total % cores.length;

    cores.forEach(cor => {
      for (let i = 0; i < porCor; i++) todasCores.push(cor);
      if (resto > 0) {
        todasCores.push(cor);
        resto--;
      }
    });

    todasCores = embaralharArray(todasCores);

    const final = combinado.map((p, i) => ({
      ...p,
      cor: todasCores[i],
      numero: i + 1
    }));

    setDados(final);
  };

  // --- Baixar TXT ---
  const baixarTXT = () => {
    if (dados.length === 0) return alert("Não há dados para baixar!");
    const linhas = dados
      .map(d => `${d.nome} - ${d.modelo} - ${d.tamanho} - ${d.cor}`)
      .join("\n");
    const blob = new Blob([linhas], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "camisetas.txt");
  };

  // --- Baixar Excel ---
  const baixarExcel = () => {
    if (dados.length === 0) return alert("Não há dados para baixar!");
    const ws = XLSX.utils.json_to_sheet(
      dados.map(d => ({
        Nº: d.numero,
        Nome: d.nome,
        Modelo: d.modelo,
        Tamanho: d.tamanho,
        Cor: d.cor
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Camisetas");
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), "camisetas.xlsx");
  };

  // --- Ordenar tabela ---
  const ordenarTabela = coluna => {
    let novaLista = [...dados];
    novaLista.sort((a, b) => {
      if (a[coluna] < b[coluna]) return -1;
      if (a[coluna] > b[coluna]) return 1;
      return 0;
    });
    setDados(novaLista);
    setOrdenarPor(coluna);
  };

  return (
    <div className="app-container">
      <h1 className="titulo">🎁 Embaralhador de Camisetas</h1>

      <textarea
        className="area-texto"
        placeholder="Cole a lista aqui (Nome - Modelo - Tamanho - F/M)"
        value={texto}
        onChange={e => setTexto(e.target.value)}
      />

      <div className="botoes">
        <button onClick={parseDados}>Carregar Lista</button>
        <button onClick={sortearGeral}>Sortear Geral</button>
        <button onClick={sortearPorGenero}>Sortear por Gênero</button>
        <button onClick={baixarTXT}>Baixar TXT</button>
        <button onClick={baixarExcel}>Baixar Excel</button>
      </div>

      {dados.length > 0 && (
        <>
          <p><strong>Total:</strong> {dados.length} pessoas</p>

          <table className="tabela">
            <thead>
              <tr>
                {["numero", "nome", "modelo", "tamanho", "genero", "cor"].map(col => (
                  <th
                    key={col}
                    onClick={() => ordenarTabela(col)}
                    style={{ cursor: "pointer" }}
                  >
                    {col.toUpperCase()} {ordenarPor === col ? "▼" : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dados.map((p, idx) => (
                <tr key={idx}>
                  <td>{p.numero}</td>
                  <td>{p.nome}</td>
                  <td>{p.modelo}</td>
                  <td>{p.tamanho}</td>
                  <td>{p.genero}</td>
                  <td
                    style={{
                      backgroundColor: p.cor ? p.cor.toLowerCase() : "transparent",
                      color: corTexto(p.cor),
                      fontWeight: "bold"
                    }}
                  >
                    {p.cor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default App;
