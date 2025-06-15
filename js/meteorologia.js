class Concejo {
    constructor(nombre, capital, poblacion) {
        this.nombre     = nombre;
        this.capital    = capital;
        this.poblacion  = poblacion;
        this.circuito   = null;
        this.gobierno   = null;
        this.coordenadas= null;
        this.religion   = null;
    }

    rellenar(circuito, gobierno, coordenadas, religion) {
        this.circuito    = circuito;
        this.gobierno    = gobierno;
        this.coordenadas = coordenadas;
        this.religion    = religion;
    }

    getNombre() {
        document.write("<p>" + this.nombre + "</p>");
    }

    getCapital() {
        document.write("<p>" + this.capital + "</p>");
    }

    getInformacionSecundaria() {
        let string = "<ul>";
        string += "<li>" + this.circuito    + "</li>";
        string += "<li>" + this.gobierno    + "</li>";
        string += "<li>" + this.coordenadas + "</li>";
        string += "</ul>";
        document.write(string);
    }

    getTiempoActual() {
        
        const apikey = "NDZ684YZ4AN6MMA56HGUXJSC6";
        const lugar = "La Vega de Riosa,Spain";

        const urlVC =
          `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/` +
          `${encodeURIComponent(lugar)}/` +
          `today?unitGroup=metric&include=current&key=${apikey}&lang=es`;

        $.ajax({
            url: urlVC,
            method: "GET",
            dataType: "json",
            success: (respuesta) => {
                const cc = respuesta.currentConditions;
                const dia = {
                    datetime: new Date().toISOString().split("T")[0], 
                    conditions: cc.conditions,
                    temp:       cc.temp,
                    humidity:   cc.humidity,
                    windspeed:  cc.windspeed,
                    icon:       cc.icon
                };

                const $main = $("main");

                const $section = $("<section></section>");
                $main.append($section);

                const $header = $("<h3>Tiempo actual en La Vega de Riosa</h3>");
                $section.append($header);

                const fechaStr   = dia.datetime;
                const iconoURL = `${'multimedia/imagenes/weather/'}${dia.icon}.png`;
                const tempActual = dia.temp.toFixed(1);
                const humedad    = dia.humidity;
                const vientoVel  = dia.windspeed.toFixed(1);

                const $articulo = $("<article></article>");
                
                $articulo.append(`<h2>${fechaStr}</h2>`);
                
                const $img = $("<img>")
                    .attr("src", iconoURL)
                    .attr("alt", dia.conditions);
                $articulo.append($img);
                $articulo.append(`<p>Condiciones: ${dia.conditions}</p>`);
                $articulo.append(`<p>Temperatura: ${tempActual} °C</p>`);
                $articulo.append(`<p>Humedad: ${humedad}%</p>`);
                $articulo.append(`<p>Viento: ${vientoVel} km/h</p>`);

                $section.append($articulo);

                this.getMeteorologia();
            },
            error: (xhr, textStatus, errorThrown) => {
                console.error("Error al obtener datos en vivo de Visual Crossing:", errorThrown);

                const $section = $("<section></section>");
                $("main").append($section);

                const $header = $("<h3>Tiempo actual en La Vega de Riosa</h3>");
                $section.append($header);

                const fechaHoy   = new Date().toISOString().split("T")[0];
                const $artError   = $("<article></article>");
                $artError.append(`<h2>${fechaHoy}</h2>`);
                $artError.append("<p>¡No se pudo obtener el tiempo en vivo!</p>");
                $section.append($artError);

                this.getMeteorologia();
            }
        });
    }

    getMeteorologia() {
        const apikey = "NDZ684YZ4AN6MMA56HGUXJSC6";
        const ciudad = "Riosa,Spain";

        const urlVC =
          `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/` +
          `${encodeURIComponent(ciudad)}/next7days?unitGroup=metric&include=days&key=${apikey}&lang=es`;

        $.ajax({
            url: urlVC,
            method: "GET",
            dataType: "json",
            success: (datosVC) => {
                const pronosticos = datosVC.days;

                const $main = $("main");

                const $section = $("<section></section>");
                $main.append($section);

                const $header = $("<h3>Predicción para los próximos 7 días en Riosa</h3>");
                $section.append($header);

                pronosticos.forEach((dia) => {
                    const fechaStr   = dia.datetime;   
                    const iconoVC    = dia.icon;       
                    const iconoURL = `${'multimedia/imagenes/weather/'}${dia.icon}.png`;
                    const tempMax    = dia.tempmax.toFixed(1);
                    const tempMin    = dia.tempmin.toFixed(1);
                    const humedad    = dia.humidity;

                    const $articulo = $("<article></article>");
                    $articulo.append(`<h2>${fechaStr}</h2>`);

                    const $img = $("<img>")
                        .attr("src", iconoURL)
                        .attr("alt", dia.conditions);
                    $articulo.append($img);

                    $articulo.append(`<p>Condiciones: ${dia.conditions}</p>`);
                    $articulo.append(`<p>Temperatura máxima: ${tempMax} °C</p>`);
                    $articulo.append(`<p>Temperatura mínima: ${tempMin} °C</p>`);
                    $articulo.append(`<p>Humedad: ${humedad}%</p>`);

                    $section.append($articulo);
                });
            },
            error: (xhr, textStatus, errorThrown) => {
                console.error("Error al obtener datos de Visual Crossing:", errorThrown);
                $("body").append("<p>¡Tenemos problemas! No puedo obtener la predicción de 7 días.</p>");
            }
        });
    }
}

$("body").append("<main></main>");

const con = new Concejo("Riosa", "España", 1848);

con.getTiempoActual();
