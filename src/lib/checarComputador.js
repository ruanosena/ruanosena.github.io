import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const __public = path.join(__dirname, "..", "..", "build", "assets", "data");
const destino = path.join(__public, "meu_computador");

/** @param {Pc} dados  */
function gravar(dados) {
	fs.writeFileSync(path.join(destino, "pc.json"), JSON.stringify(dados, null, 2));
}

/**
 * @typedef {Object} Pc
 * @property {string} tipo
 * @property {number} memoria
 * @property {string} modeloCpu
 * @property {number} quantidadeCpu
 * @property {string} versao
 */

function obterDadosDoPc() {
	const cpus = os.cpus();
	/** @type {Pc} */
	const dados = {
		tipo: os.type(),
		memoria: os.totalmem(),
		modeloCpu: cpus[0].model,
		quantidadeCpu: cpus.length,
		versao: os.version(),
	};
	return dados;
}

export default function runComputador() {
	gravar(obterDadosDoPc());
}
