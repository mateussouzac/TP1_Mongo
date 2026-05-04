const mongoose = require("mongoose");

const enderecoSchema = new mongoose.Schema({
  rua: { type: String, required: true },
  numero: { type: String, required: true },
  complemento: { type: String },
  bairro: { type: String, required: true },
  cidade: { type: String, required: true },
  estado: { type: String, required: true },
  cep: { type: String, required: true },
  principal: { type: Boolean, default: false },
});

const usuarioSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    endereco: [enderecoSchema],
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Usuario", usuarioSchema);
