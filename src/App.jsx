/*import React, { useState } from "react";
import { saveAs } from "file-saver";

const cores = ["Verde", "Azul", "Amarelo", "Rosa"];
const coresHomem = ["Verde", "Azul", "Amarelo"];

function App() {
  const [texto, setTexto] = useState("");
  const [dados, setDados] = useState([]);

  const parseDados = () => {
    const linhas = texto.split("\n").filter(l => l.trim() !== "");
    const parsed = linhas.map(linha => {
      const partes = linha.split(" - ").map(p => p.trim());
      const [nome, modelo, tamanho, genero] = partes;
      return { nome, modelo, tamanho, genero, cor: "" };
    });
    setDados(parsed);
  };

  const embaralharArray = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const sortearGeral = () => {
    const qtd = dados.length;
    const coresDistribuidas = [];
    const qtdPorCor = Math.floor(qtd / cores.length);
    let extras = qtd % cores.length;

    cores.forEach(c => {
      for (let i = 0; i < qtdPorCor; i++) coresDistribuidas.push(c);
    });
    while (extras > 0) {
      coresDistribuidas.push(cores[Math.floor(Math.random() * cores.length)]);
      extras--;
    }

    const embaralhadas = embaralharArray(coresDistribuidas);
    const novosDados = dados.map((pessoa, idx) => ({
      ...pessoa,
      cor: embaralhadas[idx]
    }));
    setDados(novosDados);
  };

  const sortearPorGenero = () => {
    const qtd = dados.length;
    const dadosComCores = dados.map(pessoa => ({ ...pessoa, cor: "" }));

    // Separar homens e mulheres
    const homens = dadosComCores.filter(p => p.genero.toUpperCase() === "H" || p.genero.toUpperCase() === "M");
    const mulheres = dadosComCores.filter(p => p.genero.toUpperCase() === "F" || p.genero.toUpperCase() === "M");

    // Distribuir cores
    const coresHomemDistribuidas = [];
    const qtdPorCorHomem = Math.floor(homens.length / coresHomem.length);
    let extrasH = homens.length % coresHomem.length;

    coresHomem.forEach(c => {
      for (let i = 0; i < qtdPorCorHomem; i++) coresHomemDistribuidas.push(c);
    });
    while (extrasH > 0) {
      coresHomemDistribuidas.push(coresHomem[Math.floor(Math.random() * coresHomem.length)]);
      extrasH--;
    }

    const coresMulherDistribuidas = [];
    const qtdPorCorMulher = Math.floor(mulheres.length / cores.length);
    let extrasF = mulheres.length % cores.length;

    cores.forEach(c => {
      for (let i = 0; i < qtdPorCorMulher; i++) coresMulherDistribuidas.push(c);
    });
    while (extrasF > 0) {
      coresMulherDistribuidas.push(cores[Math.floor(Math.random() * cores.length)]);
      extrasF--;
    }

    const homensFinal = embaralharArray(coresHomemDistribuidas).map((c, i) => ({
      ...homens[i],
      cor: c
    }));

    const mulheresFinal = embaralharArray(coresMulherDistribuidas).map((c, i) => ({
      ...mulheres[i],
      cor: c
    }));

    setDados([...homensFinal, ...mulheresFinal]);
  };

  const baixarCSV = () => {
    const header = "Nome,Modelo,Tamanho,Genero,Cor\n";
    const linhas = dados.map(d => `${d.nome},${d.modelo},${d.tamanho},${d.genero},${d.cor}`).join("\n");
    const blob = new Blob([header + linhas], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "camisetas.csv");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Embaralhador de Camisetas</h1>
      <textarea
        rows={10}
        cols={50}
        placeholder="Cole a lista aqui (Nome - Modelo - Tamanho - F/M)"
        value={texto}
        onChange={e => setTexto(e.target.value)}
      />
      <br /><br />
      <button onClick={parseDados}>Carregar Lista</button>
      <button onClick={sortearGeral}>Sortear Geral</button>
      <button onClick={sortearPorGenero}>Sortear por Gênero</button>
      <button onClick={baixarCSV}>Baixar CSV</button>
      <br /><br />
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Modelo</th>
            <th>Tamanho</th>
            <th>Gênero</th>
            <th>Cor</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((p, idx) => (
            <tr key={idx}>
              <td>{p.nome}</td>
              <td>{p.modelo}</td>
              <td>{p.tamanho}</td>
              <td>{p.genero}</td>
              <td>{p.cor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
*/

