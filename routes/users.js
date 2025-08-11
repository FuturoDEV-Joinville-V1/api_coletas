
const express = require('express');
const path = require('path');
const { readJSON, writeJSON } = require('../utils/fileUtils');
const router = express.Router();
const DB = path.join(__dirname, '..', 'data', 'db.json');

router.get('/', async (req, res) => {
  const db = await readJSON(DB);
  res.json(db.usuarios);
});


router.post('/', async (req, res) => {
  const db = await readJSON(DB);
  const { nome, sexo, cpf, nascimento, email, senha } = req.body;

  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' });
  if (!sexo) return res.status(400).json({ erro: 'Sexo é obrigatório' });
  if (!cpf) return res.status(400).json({ erro: 'CPF é obrigatório' });
  if (!nascimento) return res.status(400).json({ erro: 'Nascimento é obrigatório' });
  if (!email) return res.status(400).json({ erro: 'Email é obrigatório' });
  if (!senha) return res.status(400).json({ erro: 'Senha é obrigatória' });

  if(db.usuarios.some(u => u.cpf === cpf)) return res.status(400).json({ erro: 'CPF já cadastrado' });
  const novo = { id: 'u' + Date.now(), nome, sexo, cpf, nascimento, email, senha };
  db.usuarios.push(novo);
  await writeJSON(DB, db);
  res.status(201).json(novo);
});

module.exports = router;
