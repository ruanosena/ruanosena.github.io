import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const __public = path.join(__dirname, "..", "..", "build", "assets", "data");
const destino = path.join(__public, "lixeira");

async function limparDestino() {
	fs.readdirSync(destino)
		.filter((arq) => ![".gitkeep", "info.json"].includes(arq))
		.forEach((arq) => {
			fs.rmSync(path.join(destino, arq));
		});
	return Promise.resolve();
}

/** @param {Diretorio} diretorio  */
function copiar(diretorio) {
	diretorio.arquivos.forEach((arq) => {
		const arquivoAbsoluto = path.join(diretorio.caminho, arq);
		const destinoAbsoluto = path.join(destino, arq);
		fs.copyFileSync(arquivoAbsoluto, destinoAbsoluto);
	});
}

/**
 * @typedef {Object} Diretorio
 * @property {string} caminho
 * @property {Array<string>} arquivos
 */

/**
 * @param {string?} caminho
 * @returns {Diretorio}
 */
function ler(caminhoAbsoluto) {
	if (!caminhoAbsoluto) caminhoAbsoluto = getCaminhoAbsoluto();
	const arquivos = filtrarArquivos(fs.readdirSync(caminhoAbsoluto));
	return { caminho: caminhoAbsoluto, arquivos };
}

/** @param {Array<string>} arquivos */
function filtrarArquivos(arquivos) {
	const extensoesValidas = [".txt", ".md"];
	arquivos = arquivos.filter((arq) => extensoesValidas.some((ext) => arq.endsWith(ext)));
	// desconsidera arquivos como LICENSE.txt | arquivo.LICENSE.txt
	const nomeInvalido = /(^|\.)[A-Z]+\./;
	arquivos = arquivos.filter((arq) => !nomeInvalido.test(arq));
	return arquivos;
}

function getCaminhoAbsoluto() {
	// /home/$user
	const home = os.homedir();
	switch (process.platform) {
		// TODO: add darwin
		case "win32":
			// windows
			return path.join(home, "..", "..", "$Recycle.Bin");
		default:
			// linux
			return path.join(home, ".local", "share", "Trash", "files");
	}
}

/** @param {string?} caminho */
export default function runLixeira(caminho) {
	limparDestino().then(() => copiar(ler(caminho)));
}
