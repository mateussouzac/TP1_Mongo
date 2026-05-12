const crypto = require("crypto");
const path = require("path");
const express = require("express");
const cors = require("cors");
const Usuario = require("./models/usuario");
const produtosRouter = require("./routes/produtos");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/frontend", express.static(path.join(__dirname, "../../frontend")));
app.use("/api/produtos", produtosRouter);

const hashSenha = (senha) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(senha, salt, 120000, 64, "sha512")
    .toString("hex");

  return `pbkdf2$${salt}$${hash}`;
};

const senhaConfere = (senha, senhaSalva) => {
  if (!senhaSalva) return false;

  const [metodo, salt, hashSalvo] = senhaSalva.split("$");
  if (metodo !== "pbkdf2" || !salt || !hashSalvo) {
    return senha === senhaSalva;
  }

  const hashDigitado = crypto
    .pbkdf2Sync(senha, salt, 120000, 64, "sha512")
    .toString("hex");

  if (hashSalvo.length !== hashDigitado.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(hashSalvo, "hex"),
    Buffer.from(hashDigitado, "hex"),
  );
};

const usuarioPublico = (usuario) => ({
  id: usuario._id,
  nome: usuario.nome,
  sobrenome: usuario.sobrenome || "",
  email: usuario.email,
  telefone: usuario.telefone || "",
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/", (req, res) => {
  res.redirect("/frontend/pages/login.html");
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { nome, sobrenome, email, telefone, senha } = req.body;

    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ message: "Nome, e-mail e senha são obrigatórios." });
    }

    if (senha.length < 8) {
      return res
        .status(400)
        .json({ message: "A senha precisa ter no mínimo 8 caracteres." });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const usuarioExistente = await Usuario.findOne({ email: emailNormalizado });

    if (usuarioExistente) {
      return res
        .status(409)
        .json({ message: "Este e-mail já está cadastrado." });
    }

    const usuario = await Usuario.create({
      nome: nome.trim(),
      sobrenome: sobrenome?.trim(),
      email: emailNormalizado,
      telefone: telefone?.trim(),
      senha: hashSenha(senha),
    });

    return res.status(201).json({ usuario: usuarioPublico(usuario) });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao cadastrar usuário." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: "Preencha e-mail e senha." });
    }

    const usuario = await Usuario.findOne({
      email: email.trim().toLowerCase(),
      ativo: true,
    });

    if (!usuario || !senhaConfere(senha, usuario.senha)) {
      return res.status(401).json({ message: "E-mail ou senha inválidos." });
    }

    if (!usuario.senha.startsWith("pbkdf2$")) {
      usuario.senha = hashSenha(senha);
      await usuario.save();
    }

    return res.json({ usuario: usuarioPublico(usuario) });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao fazer login." });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Informe o e-mail cadastrado." });
    }

    const usuario = await Usuario.findOne({
      email: email.trim().toLowerCase(),
      ativo: true,
    });

    if (!usuario) {
      return res
        .status(404)
        .json({ message: "Não encontramos uma conta com este e-mail." });
    }

    const token = crypto.randomBytes(3).toString("hex").toUpperCase();
    usuario.resetSenhaToken = token;
    usuario.resetSenhaExpiraEm = new Date(Date.now() + 15 * 60 * 1000);
    await usuario.save();

    return res.json({
      message: "Código de recuperação gerado.",
      resetToken: token,
      expiresInMinutes: 15,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro ao gerar recuperação de senha." });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email, token, novaSenha } = req.body;

    if (!email || !token || !novaSenha) {
      return res
        .status(400)
        .json({ message: "Informe e-mail, código e nova senha." });
    }

    if (novaSenha.length < 8) {
      return res
        .status(400)
        .json({ message: "A nova senha precisa ter no mínimo 8 caracteres." });
    }

    const usuario = await Usuario.findOne({
      email: email.trim().toLowerCase(),
      resetSenhaToken: token.trim().toUpperCase(),
      resetSenhaExpiraEm: { $gt: new Date() },
      ativo: true,
    });

    if (!usuario) {
      return res.status(400).json({ message: "Código inválido ou expirado." });
    }

    usuario.senha = hashSenha(novaSenha);
    usuario.resetSenhaToken = undefined;
    usuario.resetSenhaExpiraEm = undefined;
    await usuario.save();

    return res.json({ message: "Senha alterada com sucesso." });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao redefinir senha." });
  }
});

module.exports = app;
