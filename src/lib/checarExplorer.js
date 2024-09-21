import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const __public = path.join(__dirname, "..", "..", "assets", "data");
const destino = path.join(__public, "internet_explorer");

/** @param {Array<RepoLink>} links  */
function gravar(links) {
	fs.writeFileSync(path.join(destino, "lista_de_sites.json"), JSON.stringify(links, null, 2));
}

/**
 * @typedef {Object} RepoOwner
 * @property {string} login
 */

/**
 * @typedef {Object} Repo
 * @property {string} name
 * @property {RepoOwner} owner
 * @property {string} homepage
 * @property {string} created_at
 */

/**
 * @typedef {Object} RepoLink
 * @property {string} nome
 * @property {string} url
 * @property {number} criadoEm
 */

/**
 * @param {string?} [usuario=""]
 * @param {boolean?} [checarGitHubPages=false]
 * @returns {Promise<Array<RepoLink>>}
 */
async function fetchPaginasDeRepositoriosDoGithub(usuario = "", checarGitHubPages = false) {
	usuario = usuario || obterNomeDeUsuario();
	if (!usuario) return console.error(new Error("Não foi informado um nome de usuário no GitHub"));

	/** @type {Array<RepoLink>} */
	const links = [];

	for (let pagina = 1, itensPorPagina = 20; ; pagina++) {
		const resposta = await fetch(
			`https://api.github.com/users/${usuario}/repos?per_page=${itensPorPagina}&page=${pagina}`,
			{
				headers: { Accept: "application/json" },
			}
		);
		/** @type {Array<Repo>} */
		const repos = await resposta.json();

		// indexa todas páginas válidas
		await Promise.all(
			repos.map(({ name, owner: { login }, homepage, created_at }) => {
				const url = homepage || (checarGitHubPages && `https://${login}.github.io/${name}`);
				if (!url || name === login) return Promise.resolve(); // não requisita se não houver a página ou se for o repo pessoal do GitHub

				return new Promise(async (res) => {
					if (await checarCarregamentoHTTP(url)) {
						links.push({ nome: name, url, criadoEm: new Date(created_at).valueOf() });
					}
					res();
				});
			})
		);

		if (repos.length < itensPorPagina) break;
	}

	// ordena do mais recente para o mais antigo
	return links.sort((a, b) => b.criadoEm - a.criadoEm);
}

/** @param {string} url  */
async function checarCarregamentoHTTP(url) {
	const resposta = await fetch(url);
	return resposta.status < 400;
}

function obterNomeDeUsuario() {
	/** @type {Object} */
	const dadosRepositorio = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "package.json")));
	return dadosRepositorio.author || "";
}

/**
 * @param {string?} usuario
 * @param {boolean?} gitHubPages
 */
export default function runExplorer(usuario, gitHubPages) {
	fetchPaginasDeRepositoriosDoGithub(usuario, gitHubPages).then(gravar);
}
