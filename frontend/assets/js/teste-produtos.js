const API = "http://localhost:3000/api";

// Exibe resultado formatado na tela
function mostrar(elId, data) {
  document.getElementById(elId).textContent = JSON.stringify(data, null, 2);
}

// Limpa filtros da seção 1
function limparFiltros() {
  [
    "f-termo",
    "f-categoria",
    "f-preco-min",
    "f-preco-max",
    "f-avaliacao",
    "f-cor",
    "f-tamanho",
  ].forEach((id) => {
    document.getElementById(id).value = "";
  });
  document.getElementById("f-ordenar").value = "";
  document.getElementById("res-listar").textContent =
    "Resultado aparecerá aqui...";
}

// 1. Listar com filtros
async function listarProdutos() {
  const params = new URLSearchParams();
  const termo = document.getElementById("f-termo").value;
  const categoria = document.getElementById("f-categoria").value;
  const precoMin = document.getElementById("f-preco-min").value;
  const precoMax = document.getElementById("f-preco-max").value;
  const avaliacao = document.getElementById("f-avaliacao").value;
  const cor = document.getElementById("f-cor").value;
  const tamanho = document.getElementById("f-tamanho").value;
  const ordenar = document.getElementById("f-ordenar").value;

  if (termo) params.append("termo", termo);
  if (categoria) params.append("categoria", categoria);
  if (precoMin) params.append("preco_min", precoMin);
  if (precoMax) params.append("preco_max", precoMax);
  if (avaliacao) params.append("avaliacao_minima", avaliacao);
  if (cor) params.append("cor", cor);
  if (tamanho) params.append("tamanho", tamanho);
  if (ordenar) params.append("ordenar", ordenar);

  const res = await fetch(`${API}/produtos?${params}`);
  mostrar("res-listar", await res.json());
}

// 2. Buscar por ID ($inc visualizações)
async function buscarPorId() {
  const id = document.getElementById("get-id").value.trim();
  if (!id) return alert("Informe o ID do produto.");
  const res = await fetch(`${API}/produtos/${id}`);
  mostrar("res-get-id", await res.json());
}

// 3. Criar produto
async function criarProduto() {
  const nome = document.getElementById("c-nome").value.trim();
  const categoria = document.getElementById("c-categoria").value.trim();
  const preco = document.getElementById("c-preco").value;

  if (!nome || !categoria || !preco)
    return alert("Preencha nome, categoria e preço.");

  const res = await fetch(`${API}/produtos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, categoria, preco: Number(preco) }),
  });
  mostrar("res-criar", await res.json());
}

// 4. Adicionar avaliação ($push)
async function adicionarAvaliacao() {
  const prodId = document.getElementById("av-prod-id").value.trim();
  const usuarioId = document.getElementById("av-user-id").value.trim();
  const nomeUsuario = document.getElementById("av-nome").value.trim();
  const nota = document.getElementById("av-nota").value;
  const comentario = document.getElementById("av-comentario").value.trim();

  if (!prodId || !usuarioId || !nomeUsuario || !nota)
    return alert("Preencha todos os campos obrigatórios.");

  const res = await fetch(`${API}/produtos/${prodId}/avaliacoes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usuarioId,
      nomeUsuario,
      nota: Number(nota),
      comentario,
    }),
  });
  mostrar("res-avaliacao", await res.json());
}

// 5. Remover avaliação ($pull)
async function removerAvaliacao() {
  const prodId = document.getElementById("del-prod-id").value.trim();
  const avId = document.getElementById("del-av-id").value.trim();

  if (!prodId || !avId) return alert("Informe o ID do produto e da avaliação.");

  const res = await fetch(`${API}/produtos/${prodId}/avaliacoes/${avId}`, {
    method: "DELETE",
  });
  mostrar("res-del-av", await res.json());
}

// 6. Curtir avaliação ($inc)
async function curtirAvaliacao() {
  const prodId = document.getElementById("cur-prod-id").value.trim();
  const avId = document.getElementById("cur-av-id").value.trim();

  if (!prodId || !avId) return alert("Informe o ID do produto e da avaliação.");

  const res = await fetch(
    `${API}/produtos/${prodId}/avaliacoes/${avId}/curtir`,
    { method: "PATCH" },
  );
  mostrar("res-curtir", await res.json());
}

// 7. Deletar produto
async function deletarProduto() {
  const id = document.getElementById("del-prod").value.trim();
  if (!id) return alert("Informe o ID do produto.");
  if (!confirm("Tem certeza que deseja deletar?")) return;

  const res = await fetch(`${API}/produtos/${id}`, { method: "DELETE" });
  mostrar("res-del-prod", await res.json());
}
