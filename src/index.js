import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const __public = path.join(__dirname, "..", "assets", "data");

/**
 * @typedef {Object} Info
 * @property {string} nome
 * @property {number} itens
 * @property {number?} totalBytes
 * @property {number?} atualizadoEm
 * @property {number?} criadoEm
 */

/** @typedef {"lixeira" | "meu_computador" | "meus_documentos" | "internet_explorer"} Id */

/**
 * @param {Id} identificador
 * @returns {Info}
 */
function getInfo(identificador) {
	let caminho = path.join(__public, identificador);
	const diretorioPropriedades = fs.statSync(caminho);
	// TODO: adicionar schema para 'info.json'
	/** @type {Info} */
	const info = JSON.parse(fs.readFileSync(path.join(caminho, "info.json"), "utf-8"));

	info.criadoEm = info.criadoEm || diretorioPropriedades.birthtimeMs;

	const arquivos = fs.readdirSync(caminho).filter((arquivo) => arquivo !== "info.json");
	// Não conta o '.size' do arquivo 'info.json', ao invés, leva em conta o diretorio.
	if (arquivos.length) {
		const arquivosPropriedades = arquivos.map((arquivo) => fs.statSync(path.join(caminho, arquivo)));

		info.totalBytes = arquivosPropriedades.reduce((soma, { size }) => {
			return soma + size;
		}, diretorioPropriedades.size);

		info.atualizadoEm = arquivosPropriedades.reduce((atualizadoMs, { mtimeMs }) => {
			return mtimeMs > atualizadoMs ? mtimeMs : atualizadoMs;
		}, diretorioPropriedades.mtimeMs);
	} else {
		if (info.itens /* possuia arquivos anteriormente */) info.atualizadoEm = Date.now();
		else info.atualizadoEm = diretorioPropriedades.mtimeMs;

		info.totalBytes = diretorioPropriedades.size;
	}

	info.itens = arquivos.length;

	return info;
}

console.log(getInfo("lixeira"), getInfo("meu_computador"));
