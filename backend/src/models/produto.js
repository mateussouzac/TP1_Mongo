const mongoose = require("mongoose");

// Documento aninhado: variações são sempre lidas junto ao produto
const variacaoSchema = new mongoose.Schema({
  cor: { type: String },
  tamanho: { type: String },
  estoque: { type: Number, default: 0 },
});

// Documento aninhado: avaliações ficam dentro do produto
const avaliacaoSchema = new mongoose.Schema({
  // Referência lógica: usuário é entidade independente
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  nomeUsuario: { type: String, required: true },
  nota: { type: Number, required: true, min: 1, max: 5 },
  comentario: { type: String },
  curtidas: { type: Number, default: 0 },
  criadoEm: { type: Date, default: Date.now },
});

const produtoSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    categoria: { type: String, required: true },
    preco: { type: Number, required: true },
    visualizacoes: { type: Number, default: 0 },
    // Documentos aninhados: variacoes e avaliacoes
    variacoes: [variacaoSchema],
    avaliacoes: [avaliacaoSchema],
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Produto", produtoSchema);
