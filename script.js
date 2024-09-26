/** @typedef {string} SeletorId */
/**
 * @callback CriarConteudo
 * @returns {HTMLElement}
 */
/** @typedef {Object<SeletorId, CriarConteudo>} Diretorios */

/** @type {Diretorios} */
const DIRETORIOS = {
	lixeira: () => {
		const elt = document.createElement("div");
		elt.textContent =
			"Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque harum nam voluptatibus consectetur commodi. Voluptas molestiae odit nemo minus dolor. Nemo, inventore dicta? Est laborum perspiciatis officia explicabo molestias suscipit?";
		return elt;
	},
	computador: () => {
		const elt = document.createElement("div");
		elt.textContent =
			"Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque harum nam voluptatibus consectetur commodi. Voluptas molestiae odit nemo minus dolor. Nemo, inventore dicta? Est laborum perspiciatis officia explicabo molestias suscipit?";
		return elt;
	},
	documentos: () => {
		const elt = document.createElement("div");
		elt.textContent =
			"Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque harum nam voluptatibus consectetur commodi. Voluptas molestiae odit nemo minus dolor. Nemo, inventore dicta? Est laborum perspiciatis officia explicabo molestias suscipit?";
		return elt;
	},
	navegador: () => {
		const elt = document.createElement("div");
		elt.textContent =
			"Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque harum nam voluptatibus consectetur commodi. Voluptas molestiae odit nemo minus dolor. Nemo, inventore dicta? Est laborum perspiciatis officia explicabo molestias suscipit?";
		return elt;
	},
};

document.addEventListener("DOMContentLoaded", () => {
	definirBackground(".pagina__conteudo");
	definirRelogio(".frequente__hora");
	definirTelas(DIRETORIOS);
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
 * @prop {HTMLElement} conteudo
 */

/** @param {Tela} tela */
function novaTela({ botaoSeletor, conteudo }) {
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

	conteudo.classList.add("dialogo__conteudo");
	dialogo.appendChild(conteudo);
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

	document.addEventListener("click", (evento) => {
		// MINIMIZAR tudo
		if (dialogo.open) {
			if (!dialogo.contains(evento.target)) {
				if (!barraDoRodape.contains(evento.target)) {
					// clique no conteudo da página
					dialogo.close();
					caixa.classList.remove("caixa_ativo");
					empilharTelaAberta(null);
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
	const [tela, caixa] = conjunto;
	if (z === 1) {
		telasAbertas = telasAbertas.reduce((telas, [telaAberta, caixaAtual], index) => {
			// reordena zIndex
			if (!telaAberta.isEqualNode(tela)) {
				telaAberta.style.setProperty("z-index", index + 1);
				telas.push([telaAberta, caixaAtual]);
			}
			return telas;
		}, []);

		tela.style.setProperty("z-index", telasAbertas.length + 1);
		telasAbertas.push([tela, caixa]);
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
function definirTelas(telas) {
	for (const [id, criarConteudo] of Object.entries(telas)) {
		novaTela({ botaoSeletor: "#" + id, conteudo: criarConteudo() });
	}
}
