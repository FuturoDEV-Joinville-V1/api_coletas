
const express = require('express');
const path = require('path');
const { readJSON, writeJSON } = require('../utils/fileUtils');
const router = express.Router();
const DB = path.join(__dirname, '..', 'data', 'db.json');

router.post('/', async (req, res) => {
  const db = await readJSON(DB);
  const { email, senha } = req.body;

  if (!email) return res.status(400).json({ erro: 'Email é obrigatório' });
  if (!senha) return res.status(400).json({ erro: 'Senha é obrigatória' });

  const usuario = db.usuarios.find(u => u.email === email && u.senha === senha);
  if (!usuario) return res.status(401).json({ erro: 'Credenciais inválidas' });

  res.json({ mensagem: 'Login realizado com sucesso', usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
});


module.exports = router;
