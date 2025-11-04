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

const cores = ["Verde", "Azul", "Amarelo", "Rosa"];
const coresHomem = ["Verde", "Azul", "Amarelo"];

function App() {
  const [texto, setTexto] = useState("");
  const [dados, setDados] = useState([]);

  // --- Parse da lista ---
  const parseDados = () => {
    const linhas = texto.split("\n").filter(l => l.trim() !== "");
    const parsed = linhas.map(linha => {
      const partes = linha.split(" - ").map(p => p.trim());
      if (partes.length < 4) return null; // ignora linhas incompletas
      const [nome, modelo, tamanho, genero] = partes;
      return { nome, modelo, tamanho, genero: genero.toUpperCase(), cor: "" };
    }).filter(Boolean);
    setDados(parsed);
  };

  // --- Função de embaralhar ---
  const embaralharArray = arr => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // --- Distribuição equilibrada de cores ---
  const distribuirCores = (lista, coresDisponiveis) => {
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

  // --- Sorteio geral ---
  const sortearGeral = () => {
    if (dados.length === 0) return alert("Carregue a lista primeiro!");
    const coresDistribuidas = distribuirCores(dados, cores);
    const novosDados = dados.map((p, idx) => ({ ...p, cor: coresDistribuidas[idx] }));
    setDados(novosDados);
  };

  // --- Sorteio por gênero ---
  const sortearPorGenero = () => {
    if (dados.length === 0) return alert("Carregue a lista primeiro!");

    const homens = dados.filter(p => p.genero === "M");
    const mulheres = dados.filter(p => p.genero === "F");

    const coresHDistribuidas = distribuirCores(homens, coresHomem);
    const coresFDistribuidas = distribuirCores(mulheres, cores);

    const homensFinal = homens.map((p, i) => ({ ...p, cor: coresHDistribuidas[i] }));
    const mulheresFinal = mulheres.map((p, i) => ({ ...p, cor: coresFDistribuidas[i] }));

    setDados([...homensFinal, ...mulheresFinal]);
  };

  // --- Baixar TXT ---
  const baixarTXT = () => {
    if (dados.length === 0) return alert("Não há dados para baixar!");
    const linhas = dados.map(d => `${d.nome} - ${d.modelo} - ${d.tamanho} - ${d.cor}`).join("\n");
    const blob = new Blob([linhas], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "camisetas.txt");
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
      <button onClick={baixarTXT}>Baixar TXT</button>
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
              <td style={{
                width: "30px",
                height: "30px",
                backgroundColor: p.cor ? p.cor.toLowerCase() : "transparent",
                border: "1px solid #000",
                textAlign: "center"
              }}>
                {p.cor}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;


