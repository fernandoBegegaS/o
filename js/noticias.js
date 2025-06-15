$(document).ready(function () {
  const newsdataKey = "pub_25fba93aa12d40b3aedafeaf2c13a38e";
  const sectionNoticias = $("<section><h2>Noticias</h2></section>");
  $("main").append(sectionNoticias);

  const nfc = s => (s || "").normalize("NFC");

  function fetchAndAppendNoticias(query, encabezadoTexto, done) {
    $.ajax({
      url: "https://newsdata.io/api/1/news",
      method: "GET",
      data: { apikey: newsdataKey, language: "es", q: query },
      success: function (response) {
        const results = response.results || [];

        sectionNoticias.append($("<h3>").text(encabezadoTexto));

        if (results.length) {
          results.slice(0, 2).forEach(item => {
            const titulo    = nfc(item.title);
            const subtitulo = nfc(item.description);
            const pubDate   = item.pubDate;

            const fechaTexto = pubDate
              ? new Date(pubDate).toLocaleDateString(
                  "es-ES",
                  { year: "numeric", month: "2-digit", day: "2-digit" }
                )
              : "";

            const $article = $("<article>");
            $article
              .append($("<h4>").text(titulo))
              .append($("<p>").text(fechaTexto))      // ← ya no usa <small>
              .append($("<p>").text(subtitulo));

            sectionNoticias.append($article);
          });
        } else {
          sectionNoticias.append(
            $("<p>").text("No se encontraron noticias para " + encabezadoTexto)
          );
        }
        if (typeof done === "function") done();
      },
      error: function (xhr, status, error) {
        console.error("Error al obtener noticias:", error);
        if (typeof done === "function") done();
      }
    });
  }

  fetchAndAppendNoticias("Riosa Asturias",  "Noticias de Riosa", function () {
    fetchAndAppendNoticias("Mieres Asturias", "Noticias de Mieres", function () {
      fetchAndAppendNoticias("Lena Asturias", "Noticias de Pola de Lena");
    });
  });
});
