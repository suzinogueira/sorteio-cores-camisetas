import { useState } from "react";
import { saveAs } from "file-saver";
import "./App.css";

export default function App() {
  const [inputText, setInputText] = useState("");
  const [participants, setParticipants] = useState([]);
  const [sortOption, setSortOption] = useState("geral"); // "geral" ou "genero"

  const cores = ["Verde", "Azul", "Amarelo", "Rosa"];

  const sexoMap = {
    mulher: "F",
    feminino: "F",
    f: "F",
    m: "M",
    homem: "M",
    h: "M",
    masculino: "M"
  };

  function parseList(text) {
    return text
      .split("\n")
      .map((line) => {
        if (!line.trim()) return null;
        const parts = line.split(/-(?=[^ -]+$)/).map((p) => p.trim());
        if (parts.length < 2) return null;
        const sexoRaw = parts[parts.length - 1];
        const resto = parts.slice(0, parts.length - 1).join(" - ");
        const [nome, modelo, tamanho] = resto.split(" - ").map((p) => p.trim());
        const sexoPadronizado = sexoMap[sexoRaw.toLowerCase()] || sexoRaw.toUpperCase();
        return { nome, modelo, tamanho, sexo: sexoPadronizado, cor: "" };
      })
      .filter(Boolean);
  }

  function shuffle(arr) {
    return arr
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  function generateColorsArray(groupSize, availableColors) {
    const times = Math.ceil(groupSize / availableColors.length);
    const arr = [];
    for (let i = 0; i < times; i++) {
      arr.push(...shuffle(availableColors));
    }
    return arr.slice(0, groupSize);
  }

  function assignColors(list) {
    if (sortOption === "geral") {
      const repeatedColors = generateColorsArray(list.length, cores);
      return list.map((p, i) => ({ ...p, cor: repeatedColors[i] }));
    }

    if (sortOption === "genero") {
      const homens = list.filter((p) => p.sexo === "M");
      const mulheres = list.filter((p) => p.sexo === "F");

      const coresHomem = cores.filter((c) => c !== "Rosa");
      const coresHomensFinal = generateColorsArray(homens.length, coresHomem);
      const coresMulheresFinal = generateColorsArray(mulheres.length, cores);

      const homensComCores = homens.map((p, i) => ({
        ...p,
        cor: coresHomensFinal[i],
      }));
      const mulheresComCores = mulheres.map((p, i) => ({
        ...p,
        cor: coresMulheresFinal[i],
      }));

      return shuffle([...mulheresComCores, ...homensComCores]);
    }
  }

  function processList() {
    const list = parseList(inputText);
    const coloredList = assignColors(list);
    setParticipants(coloredList);
  }

  function downloadCSV() {
    const header = "Nome,Modelo,Tamanho,Sexo,Cor\n";
    const rows = participants
      .map((p) => `${p.nome},${p.modelo},${p.tamanho},${p.sexo},${p.cor}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "camisetas.csv");
  }

  return (
    <div className="App">
      <h1>Embaralhador de Cores - Confraternização</h1>

      <label>Opção de Sorteio: </label>
      <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
        <option value="geral">Sorteio Geral</option>
        <option value="genero">Sorteio por Gênero</option>
      </select>

      <br />
      <br />

      <textarea
        rows={12}
        cols={50}
        placeholder="Cole a lista aqui: Nome - Modelo - Tamanho - Sexo (F/M)"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <br />
      <button onClick={processList}>Embaralhar Cores</button>
      <button onClick={downloadCSV} style={{ marginLeft: "10px" }}>
        Baixar CSV
      </button>

      {participants.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Modelo</th>
              <th>Tamanho</th>
              <th>Sexo</th>
              <th>Cor</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p, index) => (
              <tr key={index} style={{ backgroundColor: p.cor.toLowerCase() }}>
                <td>{p.nome}</td>
                <td>{p.modelo}</td>
                <td>{p.tamanho}</td>
                <td>{p.sexo}</td>
                <td>{p.cor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
