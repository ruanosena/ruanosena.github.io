import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import runLixeira from "./lib/checarLixeira.js";
import runExplorer from "./lib/checarExplorer.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const __public = path.join(__dirname, "..", "assets", "data");

run();

/**
 * @typedef {Object} Info
 * @property {string} $schema
 * @property {string} nome
 * @property {number} itens
 * @property {number?} totalBytes
 * @property {number?} atualizadoEm
 * @property {number?} criadoEm
 */

/** @typedef {"lixeira" | "meu_computador" | "meus_documentos" | "internet_explorer"} Id */

/**
 * @param {Id} identificador
 * @param {boolean?} checarArquivos
 * @returns {Info}
 */
function getInfo(identificador, checarArquivos = true) {
	const caminho = path.join(__public, identificador);
	const infoCaminho = path.join(caminho, "info.json");
	const jsonSchema = "data-info.schema.json";
	const diretorioPropriedades = fs.statSync(caminho);
	/** @type {Info} */
	let info = {};
	try {
		info = JSON.parse(fs.readFileSync(infoCaminho, "utf-8"));
		if (!checarArquivos) return info;
	} catch (error) {
		if (!fs.existsSync(path.join(__public, jsonSchema))) {
			throw new Error(`O arquivo '${jsonSchema}' não foi encontrado.`);
		}
		fs.rmSync(path.join(caminho, ".gitkeep"), { force: true });
	}

	info.$schema = info.$schema || path.join("..", jsonSchema);
	info.nome = info.nome || capitalizarId(identificador);

	const arquivos = fs.readdirSync(caminho).filter((arquivo) => ![".gitkeep", "info.json"].includes(arquivo));
	info.itens = arquivos.length;
	if (arquivos.length) {
		const arquivosPropriedades = arquivos.map((arquivo) => fs.statSync(path.join(caminho, arquivo)));

		// Não conta o '.size' do arquivo 'info.json', ao invés, leva em conta o diretório.
		info.totalBytes = arquivosPropriedades.reduce((soma, { size }) => {
			return soma + size;
		}, diretorioPropriedades.size);

		info.atualizadoEm = arquivosPropriedades.reduce((atualizadoMs, { mtimeMs }) => {
			return mtimeMs > atualizadoMs ? mtimeMs : atualizadoMs;
		}, diretorioPropriedades.mtimeMs);
	} else {
		if (info.totalBytes !== diretorioPropriedades.size /* possuia arquivos anteriormente */) {
			info.totalBytes = diretorioPropriedades.size;

			info.atualizadoEm = Date.now();
		} else if (!info.atualizadoEm /* 1a checagem */) info.atualizadoEm = diretorioPropriedades.mtimeMs;
	}
	info.criadoEm = info.criadoEm || diretorioPropriedades.birthtimeMs;

	return info;
}

/** @param {Id} id */
function capitalizarId(id) {
	const idArray = id.split("_");
	return idArray.map((palavra) => `${palavra[0].toUpperCase()}${palavra.slice(1)}`).join(" ");
}

/** @param {...Id} diretorios */
function checarInfoDeDiretorios(...diretorios) {
	let meuComputador = "";
	if (diretorios.includes("meu_computador")) {
		diretorios = diretorios.filter((dir) => {
			if (dir !== "meu_computador") return true;
			else meuComputador = dir;
		});
	}
	let sumBytes = 0;
	for (let dir of diretorios) {
		const info = getInfo(dir);
		sumBytes += info.totalBytes;
		fs.writeFileSync(path.join(__public, dir, "info.json"), JSON.stringify(info, null, 2), { encoding: "utf-8" });
	}
	if (meuComputador) {
		const meuComputadorInfo = getInfo("meu_computador");
		meuComputadorInfo.totalBytes += sumBytes;

		fs.writeFileSync(path.join(__public, meuComputador, "info.json"), JSON.stringify(meuComputadorInfo, null, 2), {
			encoding: "utf-8",
		});
	}
}

/** @param {"checar" | "build"} [param=process.argv[2]] primeiro argumento do script npm */
function run(param = process.argv[2]) {
	param = param?.toLowerCase() || "";
	if (param === "build") {
		const args = Object.fromEntries(process.argv.slice(3).map((arg) => arg.split("=")));
		runLixeira(args["lixeira"]);
		runExplorer(args["usuario"], args["ghpages"]);
		console.log("B U I L D");
	} else if (param === "checar") {
		checarInfoDeDiretorios("lixeira", "meu_computador", "meus_documentos", "internet_explorer");
	} else {
		console.log(getInfo("meu_computador", null));
	}
}
