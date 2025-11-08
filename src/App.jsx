import React, { useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import "./App.css";

const cores = ["Verde", "Azul", "Amarelo", "Rosa"];
const coresHomem = ["Verde", "Azul", "Amarelo"];

const corTexto = cor => {
  return "#000";
};

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

  // --- Cor do texto (ajustada) ---
  const corTexto = cor => {
    const claras = ["Amarelo", "Rosa"];
    return claras.includes(cor) ? "#000" : "#000"; // tudo preto pra evitar sumir no fundo
  };

  // --- Contar cores ---
  const contarCores = lista => {
    const contagem = { Rosa: 0, Verde: 0, Azul: 0, Amarelo: 0 };
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

  // --- Sorteio por gênero (respeita "homens não recebem rosa" e equilibra globalmente) ---
const sortearPorGenero = () => {
  if (dados.length === 0) return alert("Carregue a lista primeiro!");

  const homens = dados.filter(p => p.genero === "M");
  const mulheres = dados.filter(p => p.genero === "F");
  const total = homens.length + mulheres.length;

  // 1) metas iniciais por cor (diferença max 1)
  const base = Math.floor(total / cores.length);
  let resto = total % cores.length;
  const targets = { Verde: base, Azul: base, Amarelo: base, Rosa: base };
  const coresOrdem = ["Verde", "Azul", "Amarelo", "Rosa"];

  // Distribui o resto para as cores que têm mais "eligibilidade"
  // (eligibilidade de Rosa = mulheres.length, dos outros = total)
  const eligibilidade = coresOrdem.map(c => ({
    cor: c,
    cap: c === "Rosa" ? mulheres.length : total
  }));
  // ordenar por cap decrescente para distribuir o resto para as mais possíveis
  eligibilidade.sort((a, b) => b.cap - a.cap);

  for (let i = 0; i < resto; i++) {
    targets[eligibilidade[i % eligibilidade.length].cor]++;
  }

  // 2) garante que a soma de targets permitidos para homens seja >= homens.length
  const allowedForMen = ["Verde", "Azul", "Amarelo"];
  let somaPermitidaParaHomens = allowedForMen.reduce((s, c) => s + targets[c], 0);

  if (somaPermitidaParaHomens < homens.length) {
    // precisamos mover vagas de Rosa para as cores permitidas
    let deficit = homens.length - somaPermitidaParaHomens;
    // tira de Rosa (até onde houver) e distribui entre as permitidas, uma a uma
    const tirarDeRosa = Math.min(deficit, targets.Rosa);
    targets.Rosa -= tirarDeRosa;
    deficit -= tirarDeRosa;
    // se ainda houver deficit (Rosa ficou em 0), espalha entre permitidas
    let idx = 0;
    while (deficit > 0) {
      const cor = allowedForMen[idx % allowedForMen.length];
      targets[cor] += 1;
      deficit--;
      idx++;
    }
    somaPermitidaParaHomens = allowedForMen.reduce((s, c) => s + targets[c], 0);
  }

  // 3) aloca cores para homens respeitando targets (round-robin sem ultrapassar target)
  const resultado = [];
  const contagemTemp = { Rosa: 0, Verde: 0, Azul: 0, Amarelo: 0 };

  // cria mapa de vagas restantes por cor (clonando targets)
  const vagas = { ...targets };

  // aloca homens primeiro — só nas cores permitidas
  let iMen = 0;
  const homensCopy = embaralharArray([...homens]); // embaralha homens pra não priorizar ordem
  while (iMen < homensCopy.length) {
    // tenta percorrer cores permitidas e achar uma com vaga
    let assigned = false;
    for (let j = 0; j < allowedForMen.length; j++) {
      const cor = allowedForMen[(iMen + j) % allowedForMen.length];
      if (vagas[cor] > 0) {
        const pessoa = homensCopy[iMen];
        resultado.push({ ...pessoa, cor });
        vagas[cor]--;
        contagemTemp[cor]++;
        assigned = true;
        break;
      }
    }
    // se por algum motivo não conseguiu (não deveria), força atribuição na primeira permitida
    if (!assigned) {
      const cor = allowedForMen[0];
      const pessoa = homensCopy[iMen];
      resultado.push({ ...pessoa, cor });
      vagas[cor] = Math.max(0, vagas[cor] - 1);
      contagemTemp[cor]++;
    }
    iMen++;
  }

  // 4) aloca mulheres para completar as vagas restantes (inclui Rosa)
  const mulheresCopy = embaralharArray([...mulheres]);
  let iWomen = 0;
  const coresList = coresOrdem; // Verde, Azul, Amarelo, Rosa (ordem para preencher)
  while (iWomen < mulheresCopy.length) {
    // encontra próxima cor com vaga
    let found = false;
    for (let j = 0; j < coresList.length; j++) {
      const cor = coresList[(iWomen + j) % coresList.length];
      if (vagas[cor] > 0) {
        const pessoa = mulheresCopy[iWomen];
        resultado.push({ ...pessoa, cor });
        vagas[cor]--;
        contagemTemp[cor]++;
        found = true;
        break;
      }
    }
    if (!found) {
      const cor = coresList[0];
      const pessoa = mulheresCopy[iWomen];
      resultado.push({ ...pessoa, cor });
      contagemTemp[cor]++;
    }
    iWomen++;
  }

  // 5) numera e embaralha levemente para não ficar agrupado por gênero
  const final = embaralharArray(resultado).map((p, idx) => ({ ...p, numero: idx + 1 }));

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

  const contagem = contarCores(dados);

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
          <p>
            <strong>Total:</strong> {dados.length} pessoas |{" "}
            <strong>Rosa:</strong> {contagem.Rosa} |{" "}
            <strong>Verde:</strong> {contagem.Verde} |{" "}
            <strong>Azul:</strong> {contagem.Azul} |{" "}
            <strong>Amarelo:</strong> {contagem.Amarelo}
          </p>

          <div className="resumo-cores">
            {Object.entries(contagem).map(([cor, qtd]) => (
              <div key={cor} className={`caixa-cor ${cor.toLowerCase()}`}>
                <span>{cor}</span>
                <strong>{qtd}</strong>
              </div>
            ))}
          </div>
          
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
