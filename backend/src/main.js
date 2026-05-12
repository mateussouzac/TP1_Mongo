const mongoose = require("mongoose");
const Produto = require("./models/Produto");
const Pedido = require("./models/pedido");

const MONGO_URI = "mongodb://localhost:27017/puccommerce";

const main = async () => {
  // -- CONEXÃO ------------------------------------------
  await mongoose.connect(MONGO_URI);
  console.log(" Conectado ao MongoDB!\n");

  // -- 1 INSERÇÃO -----------------------------------------
  console.log("[INSERÇÃO] Criando novo produto...");
  const novoProduto = await Produto.create({
    nome: "Boné Nike",
    categoria: "Acessórios",
    preco: 79.9,
    variacoes: [
      { cor: "Preto", tamanho: "Único", estoque: 15 },
      { cor: "Branco", tamanho: "Único", estoque: 10 },
    ],
  });
  console.log(
    `   Produto criado: ${novoProduto.nome} (ID: ${novoProduto._id})\n`,
  );

  // -- 2 CONSULTA -----------------------------------------
  console.log(
    '[CONSULTA] Buscando produtos da categoria "Acessórios" com preço até R$200...',
  );
  const produtos = await Produto.find({
    ativo: true,
    categoria: { $regex: "Acessórios", $options: "i" },
    preco: { $lte: 200 },
  }).sort({ preco: 1 });
  console.log(`   ${produtos.length} produto(s) encontrado(s):`);
  produtos.forEach((p) =>
    console.log(
      `   - ${p.nome} | R$${p.preco} | Visualizações: ${p.visualizacoes}`,
    ),
  );
  console.log();

  // -- 3 ATUALIZAÇÃO ($inc) --------------------------------
  console.log("[ATUALIZAÇÃO - $inc] Incrementando visualizações do produto...");
  const produtoAtualizado = await Produto.findByIdAndUpdate(
    novoProduto._id,
    { $inc: { visualizacoes: 1 } },
    { new: true },
  );
  console.log(
    `   Visualizações de "${produtoAtualizado.nome}": ${produtoAtualizado.visualizacoes}\n`,
  );

  // -- 4 EXCLUSÃO LÓGICA (SOFT DELETE) --------------------
  console.log(
    "[EXCLUSÃO] Realizando exclusão lógica do produto (soft delete)...",
  );
  await Produto.findByIdAndUpdate(novoProduto._id, { $set: { ativo: false } });
  const produtoInativo = await Produto.findById(novoProduto._id);
  console.log(
    `Produto "${produtoInativo.nome}" - ativo: ${produtoInativo.ativo}`,
  );
  console.log(
    "   (Documento ainda existe no banco, apenas marcado como inativo)\n",
  );

  // -- AGGREGATION ---------
  console.log("[AGGREGATION] Relatórios de produtos e pedidos:\n");

  const relatorioCategoria = await Produto.aggregate([
    { $match: { ativo: true } },
    {
      $group: {
        _id: "$categoria",
        quantidade: { $sum: 1 },
        precoMedio: { $avg: "$preco" },
        totalVisualizacoes: { $sum: "$visualizacoes" },
      },
    },
    { $sort: { quantidade: -1 } },
  ]);

  console.log("Produtos por categoria:");
  relatorioCategoria.forEach((item) =>
    console.log(
      ` - ${item._id}: ${item.quantidade} produtos | preço médio R$${item.precoMedio.toFixed(2)} | visualizações ${item.totalVisualizacoes}`,
    ),
  );
  console.log();

  const relatorioAvaliacoes = await Produto.aggregate([
    { $match: { ativo: true, avaliacoes: { $exists: true, $ne: [] } } },
    {
      $facet: {
        porProduto: [
          { $unwind: "$avaliacoes" },
          {
            $group: {
              _id: { produtoId: "$_id", nome: "$nome" },
              mediaNota: { $avg: "$avaliacoes.nota" },
              totalAvaliacoes: { $sum: 1 },
            },
          },
          { $sort: { mediaNota: -1, totalAvaliacoes: -1 } },
        ],
        resumoGeral: [
          { $unwind: "$avaliacoes" },
          {
            $group: {
              _id: null,
              totalAvaliacoes: { $sum: 1 },
              notaMediaGeral: { $avg: "$avaliacoes.nota" },
            },
          },
          { $project: { _id: 0 } },
        ],
      },
    },
  ]);

  console.log("Média de avaliações por produto (via $facet):");
  relatorioAvaliacoes[0].porProduto.forEach((item) =>
    console.log(
      ` - ${item._id.nome}: média ${item.mediaNota.toFixed(2)} (${item.totalAvaliacoes} avaliações)`,
    ),
  );

  if (relatorioAvaliacoes[0].resumoGeral.length > 0) {
    const resumo = relatorioAvaliacoes[0].resumoGeral[0];
    console.log(
      `Resumo geral: ${resumo.totalAvaliacoes} avaliações | nota média ${resumo.notaMediaGeral.toFixed(2)}`,
    );
  }

  console.log();

  const relatorioPedidosStatus = await Pedido.aggregate([
    {
      $project: {
        status: 1,
        totalPedido: { $sum: "$itens.valorTotal" },
      },
    },
    {
      $group: {
        _id: "$status",
        quantidadePedidos: { $sum: 1 },
        valorTotalVendas: { $sum: "$totalPedido" },
      },
    },
    { $sort: { valorTotalVendas: -1 } },
  ]);

  console.log("Pedidos por status:");
  relatorioPedidosStatus.forEach((item) =>
    console.log(
      ` - ${item._id}: ${item.quantidadePedidos} pedido(s) | total R$${item.valorTotalVendas.toFixed(2)}`,
    ),
  );
  console.log();

  const topProdutosVendidos = await Pedido.aggregate([
    { $unwind: "$itens" },
    {
      $group: {
        _id: "$itens.produtoId",
        quantidadeVendida: { $sum: "$itens.quantidade" },
        receita: { $sum: "$itens.valorTotal" },
      },
    },
    {
      $lookup: {
        from: "produtos",
        localField: "_id",
        foreignField: "_id",
        as: "produto",
      },
    },
    { $unwind: "$produto" },
    {
      $project: {
        _id: 0,
        produto: "$produto.nome",
        categoria: "$produto.categoria",
        quantidadeVendida: 1,
        receita: 1,
      },
    },
    { $sort: { quantidadeVendida: -1 } },
  ]);

  console.log("Top produtos vendidos:");
  topProdutosVendidos.forEach((item) =>
    console.log(
      ` - ${item.produto} (${item.categoria}): ${item.quantidadeVendida} unidades | receita R$${item.receita.toFixed(2)}`,
    ),
  );
  console.log();

  console.log(" Main executado com sucesso!");
  await mongoose.disconnect();
};

main().catch((err) => {
  console.error(" Erro du'rante a execução:", err.message);
  mongoose.disconnect();
});
