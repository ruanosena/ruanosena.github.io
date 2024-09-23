import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const __public = path.join(__dirname, "..", "..", "assets", "data");
const destino = path.join(__public, "meus_documentos");

async function limparDestino() {
	fs.readdirSync(destino)
		.filter((arq) => ![".gitkeep", "info.json"].includes(arq))
		.forEach((arq) => {
			fs.rmSync(path.join(destino, arq));
		});
	return Promise.resolve();
}

// caminho com arquivos escolhidos
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
	const extensoesValidas = [".pdf", ".md", ".txt", ".jpg", ".jpeg"];
	arquivos = arquivos.filter((arq) => extensoesValidas.some((ext) => arq.endsWith(ext)));
	// pula arquivos com nomes não desejados
	const pularArquivos = ["boleto"];
	arquivos = arquivos.filter(
		(arq) => !pularArquivos.some((pular) => arq.slice(0, arq.lastIndexOf(".")).includes(pular))
	);
	return arquivos;
}

function getCaminhoAbsoluto() {
	switch (process.platform) {
		// TODO: add darwin, win32
		default:
			// linux
			const cwd = process.cwd().split("/");
			// /home/$user
			const base = cwd.slice(0, 3).join("/");
			return path.join(base, "Documentos");
	}
}

/** @param {string?} caminho */
export default function runDocumentos(caminho) {
	limparDestino().then(() => copiar(ler(caminho)));
}
