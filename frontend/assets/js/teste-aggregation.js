const API = "http://localhost:3000/api";

function mostrarAgregacao(elId, data) {
  document.getElementById(elId).textContent = JSON.stringify(data, null, 2);
}

async function carregarAgregacoes() {
  try {
    const res = await fetch(`${API}/produtos/aggregations`);
    const data = await res.json();

    if (!res.ok) {
      mostrarAgregacao("res-aggregations", data);
      return;
    }

    mostrarAgregacao("res-aggregations", data);
  } catch (err) {
    mostrarAgregacao("res-aggregations", {
      message: "Erro ao buscar agregações.",
      erro: err.message,
    });
  }
}
