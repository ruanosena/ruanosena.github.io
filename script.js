/** @typedef {"lixeira" | "computador" | "documentos", "navegador"} SeletorId */

/**
 * @callback CriarCorpoDeTela
 * @returns {Promise<[HTMLElement | null, HTMLElement | null]>}
 */

/** @typedef {Object<SeletorId, CriarCorpoDeTela>} Diretorios */

/** @type {Diretorios} */
const DIRETORIOS = {
	lixeira: async () => {
		const diretorio = "lixeira";
		const caminho = `assets/data/${diretorio}`;
		/** @type {import("../src/index").Info} */
		const dados = await fetch(`${caminho}/info.json`).then((resposta) => resposta.json());
		const info = criarInfo(dados, diretorio);
		const conteudo = criarConteudo(dados.arquivos, caminho);
		return [conteudo, info];
	},
	computador: async () => {
		const diretorio = "meu_computador";
		const caminho = `assets/data/${diretorio}`;
		/** @type {import("../src/index").Info} */
		const dados = await fetch(`${caminho}/info.json`).then((resposta) => resposta.json());
		/** @type {import("../src/lib/checarComputador").Pc} */
		const dadosPc = await fetch(`${caminho}/${dados.arquivos[0]}`).then((resposta) => resposta.json());
		const info = criarInfo(dados, diretorio, criarMetadadosDePc(dadosPc));
		const conteudo = null;
		return [conteudo, info];
	},
	documentos: async () => {
		const diretorio = "meus_documentos";
		const caminho = `assets/data/${diretorio}`;
		/** @type {import("../src/index").Info} */
		const dados = await fetch(`${caminho}/info.json`).then((resposta) => resposta.json());
		const info = criarInfo(dados, diretorio);
		const conteudo = criarConteudo(dados.arquivos, caminho);
		return [conteudo, info];
	},
	navegador: async () => {
		const diretorio = "internet_explorer";
		const caminho = `assets/data/${diretorio}`;
		/** @type {import("../src/index").Info} */
		const dados = await fetch(`${caminho}/info.json`).then((resposta) => resposta.json());
		const info = null;
		/** @type {Array<import("../src/lib/checarExplorer").Link>} */
		const links = await fetch(`${caminho}/${dados.arquivos[0]}`).then((resposta) => resposta.json());
		const conteudo = criarConteudoDoNavegador(links);
		return [conteudo, info];
	},
};

/** @type {Object<string, string>} */
const ICONES = {
	".pdf": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
	".txt": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`,
	// default
	".\\[a-z]+": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-digit"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><rect width="4" height="6" x="2" y="12" rx="2"/><path d="M10 12h2v6"/><path d="M10 18h4"/></svg>`,
};

/**
 * @param {string} arquivo
 * @returns {string}
 */
function obterIcone(arquivo) {
	for (const extensao of Object.keys(ICONES)) {
		if (new RegExp(`\\${extensao}$`).test(arquivo)) return ICONES[extensao];
	}
}

document.addEventListener("DOMContentLoaded", () => {
	definirBackground(".pagina__conteudo");
	definirRelogio(".frequente__hora");
	definirTelas(DIRETORIOS);
	definirMenu();
});

/**
 * @param {string} seletor
 * @param {number} intervaloMinutos
 */
function definirBackground(seletor, intervaloMinutos = 2) {
	intervaloMinutos = intervaloMinutos * 60 * 1000;
	function getAleatorio() {
		const aleatorio = Math.random();
		return aleatorio.toString().slice(2);
	}
	let temporizador;
	const elt = document.querySelector(seletor);
	elt.style.backgroundImage = `url(https://robohash.org/${getAleatorio()})`;

	document.addEventListener("visibilitychange", () => {
		if (document.hidden) {
			// atualiza sempre que muda a aba
			clearInterval(temporizador);
			elt.style.backgroundImage = `url(https://robohash.org/${getAleatorio()})`;
		} else {
			// reinicia o temporizador
			temporizador = setInterval(() => {
				elt.style.backgroundImage = `url(https://robohash.org/${getAleatorio()})`;
			}, intervaloMinutos);
		}
	});
}

/** @param {string} seletor  */
function definirRelogio(seletor) {
	function getHoraLocal() {
		const hora = new Date();
		const horario = hora.toLocaleTimeString().split(":");
		return [`${horario[0]}:${horario[1]}`, Number(horario[2]), hora.toISOString()];
	}
	// define a hora inicialmente
	let hora = getHoraLocal();
	const horaElt = document.createElement("time");
	horaElt.textContent = hora[0];
	horaElt.dateTime = hora[2];

	document.querySelector(seletor).appendChild(horaElt);
	setTimeout(() => {
		// aguarda a diferença de segundos até o próximo 00
		hora = getHoraLocal();
		horaElt.textContent = hora[0];
		horaElt.dateTime = hora[2];
		setInterval(() => {
			// atualiza a cada 01 minuto
			hora = getHoraLocal();
			horaElt.textContent = hora[0];
			horaElt.dateTime = hora[2];
		}, 1000 * 60);
	}, (60 - hora[1]) * 1000);
}

