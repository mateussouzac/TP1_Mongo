const mongoose = require("mongoose");

// Documento aninhado: itens "estáticos" no momento da compra
// (preço e nome do produto são salvos aqui pois podem mudar depois)
const itemPedidoSchema = new mongoose.Schema({
  // Referência lógica: produto é entidade independente
  produtoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Produto",
    required: true,
  },
  quantidade: { type: Number, required: true },
  precoUnitario: { type: Number, required: true },
  valorTotal: { type: Number, required: true },
});

const pedidoSchema = new mongoose.Schema(
  {
    dataPedido: { type: Date, default: Date.now },
    // Referência lógica: usuário é entidade independente
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    status: {
      type: String,
      enum: ["pendente", "pago", "enviado", "entregue", "cancelado"],
      default: "pendente",
    },
    // Documento aninhado: itens são sempre lidos junto ao pedido
    itens: [itemPedidoSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Pedido", pedidoSchema);
