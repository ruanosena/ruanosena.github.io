document.addEventListener("DOMContentLoaded", () => {
	definirBackground(".pagina__conteudo");
	definirRelogio(".frequente__hora");
	const fubah = document.createElement("div");
	fubah.textContent =
		"Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque harum nam voluptatibus consectetur commodi. Voluptas molestiae odit nemo minus dolor. Nemo, inventore dicta? Est laborum perspiciatis officia explicabo molestias suscipit?";
	novaTela({ botaoSeletor: "#documentos", conteudo: fubah });
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
function novaTela(tela) {
	/** @type {HTMLElement} */
	const botao = document.querySelector(tela.botaoSeletor);
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

	tela.conteudo.classList.add("dialogo__conteudo");
	dialogo.appendChild(tela.conteudo);
	document.body.appendChild(dialogo);

	const caixa = novaCaixaDePrograma(botao.querySelector(".item__icone"));
	let jaAdicionouCaixa = false;

	botao.addEventListener("dblclick", () => {
		if (!jaAdicionouCaixa || caixa.style.getPropertyValue("display") === "none") {
			const programas = document.querySelector(".programas");
			programas.appendChild(caixa);
			caixa.style.removeProperty("display");
			jaAdicionouCaixa = true;
		}

		dialogo.show();
		// MAXIMIZADO pelo clique duplo (não é criado novo dialogo, janela)
		caixa.classList.add("caixa_ativo");
	});

	document.addEventListener("click", (evento) => {
		// MINIMIZAR, sem ser no botão
		const barraDoRodape = document.querySelector(".principal__rodape");
		if (dialogo.open) {
			if (!dialogo.contains(evento.target)) {
				if (barraDoRodape.contains(evento.target)) {
					// clique na barra do rodapé. Só é minimizado se foi na própria caixa
					if (caixa.contains(evento.target)) {
						dialogo.close();
						caixa.classList.remove("caixa_ativo");
					}
				} else {
					dialogo.close();
					caixa.classList.remove("caixa_ativo");
				}
			}
		} else {
			// MAXIMIZAR pela caixa
			if (caixa.contains(evento.target)) {
				dialogo.show();
				caixa.classList.add("caixa_ativo");
			}
		}
	});

	// MINIMIZAR, no botão
	minimizar.addEventListener("click", () => {
		dialogo.close();
		caixa.classList.remove("caixa_ativo");
	});
	// FECHAR, no botão
	fechar.addEventListener("click", () => {
		dialogo.close();
		caixa.style.setProperty("display", "none");
	});
}

/**
 * @param {Element} icone
 * @returns {HTMLDivElement} caixa
 */
function novaCaixaDePrograma(icone) {
	const caixa = document.createElement("div");
	caixa.classList.add("caixa", "programas__item", "caixa_ativo"); // por padrão é ativo quando criado
	/** @type {Element} */
	const caixaIcone = icone.cloneNode(true);
	caixaIcone.classList.remove("item__icone");
	caixaIcone.classList.add("caixa__icone");
	caixa.appendChild(caixaIcone);

	return caixa;
}
