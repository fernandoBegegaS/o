class Trivia {
  constructor() {
    this.elements = [
  {
    "pregunta": "¿Cuál es el punto de partida de la «Ruta de las Minas de Texeo»?",
    "respuesta1": "La Vega de Riosa",
    "respuesta2": "Llamo",
    "respuesta3": "Alto de L’Angliru",
    "respuesta4": "Aparcamiento Alto de l'Angliru",
    "respuesta5": "Mirador de Viapará",
    "respuestaCorrecta": "Llamo"
  },
  {
    "pregunta": "¿Qué plato se menciona como representativo de la gastronomía de Riosa?",
    "respuesta1": "Fabada de Riosa",
    "respuesta2": "Paella valenciana",
    "respuesta3": "Pulpo a la gallega",
    "respuesta4": "Gazpacho andaluz",
    "respuesta5": "Cocido montañés",
    "respuestaCorrecta": "Fabada de Riosa"
  },
  {
    "pregunta": "¿Qué fecha de inicio figura para el «Ascenso ciclista al Alto de L’Angliru»?",
    "respuesta1": "2025-06-15",
    "respuesta2": "2025-06-16",
    "respuesta3": "2025-06-17",
    "respuesta4": "2025-06-18",
    "respuesta5": "2025-06-14",
    "respuestaCorrecta": "2025-06-17"
  },
  {
    "pregunta": "¿Cuál es el tramo con pendiente máxima del 23,5 % en la subida al Angliru?",
    "respuesta1": "Mirador de Viapará",
    "respuesta2": "La Cueña les Cabres",
    "respuesta3": "Pico Gamonal",
    "respuesta4": "Alto de L’Angliru",
    "respuesta5": "La Vega de Riosa",
    "respuestaCorrecta": "La Cueña les Cabres"
  },
  {
    "pregunta": "En la «Ruta de las cumbres del Aramo», ¿qué pico está coronado por antenas de telecomunicaciones?",
    "respuesta1": "Pico Gamonal",
    "respuesta2": "Pico Moncuevo",
    "respuesta3": "Pico Gamoniteiro",
    "respuesta4": "Pico Xistras",
    "respuesta5": "Pico Barriscal",
    "respuestaCorrecta": "Pico Gamoniteiro"
  },
  {
    "pregunta": "Según la página de ayuda, ¿qué acción detiene el carrusel de imágenes de la página de inicio?",
    "respuesta1": "Colocar el cursor sobre la imagen",
    "respuesta2": "Pulsar la barra espaciadora",
    "respuesta3": "Hacer doble clic en la imagen",
    "respuesta4": "Cambiar de pestaña",
    "respuesta5": "Usar las flechas del teclado",
    "respuestaCorrecta": "Colocar el cursor sobre la imagen"
  },
  {
    "pregunta": "¿Cuánto dura aproximadamente la «Ruta de las Minas de Texeo» (ida y vuelta)?",
    "respuesta1": "3 horas",
    "respuesta2": "4 horas",
    "respuesta3": "5 horas",
    "respuesta4": "6 horas",
    "respuesta5": "2 horas",
    "respuestaCorrecta": "4 horas"
  },
  {
    "pregunta": "La recomendación invernal para la Ruta de las cumbres del Aramo sugiere llevar:",
    "respuesta1": "Crampones y piolet",
    "respuesta2": "Bastones de esquí",
    "respuesta3": "Tabla de snow",
    "respuesta4": "Sandalias",
    "respuesta5": "Gafas de buceo",
    "respuestaCorrecta": "Crampones y piolet"
  },
  {
    "pregunta": "¿Qué bebida tradicional aparece en un vídeo dentro de la sección de gastronomía?",
    "respuesta1": "Sidra de Riosa",
    "respuesta2": "Vino de Riosa",
    "respuesta3": "Orujo de Riosa",
    "respuesta4": "Agua de Valencia",
    "respuesta5": "Tinto de verano",
    "respuestaCorrecta": "Sidra de Riosa"
  },
  {
    "pregunta": "En la lista de ingredientes típicos, ¿qué queso azul se destaca?",
    "respuesta1": "Cabrales",
    "respuesta2": "Brie",
    "respuesta3": "Roquefort",
    "respuesta4": "Gamoneu",
    "respuesta5": "Idiazábal",
    "respuestaCorrecta": "Cabrales"
  }
 ];

    this.numeroPreguntas = 10;
    this.index = 0;
    this.aciertos = 0;
    this.correctSound = new Audio("multimedia/audios/acierto.mp3");
    this.errorSound  = new Audio("multimedia/audios/error.mp3");
  }

  shuffleElements() {
    for (let i = this.elements.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.elements[i], this.elements[j]] = [this.elements[j], this.elements[i]];
    }
  }

  construirHTMLPregunta() {
    const pregunta = this.elements[this.index];

    $("article").find("article[data-pregunta]").remove();

    const optionHTML = n =>
      `<p><label><input type="radio" name="respuesta" value="${pregunta["respuesta" + n]}"> ${pregunta["respuesta" + n]}</label></p>`;

    const preguntaHTML = `
      <article data-pregunta="${this.index}">
        <h4>${pregunta.pregunta}</h4>
        ${optionHTML(1)}
        ${optionHTML(2)}
        ${optionHTML(3)}
        ${optionHTML(4)}
        ${optionHTML(5)}
      </article>
    `;

    $("article").append(preguntaHTML);

    const $btn = $('button:contains("Siguiente")').prop("disabled", true);
    $('input[name="respuesta"]').one("change", () => $btn.prop("disabled", false));
  }

  comprobarRespuesta() {
    const seleccion = $('input[name="respuesta"]:checked').val();
    const correcta  = this.elements[this.index].respuestaCorrecta;

    if (seleccion === correcta) {
      this.aciertos++;
      this.correctSound.play();
    } else {
      this.errorSound.play();
    }
    this.mostrarSiguientePregunta();
  }

  mostrarSiguientePregunta() {
    this.index++;
    if (this.index < this.numeroPreguntas) {
      this.construirHTMLPregunta();
      return;
    }

    const mejor = localStorage.getItem("mejor");
    $("article").html("<h3>¡Trivia completada!</h3>");

    if (mejor === null || this.aciertos > +mejor) {
      $("article").append(`<p>Nuevo récord personal: ${this.aciertos} de ${this.numeroPreguntas}</p>`);
      localStorage.setItem("mejor", this.aciertos);
    } else {
      $("article").append(
        `<p>Ha acertado ${this.aciertos} de ${this.numeroPreguntas}</p>
         <p>Su mejor puntuación hasta el momento es ${mejor} aciertos</p>`
      );
    }
    this.$controlBtn.text("Volver a jugar");
  }

  inicializrBotones() {
    this.$controlBtn = $('button:contains("Iniciar")').first();
    this.$controlBtn.on("click", () => this.iniciarTrivia());
  }

  iniciarTrivia() {
    this.shuffleElements();
    this.index    = 0;
    this.aciertos = 0;

    this.$controlBtn.text("Reiniciar");
    $("article").remove();

    const articleHTML = `
      <article>
        <h3>Responde a las preguntas</h3>
        <button disabled>Siguiente</button>
      </article>
    `;
    this.$controlBtn.before(articleHTML);

    this.construirHTMLPregunta();
    $('button:contains("Siguiente")').on("click", () => this.comprobarRespuesta());
  }

  guardarProgreso(aciertos, indicePregunta) {
    localStorage.setItem("aciertos", aciertos);
    localStorage.setItem("indicePregunta", indicePregunta);
  }
}

const miTrivia = new Trivia();
miTrivia.inicializrBotones();
