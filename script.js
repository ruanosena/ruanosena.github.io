document.addEventListener("DOMContentLoaded", () => {
	definirBackground(".pagina__conteudo");
	definirRelogio(".frequente__hora");
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
			clearInterval(temporizador);
			elt.style.backgroundImage = `url(https://robohash.org/${getAleatorio()})`;
		} else {
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
	const horaElt = document.createElement("time");
	let hora = getHoraLocal();

	// define a hora inicialmente
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
