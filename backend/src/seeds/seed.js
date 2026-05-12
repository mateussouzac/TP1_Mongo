const mongoose = require("mongoose");
require("dotenv").config();
const Usuario = require("../models/usuario");
const Produto = require("../models/produto");
const Pedido = require("../models/pedido");

const conectarEPopular = async () => {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/puccommerce");
  console.log("Conectou no DB");

  // Limpa tudo
  await Usuario.deleteMany({});
  await Produto.deleteMany({});
  await Pedido.deleteMany({});
  console.log("Coleções limpas");

  // -- USUÁRIOS -------------------------------------------------------------------
  const usuarios = await Usuario.insertMany([
    {
      nome: "João Silva",
      email: "joao@email.com",
      senha: "12345678",
      endereco: [
        {
          rua: "Rua das Flores",
          numero: "100",
          bairro: "Centro",
          cidade: "Belo Horizonte",
          estado: "MG",
          cep: "30100-000",
          principal: true,
        },
      ],
    },
    {
      nome: "Maria Souza",
      email: "maria@email.com",
      senha: "87654321",
      endereco: [
        {
          rua: "Av. Afonso Pena",
          numero: "500",
          bairro: "Savassi",
          cidade: "Belo Horizonte",
          estado: "MG",
          cep: "30130-001",
          principal: true,
        },
        {
          rua: "Rua Paraíba",
          numero: "200",
          bairro: "Funcionários",
          cidade: "Belo Horizonte",
          estado: "MG",
          cep: "30130-141",
          principal: false,
        },
      ],
    },
    {
      nome: "Pedro Costa",
      email: "pedro@email.com",
      senha: "11111111",
      endereco: [],
    },
  ]);
  console.log(`${usuarios.length} usuários inseridos.`);

  // -- PRODUTOS ---------------------------------------------------------------------------------
  const produtos = await Produto.insertMany([
    {
      nome: "Camiseta Básica",
      categoria: "Roupas",
      preco: 49.9,
      visualizacoes: 120,
      variacoes: [
        { cor: "Branco", tamanho: "P", estoque: 10 },
        { cor: "Branco", tamanho: "M", estoque: 15 },
        { cor: "Preto", tamanho: "M", estoque: 8 },
        { cor: "Preto", tamanho: "G", estoque: 5 },
      ],
      avaliacoes: [
        {
          usuarioId: usuarios[0]._id,
          nomeUsuario: "João Silva",
          nota: 5,
          comentario: "Camiseta ótima, tecido macio e entrega rápida",
          curtidas: 3,
        },
        {
          usuarioId: usuarios[1]._id,
          nomeUsuario: "Maria Souza",
          nota: 4,
          comentario: "Boa qualidade, mas o tamanho veio um meio grande.",
          curtidas: 1,
        },
      ],
    },
    {
      nome: "Tênis Esportivo",
      categoria: "Calçados",
      preco: 299.9,
      visualizacoes: 85,
      variacoes: [
        { cor: "Azul", tamanho: "40", estoque: 4 },
        { cor: "Azul", tamanho: "41", estoque: 6 },
        { cor: "Vermelho", tamanho: "42", estoque: 3 },
      ],
      avaliacoes: [
        {
          usuarioId: usuarios[1]._id,
          nomeUsuario: "Maria Souza",
          nota: 3,
          comentario:
            "Tênis ok, mas a sola parece não parece que vai durar muito tempo.",
          curtidas: 0,
        },
      ],
    },
    {
      nome: "Mochila Executiva",
      categoria: "Acessórios",
      preco: 189.9,
      visualizacoes: 200,
      variacoes: [
        { cor: "Preto", tamanho: "Único", estoque: 20 },
        { cor: "Cinza", tamanho: "Único", estoque: 12 },
      ],
      avaliacoes: [
        {
          usuarioId: usuarios[0]._id,
          nomeUsuario: "João Silva",
          nota: 5,
          comentario: "Mochila de boa qualidade, coube tudo que precisava.",
          curtidas: 7,
        },
      ],
    },
    {
      nome: "Fone de Ouvido Bluetooth",
      categoria: "Eletrônicos",
      preco: 399.9,
      visualizacoes: 310,
      variacoes: [{ cor: "Preto", tamanho: "Único", estoque: 7 }],
      avaliacoes: [],
    },
    {
      nome: "Relógio Smart",
      categoria: "Eletrônicos",
      preco: 549.9,
      visualizacoes: 220,
      variacoes: [
        { cor: "Preto", tamanho: "Único", estoque: 12 },
        { cor: "Branco", tamanho: "Único", estoque: 8 },
      ],
      avaliacoes: [
        {
          usuarioId: usuarios[2]._id,
          nomeUsuario: "Pedro Costa",
          nota: 4,
          comentario: "Design bonito e funcionalidades legais, mas a bateria podia durar mais.",
          curtidas: 2,
        },
        {
          usuarioId: usuarios[0]._id,
          nomeUsuario: "João Silva",
          nota: 5,
          comentario: "Muito bom para o preço, entrega rápida.",
          curtidas: 4,
        },
      ],
    },
  ]);
  console.log(`${produtos.length} produtos inseridos.`);

  // -- PEDIDOS --------------------------------------------------------------------------
  const pedidos = await Pedido.insertMany([
    {
      usuarioId: usuarios[0]._id,
      status: "entregue",
      itens: [
        {
          produtoId: produtos[0]._id,
          quantidade: 2,
          precoUnitario: 49.9,
          valorTotal: 99.8,
        },
        {
          produtoId: produtos[2]._id,
          quantidade: 1,
          precoUnitario: 189.9,
          valorTotal: 189.9,
        },
      ],
    },
    {
      usuarioId: usuarios[1]._id,
      status: "enviado",
      itens: [
        {
          produtoId: produtos[1]._id,
          quantidade: 1,
          precoUnitario: 299.9,
          valorTotal: 299.9,
        },
      ],
    },
    {
      usuarioId: usuarios[0]._id,
      status: "pendente",
      itens: [
        {
          produtoId: produtos[3]._id,
          quantidade: 1,
          precoUnitario: 399.9,
          valorTotal: 399.9,
        },
      ],
    },
    {
      usuarioId: usuarios[2]._id,
      status: "cancelado",
      itens: [
        {
          produtoId: produtos[4]._id,
          quantidade: 1,
          precoUnitario: 549.9,
          valorTotal: 549.9,
        },
      ],
    },
    {
      usuarioId: usuarios[1]._id,
      status: "entregue",
      itens: [
        {
          produtoId: produtos[4]._id,
          quantidade: 2,
          precoUnitario: 549.9,
          valorTotal: 1099.8,
        },
        {
          produtoId: produtos[0]._id,
          quantidade: 1,
          precoUnitario: 49.9,
          valorTotal: 49.9,
        },
      ],
    },
  ]);
  console.log(`${pedidos.length} pedidos inseridos.`);

  console.log("\n Banco populado");
  mongoose.disconnect();
};

conectarEPopular().catch((err) => {
  console.error("Erro ao popular o banco: ", err);
  mongoose.disconnect();
});
