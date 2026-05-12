const mongoose = require("mongoose");
const Produto = require("./models/Produto");

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

  console.log(" Main executado com sucesso!");
  await mongoose.disconnect();
};

main().catch((err) => {
  console.error(" Erro du'rante a execução:", err.message);
  mongoose.disconnect();
});