/**
 * @typedef {Object} Tela
 * @prop {string} botaoSeletor
 * @prop {[HTMLElement, HTMLElement]} corpo
 */

/** @param {Tela} tela */
function novaTela({ botaoSeletor, corpo }) {
	/** @type {HTMLElement} */
	const botao = document.querySelector(botaoSeletor);
	// configura a janela do dialogo
	const dialogo = document.createElement("dialog");
	dialogo.classList.add("dialogo");

	const cabecalho = document.createElement("header");
	cabecalho.classList.add("cabecalho", "dialogo__cabecalho");
	const titulo = document.createElement("div");
	titulo.classList.add("cabecalho__titulo");
	titulo.textContent = botao.textContent;
	cabecalho.appendChild(titulo);

	const cabecalhoControles = document.createElement("div");
	cabecalhoControles.classList.add("controles", "cabecalho__controles");
	const minimizar = document.createElement("span");
	minimizar.classList.add("controles__minimizar");
	const fechar = document.createElement("span");
	fechar.classList.add("controles__fechar");
	cabecalhoControles.appendChild(minimizar);
	cabecalhoControles.appendChild(fechar);
	cabecalho.appendChild(cabecalhoControles);

	dialogo.appendChild(cabecalho);
	const corpoElt = document.createElement("div");
	corpoElt.classList.add("dialogo__corpo");

	const [conteudo, info] = corpo;
	if (conteudo) {
		if (info) conteudo.style.paddingRight = "0.5rem";
		corpoElt.appendChild(conteudo);
	} else {
		dialogo.style.width = "max-content";
	}
	if (info) {
		corpoElt.classList.add("corpo_container");
		if (conteudo) info.style.paddingLeft = "0.5rem";
		corpoElt.appendChild(info);
	} // sem info não é adicionado padding do container, só pro conteudo (caso do navegador)

	dialogo.appendChild(corpoElt);
	document.body.appendChild(dialogo);

	const caixa = novaCaixaDePrograma(botao.querySelector(".item__icone"));
	let jaAdicionouCaixa = false;

	const programas = document.querySelector(".programas");

	botao.addEventListener("dblclick", () => {
		if (!jaAdicionouCaixa || caixa.style.getPropertyValue("display") === "none") {
			programas.appendChild(caixa);
			caixa.style.removeProperty("display");
			jaAdicionouCaixa = true;
		}

		dialogo.show();
		caixa.classList.add("caixa_ativo"); // quando criado ou MAXIMIZADO
		empilharTelaAberta([dialogo, caixa]);
	});

	const barraDoRodape = document.querySelector(".principal__rodape");

	document.body.addEventListener("click", (evento) => {
		// MINIMIZAR tudo
		if (dialogo.open) {
			if (!dialogo.contains(evento.target)) {
				if (!barraDoRodape.contains(evento.target)) {
					// clique no conteudo da página
					dialogo.close();
					caixa.classList.remove("caixa_ativo");
					empilharTelaAberta(null);
				}
			} else {
				if (!telaEstaPorCima(dialogo)) {
					// sobrepor
					dialogo.show();
					// remove outra caixa ativa
					document.querySelector(".caixa_ativo")?.classList.remove("caixa_ativo");
					caixa.classList.add("caixa_ativo");
					empilharTelaAberta([dialogo, caixa]);
				}
			}
		}
	});

	caixa.addEventListener("click", () => {
		if (telaEstaPorCima(dialogo)) {
			// MINIMIZAR
			dialogo.close();
			caixa.classList.remove("caixa_ativo");
			empilharTelaAberta([dialogo], -1);
		} else {
			// MAXIMIZAR
			dialogo.show();
			// remove outra caixa ativa
			document.querySelector(".caixa_ativo")?.classList.remove("caixa_ativo");
			caixa.classList.add("caixa_ativo");
			empilharTelaAberta([dialogo, caixa]);
		}
	});

	// MINIMIZAR, no botão
	minimizar.addEventListener("click", (evento) => {
		evento.stopPropagation();
		dialogo.close();
		caixa.classList.remove("caixa_ativo");
		const caixaAtual = empilharTelaAberta([dialogo], -1);
		caixaAtual?.classList.add("caixa_ativo");
	});
	// FECHAR, no botão
	fechar.addEventListener("click", (evento) => {
		evento.stopPropagation();
		dialogo.close();
		caixa.style.setProperty("display", "none");
		const caixaAtual = empilharTelaAberta([dialogo], -1);
		caixaAtual?.classList.add("caixa_ativo");
	});
}

