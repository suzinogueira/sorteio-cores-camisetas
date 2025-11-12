import React, { useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import "./App.css";

const cores = ["Verde", "Azul", "Amarelo", "Rosa", "Lilás"];

const corTexto = () => "#000"; // sempre preto para legibilidade

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
        if (partes.length < 3) return null;
        const [nome, modelo, tamanho] = partes;
        return { nome, modelo, tamanho, cor: "" };
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

  // --- Contar cores ---
  const contarCores = lista => {
    const contagem = { Rosa: 0, Verde: 0, Azul: 0, Amarelo: 0, Lilás: 0 };
    lista.forEach(p => {
      if (p.cor && contagem.hasOwnProperty(p.cor)) contagem[p.cor]++;
    });
    return contagem;
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

  const contagem = contarCores(dados);

  return (
    <div className="app-container">
      <h1 className="titulo">🎁 Sorteador de Camisetas da Confra</h1>

      <textarea
        className="area-texto"
        placeholder="Cole a lista aqui (Nome - Modelo - Tamanho)"
        value={texto}
        onChange={e => setTexto(e.target.value)}
      />

      <div className="botoes">
        <button onClick={parseDados}>Carregar Lista</button>
        <button onClick={sortearGeral}>Sortear</button>
        <button onClick={baixarTXT}>Baixar TXT</button>
        <button onClick={baixarExcel}>Baixar Excel</button>
      </div>

      {dados.length > 0 && (
        <>
          <p>
            <strong>Total:</strong> {dados.length} pessoas |{" "}
            <strong>Rosa:</strong> {contagem.Rosa} |{" "}
            <strong>Verde:</strong> {contagem.Verde} |{" "}
            <strong>Azul:</strong> {contagem.Azul} |{" "}
            <strong>Amarelo:</strong> {contagem.Amarelo} |{" "}
            <strong>Lilás:</strong> {contagem.Lilás}
          </p>

          <div className="resumo-cores">
            <div className="indicador-cor rosa">Rosa {contagem.Rosa}</div>
            <div className="indicador-cor verde">Verde {contagem.Verde}</div>
            <div className="indicador-cor azul">Azul {contagem.Azul}</div>
            <div className="indicador-cor amarelo">Amarelo {contagem.Amarelo}</div>
            <div className="indicador-cor lilas">Lilás {contagem.Lilás}</div>
          </div>

          <table className="tabela">
            <thead>
              <tr>
                {["numero", "nome", "modelo", "tamanho", "cor"].map(col => (
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
