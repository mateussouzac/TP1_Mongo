const express = require("express");
const router = express.Router();
const Produto = require("../models/Produto");

/* -------------------------------------------------------------------
    GET /api/produtos
    Lista produtos com filtros opcionais:
    ?categoria=Roupas
    ?preco_min=50&preco_max=200
    ?avaliacao_minima=4
    ?cor=Preto
    ?tamanho=M
    ?termo=camiseta  (busca no nome)
    ?ordenar=preco_asc | preco_desc | avaliacao | visualizacoes
   -----------------------------------------------------------------
*/

router.get("/", async (req, res) => {
  try {
    const {
      categoria,
      preco_min,
      preco_max,
      avaliacao_minima,
      cor,
      tamanho,
      termo,
      ordenar,
    } = req.query;

    // Monta o filtro dinamicamente
    const filtro = { ativo: true };

    if (categoria) {
      filtro.categoria = { $regex: categoria, $options: "i" };
    }

    if (preco_min || preco_max) {
      filtro.preco = {};
      if (preco_min) filtro.preco.$gte = Number(preco_min);
      if (preco_max) filtro.preco.$lte = Number(preco_max);
    }

    if (termo) {
      filtro.nome = { $regex: termo, $options: "i" };
    }

    // Filtro por variações (cor e/ou tamanho)
    if (cor || tamanho) {
      const matchVariacao = {};
      if (cor) matchVariacao["variacoes.cor"] = { $regex: cor, $options: "i" };
      if (tamanho)
        matchVariacao["variacoes.tamanho"] = { $regex: tamanho, $options: "i" };
      Object.assign(filtro, matchVariacao);
    }

    // Filtro por avaliação média mínima
    if (avaliacao_minima) {
      filtro.$expr = {
        $gte: [{ $avg: "$avaliacoes.nota" }, Number(avaliacao_minima)],
      };
    }

    // Ordenação
    let ordenacao = {};
    switch (ordenar) {
      case "preco_asc":
        ordenacao = { preco: 1 };
        break;
      case "preco_desc":
        ordenacao = { preco: -1 };
        break;
      case "avaliacao":
        ordenacao = { "avaliacoes.nota": -1 };
        break;
      case "visualizacoes":
        ordenacao = { visualizacoes: -1 };
        break;
      default:
        ordenacao = { createdAt: -1 };
    }

    const produtos = await Produto.find(filtro).sort(ordenacao);

    return res.json({
      total: produtos.length,
      produtos,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro ao buscar produtos.", erro: err.message });
  }
});

/* --------------------------------------------------------------------
    GET /api/produtos/:id
    Busca produto por ID e incrementa visualizações com $inc
   -------------------------------------------------------------------
*/
router.get("/:id", async (req, res) => {
  try {
    // $inc: incrementa o contador de visualizações a cada acesso
    const produto = await Produto.findByIdAndUpdate(
      req.params.id,
      { $inc: { visualizacoes: 1 } },
      { new: true },
    );

    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }

    return res.json(produto);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro ao buscar produto.", erro: err.message });
  }
});

/* -------------------------------------------------------------------
    POST /api/produtos
    Cria um novo produto
   --------------------------------------------------------------------
*/
router.post("/", async (req, res) => {
  try {
    const { nome, categoria, preco, variacoes } = req.body;

    if (!nome || !categoria || !preco) {
      return res
        .status(400)
        .json({ message: "Nome, categoria e preço são obrigatórios." });
    }

    const produto = await Produto.create({
      nome,
      categoria,
      preco,
      variacoes: variacoes || [],
    });

    return res.status(201).json(produto);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro ao criar produto.", erro: err.message });
  }
});

/* -------------------------------------------------------------------
    PUT /api/produtos/:id
    Atualiza dados de um produto
   -------------------------------------------------------------------
*/
router.put("/:id", async (req, res) => {
  try {
    const { nome, categoria, preco, ativo } = req.body;

    const produto = await Produto.findByIdAndUpdate(
      req.params.id,
      { nome, categoria, preco, ativo },
      { new: true, runValidators: true },
    );

    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }

    return res.json(produto);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro ao atualizar produto.", erro: err.message });
  }
});

/* ---------------------------------------------------------------
    DELETE /api/produtos/:id
    Remove um produto (soft delete: marca como inativo)
   ----------------------------------------------------------------
*/
router.delete("/:id", async (req, res) => {
  try {
    const produto = await Produto.findByIdAndUpdate(
      req.params.id,
      { ativo: false },
      { new: true },
    );

    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }

    return res.json({ message: "Produto removido com sucesso." });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro ao remover produto.", erro: err.message });
  }
});

/* -------------------------------------------------------------
    POST /api/produtos/:id/avaliacoes
    Adiciona uma avaliação ao produto com $push
   -------------------------------------------------------------
*/
router.post("/:id/avaliacoes", async (req, res) => {
  try {
    const { usuarioId, nomeUsuario, nota, comentario } = req.body;

    if (!usuarioId || !nomeUsuario || !nota) {
      return res
        .status(400)
        .json({ message: "usuarioId, nomeUsuario e nota são obrigatórios." });
    }

    if (nota < 1 || nota > 5) {
      return res.status(400).json({ message: "A nota deve ser entre 1 e 5." });
    }

    // $push: adiciona a nova avaliação ao array de avaliações do produto
    const produto = await Produto.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          avaliacoes: { usuarioId, nomeUsuario, nota, comentario, curtidas: 0 },
        },
      },
      { new: true },
    );

    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }

    return res.status(201).json(produto);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro ao adicionar avaliação.", erro: err.message });
  }
});

/* -------------------------------------------------------------------
    DELETE /api/produtos/:id/avaliacoes/:avaliacaoId
    Remove uma avaliação do produto com $pull
-------------------------------------------------------------------
*/
router.delete("/:id/avaliacoes/:avaliacaoId", async (req, res) => {
  try {
    // $pull: remove do array a avaliação com o _id correspondente
    const produto = await Produto.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          avaliacoes: { _id: req.params.avaliacaoId },
        },
      },
      { new: true },
    );

    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }

    return res.json(produto);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro ao remover avaliação.", erro: err.message });
  }
});

/* -------------------------------------------------------------------
    PATCH /api/produtos/:id/avaliacoes/:avaliacaoId/curtir
 Incrementa curtidas de uma avaliação com $inc
 -------------------------------------------------------------------
*/
router.patch("/:id/avaliacoes/:avaliacaoId/curtir", async (req, res) => {
  try {
    // $inc: incrementa curtidas da avaliação específica dentro do array
    const produto = await Produto.findOneAndUpdate(
      {
        _id: req.params.id,
        "avaliacoes._id": req.params.avaliacaoId,
      },
      {
        $inc: { "avaliacoes.$.curtidas": 1 },
      },
      { new: true },
    );

    if (!produto) {
      return res
        .status(404)
        .json({ message: "Produto ou avaliação não encontrado." });
    }

    return res.json(produto);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro ao curtir avaliação.", erro: err.message });
  }
});

module.exports = router;