import React, { useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const cores = ["Verde", "Azul", "Amarelo", "Rosa"];
const coresHomem = ["Verde", "Azul", "Amarelo"];

function App() {
  const [texto, setTexto] = useState("");
  const [dados, setDados] = useState([]);
  const [ordenarPor, setOrdenarPor] = useState("");

  const parseDados = () => {
    const linhas = texto.split("\n").filter(l => l.trim() !== "");
    const parsed = linhas.map(linha => {
      const partes = linha.split(" - ").map(p => p.trim());
      if (partes.length < 4) return null;
      const [nome, modelo, tamanho, genero] = partes;
      return { nome, modelo, tamanho, genero: genero.toUpperCase(), cor: "" };
    }).filter(Boolean);
    setDados(parsed);
  };

  const embaralharArray = arr => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const distribuirCoresEquilibradas = (lista, coresDisponiveis) => {
    const qtdPorCor = Math.floor(lista.length / coresDisponiveis.length);
    let extras = lista.length % coresDisponiveis.length;
    const coresDistribuidas = [];

    coresDisponiveis.forEach(c => {
      for (let i = 0; i < qtdPorCor; i++) coresDistribuidas.push(c);
    });

    while (extras > 0) {
      coresDistribuidas.push(coresDisponiveis[Math.floor(Math.random() * coresDisponiveis.length)]);
      extras--;
    }

    return embaralharArray(coresDistribuidas);
  };

  const sortearGeral = () => {
    if (dados.length === 0) return alert("Carregue a lista primeiro!");
    const coresDistribuidas = distribuirCoresEquilibradas(dados, cores);
    setDados(dados.map((p, i) => ({ ...p, cor: coresDistribuidas[i] })));
  };

  const sortearPorGenero = () => {
    if (dados.length === 0) return alert("Carregue a lista primeiro!");
    const homens = dados.filter(p => p.genero === "M");
    const mulheres = dados.filter(p => p.genero === "F");

    const coresH = distribuirCoresEquilibradas(homens, coresHomem);
    const coresF = distribuirCoresEquilibradas(mulheres, cores);

    const homensFinal = homens.map((p, i) => ({ ...p, cor: coresH[i] }));
    const mulheresFinal = mulheres.map((p, i) => ({ ...p, cor: coresF[i] }));

    setDados([...homensFinal, ...mulheresFinal]);
  };

  const baixarTXT = () => {
    if (dados.length === 0) return alert("Não há dados para baixar!");
    const linhas = dados.map(d => `${d.nome} - ${d.modelo} - ${d.tamanho} - ${d.cor}`).join("\n");
    const blob = new Blob([linhas], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "camisetas.txt");
  };

  const baixarExcel = () => {
    if (dados.length === 0) return alert("Não há dados para baixar!");
    const ws = XLSX.utils.json_to_sheet(dados.map(d => ({
      Nome: d.nome,
      Modelo: d.modelo,
      Tamanho: d.tamanho,
      Cor: d.cor
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Camisetas");
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), "camisetas.xlsx");
  };

  const ordenarTabela = coluna => {
    let novaLista = [...dados];
    novaLista.sort((a, b) => (a[coluna] < b[coluna] ? -1 : a[coluna] > b[coluna] ? 1 : 0));
    setDados(novaLista);
    setOrdenarPor(coluna);
  };

  return (
    <div style={{ padding: "10px", fontFamily: "Arial", maxWidth: "100%" }}>
      <h1 style={{ fontSize: "1.5em" }}>Embaralhador de Camisetas</h1>
      <textarea
        rows={8}
        style={{ width: "100%", boxSizing: "border-box", fontSize: "1em" }}
        placeholder="Cole a lista aqui (Nome - Modelo - Tamanho - F/M)"
        value={texto}
        onChange={e => setTexto(e.target.value)}
      />
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        marginTop: "10px",
        marginBottom: "10px"
      }}>
        <button onClick={parseDados} style={{ flex: "1 1 45%" }}>Carregar Lista</button>
        <button onClick={sortearGeral} style={{ flex: "1 1 45%" }}>Sortear Geral</button>
        <button onClick={sortearPorGenero} style={{ flex: "1 1 45%" }}>Sortear por Gênero</button>
        <button onClick={baixarTXT} style={{ flex: "1 1 45%" }}>Baixar TXT</button>
        <button onClick={baixarExcel} style={{ flex: "1 1 45%" }}>Baixar Excel</button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }} border="1" cellPadding="5">
          <thead>
            <tr>
              {["nome", "modelo", "tamanho", "genero", "cor"].map(col => (
                <th
                  key={col}
                  onClick={() => ordenarTabela(col)}
                  style={{ cursor: "pointer", minWidth: "80px" }}
                >
                  {col.toUpperCase()} {ordenarPor === col ? "▼" : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dados.map((p, idx) => (
              <tr key={idx}>
                <td>{p.nome}</td>
                <td>{p.modelo}</td>
                <td>{p.tamanho}</td>
                <td>{p.genero}</td>
                <td style={{
                  width: "30px",
                  height: "30px",
                  backgroundColor: p.cor.trim() ? p.cor.toLowerCase() : "transparent",
                  border: "1px solid #000",
                  textAlign: "center"
                }} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