/** @type {Array<[HTMLDialogElement, HTMLElement]>} */
let telasAbertas = [];

/**
 * @param {[HTMLDialogElement, HTMLElement | undefined]?} tela
 * @param {number} [z=1] acima `1`, ou remover `-1`
 * @returns {HTMLElement | undefined} caixaAtiva
 */
function empilharTelaAberta(conjunto, z = 1) {
	if (conjunto === null) {
		telasAbertas.length = 0;
		return;
	}
	const [tela] = conjunto;
	if (z === 1) {
		let zIndex = 0;
		telasAbertas = telasAbertas.reduce((telas, [telaAberta, caixaAtual]) => {
			// reordena zIndex
			if (!telaAberta.isEqualNode(tela)) {
				telaAberta.style.setProperty("z-index", zIndex++);
				telas.push([telaAberta, caixaAtual]);
			}
			return telas;
		}, []);

		tela.style.setProperty("z-index", zIndex);
		telasAbertas.push(conjunto);
	} else {
		telasAbertas = telasAbertas.reduce((telas, [telaAberta, caixaAtual]) => {
			if (!telaAberta.isEqualNode(tela)) telas.push([telaAberta, caixaAtual]);
			return telas;
		}, []);
		// retorna a caixa da tela que ficou por cima
		const caixaAtiva = telasAbertas[telasAbertas.length - 1];
		return caixaAtiva && caixaAtiva[1];
	}
}

/** @param {HTMLDialogElement} tela  */
function telaEstaPorCima(tela) {
	const telaPorCima = telasAbertas[telasAbertas.length - 1];
	return !!telaPorCima && telaPorCima[0].isEqualNode(tela);
}

/**
 * @param {Element} icone
 * @returns {HTMLDivElement} caixa
 */
function novaCaixaDePrograma(icone) {
	const caixa = document.createElement("div");
	caixa.classList.add("caixa", "programas__item");
	/** @type {Element} */
	const caixaIcone = icone.cloneNode(true);
	caixaIcone.classList.remove("item__icone");
	caixaIcone.classList.add("caixa__icone");
	caixa.appendChild(caixaIcone);

	return caixa;
}

/** @param {Diretorios} telas  */
async function definirTelas(telas) {
	for (const [id, criarCorpoDeTela] of Object.entries(telas)) {
		novaTela({ botaoSeletor: "#" + id, corpo: await criarCorpoDeTela() });
	}
}

/**
 * @param {import("../src/index").Info} info
 * @param {string} diretorio
 *
 */
function criarInfo(info, diretorio, metadadosAdicionais) {
	const container = document.createElement("div");
	const titulo = document.createElement("code");
	titulo.textContent = diretorio;
	container.appendChild(titulo);
	const subTitulo = document.createElement("h3");
	subTitulo.textContent = `${info.itens} ${info.itens !== 1 ? "itens" : "item"}, totalizando ${formatarBytes(
		info.totalBytes
	)}`;
	container.appendChild(subTitulo);

	const metadados = document.createElement("div");
	metadados.classList.add("info__metadados");
	const modificado = document.createElement("div");
	const modificadoLabel = document.createElement("span");
	modificadoLabel.textContent = "Modificado";
	modificadoLabel.classList.add("info__label");
	modificado.appendChild(modificadoLabel);
	modificado.innerHTML += new Date(info.atualizadoEm).toLocaleString();
	metadados.appendChild(modificado);

	const criado = document.createElement("div");
	const criadoLabel = document.createElement("span");
	criadoLabel.classList.add("info__label");
	criadoLabel.textContent = "Criado";
	criado.appendChild(criadoLabel);
	criado.innerHTML += new Date(info.atualizadoEm).toLocaleString();
	metadados.appendChild(criado);

	container.appendChild(metadados);
	if (metadadosAdicionais) container.appendChild(metadadosAdicionais);
	container.classList.add("dialogo__info");

	return container;
}

