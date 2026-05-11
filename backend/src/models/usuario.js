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
    sobrenome: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    telefone: { type: String },
    senha: { type: String, required: true },
    resetSenhaToken: { type: String },
    resetSenhaExpiraEm: { type: Date },
    endereco: [enderecoSchema],
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Usuario", usuarioSchema);
