document.addEventListener("DOMContentLoaded", () => {
	definirBackground(".pagina__conteudo");
	definirRelogio(".frequente__hora");
	const fubah = document.createElement("div");
	fubah.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque harum nam voluptatibus consectetur commodi. Voluptas molestiae odit nemo minus dolor. Nemo, inventore dicta? Est laborum perspiciatis officia explicabo molestias suscipit?"
	novaTela({ botaoSeletor: "#documentos", conteudo: fubah })
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
	const fechar = document.createElement("span");
	fechar.classList.add("cabecalho__fechar");
	cabecalho.appendChild(titulo);
	cabecalho.appendChild(fechar);
	dialogo.appendChild(cabecalho);

	tela.conteudo.classList.add("dialogo__conteudo");
	dialogo.appendChild(tela.conteudo);

	document.body.appendChild(dialogo);
	// adiciona o ouvinte
	botao.addEventListener("dblclick", () => {
		dialogo.showModal();
		fechar.addEventListener("click", () => {
			dialogo.close();
		}, { once: true })
	});
}