/** @param {import("../src/lib/checarComputador").Pc} dados */
function criarMetadadosDePc(dados) {
	const metadados = document.createElement("div");
	metadados.classList.add("info__metadados");
	const sO = document.createElement("div");
	const sOLabel = document.createElement("span");
	sOLabel.textContent = "Sistema operacional";
	sOLabel.classList.add("info__label");
	sO.appendChild(sOLabel);
	sO.innerHTML += dados.tipo;
	metadados.appendChild(sO);

	const memoria = document.createElement("div");
	const memoriaLabel = document.createElement("span");
	memoriaLabel.classList.add("info__label");
	memoriaLabel.textContent = "Memória";
	memoria.appendChild(memoriaLabel);
	memoria.innerHTML += formatarBytes(dados.memoria);
	metadados.appendChild(memoria);

	const cpu = document.createElement("div");
	const cpuLabel = document.createElement("span");
	cpuLabel.classList.add("info__label");
	cpuLabel.textContent = "CPU";
	cpu.appendChild(cpuLabel);
	cpu.innerHTML += `${dados.quantidadeCpu}x ${dados.modeloCpu}`;
	metadados.appendChild(cpu);

	const kernel = document.createElement("div");
	const kernelLabel = document.createElement("span");
	kernelLabel.classList.add("info__label");
	kernelLabel.textContent = "Kernel";
	kernel.appendChild(kernelLabel);
	kernel.innerHTML += dados.versao;
	metadados.appendChild(kernel);

	return metadados;
}

/**
 * @param {number} bytes
 * @param {number} [decimals=2]
 * @link https://stackoverflow.com/a/18650828
 */
function formatarBytes(bytes, decimals = 2) {
	if (!+bytes) return "0 Bytes";

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = [
		"Bytes",
		"kB" /* kilobyte */,
		"MB" /* megabyte */,
		"GB" /* gigabyte */,
		"TB" /* terabyte */,
		"PB" /* petabyte */,
		"EB" /* exabyte */,
		"ZB" /* zettabyte */,
		"YB" /* yottabyte */,
	];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * @param {Array<string>} arquivos
 * @param {string} caminhoRelativo
 */
function criarConteudo(arquivos, caminhoRelativo) {
	const container = document.createElement("div");
	container.classList.add("conteudo", "dialogo__conteudo");
	for (const arquivo of arquivos) {
		const item = document.createElement("a");
		item.classList.add("item", "conteudo__item");
		item.href = `${caminhoRelativo}/${arquivo}`;
		item.target = "_blank";
		// icone HTML svg
		item.innerHTML = obterIcone(arquivo);
		item.querySelector("svg")?.classList.add("item__icone");
		const nome = document.createElement("span");
		nome.textContent = arquivo;
		nome.classList.add("item__nome");
		item.title = arquivo;
		item.appendChild(nome);
		container.appendChild(item);
	}
	return container;
}

/** @param {Array<import("../src/lib/checarExplorer").Link>} links  */
function criarConteudoDoNavegador(links) {
	links = links.filter(({ url }) => {
		const urlObject = new URL(url);
		if (urlObject.pathname === "/") return urlObject.origin !== window.location.origin;
		return true;
	});

	const navegador = document.createElement("div");
	navegador.classList.add("navegador", "dialogo__navegador");

	const navegadorCabecalho = document.createElement("div");
	navegadorCabecalho.classList.add("cabecalho", "navegador__cabecalho");
	navegador.appendChild(navegadorCabecalho);

	const menuSites = document.createElement("select");
	menuSites.classList.add("menu", "cabecalho__menu");
	navegadorCabecalho.appendChild(menuSites);

	for (const link of links) {
		const linkOpt = document.createElement("option");
		linkOpt.value = link.nome;
		linkOpt.textContent = link.url;
		linkOpt.title = new Date(link.criadoEm).toLocaleDateString();
		menuSites.appendChild(linkOpt);
	}

	const navegadorContainer = document.createElement("iframe");
	navegadorContainer.classList.add("container", "navegador__container");

	navegador.appendChild(navegadorContainer);

	let linkAtual = links[0].url;
	navegadorContainer.src = linkAtual;
	navegadorContainer.title = links[0].nome;

	/** @type {Object<string, string>} */
	const linksMap = links.reduce((map, { nome, url }) => {
		map[nome] = url;
		return map;
	}, {});

	menuSites.addEventListener("change", (evento) => {
		if ((linkAtual = linksMap[evento.target.value])) {
			navegadorContainer.src = linkAtual;
			navegadorContainer.title = evento.target.value;
		}
	});

	return navegador;
}

function definirMenu() {
	/** @type {HTMLButtonElement} */
	const botao = document.querySelector(".fixo__botao");
	const menu = document.querySelector(".fixo__menu");
	botao.addEventListener("click", (evento) => {
		evento.stopPropagation();
		botao.dataset["aberto"] = !menu.toggleAttribute("hidden");
	});

	document.body.addEventListener("click", (evento) => {
		if (botao.dataset["aberto"] == "true" && !botao.contains(evento.target)) {
			botao.dataset["aberto"] = !menu.toggleAttribute("hidden");
		}
	});
}
