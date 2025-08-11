
const express = require('express');
const path = require('path');
const { readJSON, writeJSON } = require('../utils/fileUtils');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const DB = path.join(__dirname, '..', 'data', 'db.json');

// listar todos
router.get('/', async (req, res) => {
  const usuarioId = req.headers['usuarioid'];

  if (usuarioId === undefined || usuarioId === null || usuarioId === '') {
    return res.status(400).json({ erro: 'ID do usuário não informado no header' });
  }

  const db = await readJSON(DB);
  const encontrados = db.coletas.filter(c => c.usuarioId === usuarioId);
  return res.json(encontrados);
});

// listar por estado
router.get('/estado/:uf', async (req, res) => {
  const uf = req.params.uf.toUpperCase();
  const db = await readJSON(DB);
  const encontrados = db.coletas.filter(c => c.endereco && c.endereco.uf === uf);
  res.json(encontrados);
});

// listar por cpf via header
router.get('/usuario', async (req, res) => {
  const cpf = req.headers['cpf'];
  if(!cpf) return res.status(400).json({ erro: 'CPF não informado no header' });
  const db = await readJSON(DB);
  const usuario = db.usuarios.find(u => u.cpf === cpf);
  if(!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
  const encontrados = db.coletas.filter(c => c.usuarioId === usuario.id);
  res.json(encontrados);
});

// criar
router.post('/', async (req, res) => {
  const db = await readJSON(DB);

  const usuarioId = req.headers['usuarioid'];
  if (!usuarioId) {
    return res.status(400).json({ erro: 'ID do usuário não informado no header' });
  }
  const usuario = db.usuarios.find(u => u.id === usuarioId);
  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }
  req.body.usuarioId = usuarioId;

  const { nome, descricao, endereco, coordenadas, residuos } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'Campo obrigatório "nome" ausente.' });
  }
  if (!descricao) {
    return res.status(400).json({ erro: 'Campo obrigatório "descricao" ausente.' });
  }
  if (!endereco) {
    return res.status(400).json({ erro: 'Campo obrigatório "endereco" ausente.' });
  }
  if (!endereco.cep) {
    return res.status(400).json({ erro: 'Campo obrigatório "endereco.cep" ausente.' });
  }
  if (!endereco.logradouro) {
    return res.status(400).json({ erro: 'Campo obrigatório "endereco.logradouro" ausente.' });
  }
  if (!endereco.bairro) {
    return res.status(400).json({ erro: 'Campo obrigatório "endereco.bairro" ausente.' });
  }
  if (!endereco.localidade) {
    return res.status(400).json({ erro: 'Campo obrigatório "endereco.localidade" ausente.' });
  }
  if (!endereco.uf) {
    return res.status(400).json({ erro: 'Campo obrigatório "endereco.uf" ausente.' });
  }
  if (!coordenadas) {
    return res.status(400).json({ erro: 'Campo obrigatório "coordenadas" ausente.' });
  }
  if (typeof coordenadas.latitude !== 'number') {
    return res.status(400).json({ erro: 'Campo obrigatório "coordenadas.latitude" deve ser um número.' });
  }
  if (typeof coordenadas.longitude !== 'number') {
    return res.status(400).json({ erro: 'Campo obrigatório "coordenadas.longitude" deve ser um número.' });
  }
  if (!Array.isArray(residuos)) {
    return res.status(400).json({ erro: 'Campo obrigatório "residuos" deve ser um array.' });
  }
  if (residuos.length < 1) {
    return res.status(400).json({ erro: '"residuos" deve ter pelo menos 1 item.' });
  }


  const novo = { id: uuidv4(), ...req.body };
  db.coletas.push(novo);
  await writeJSON(DB, db);
  res.status(201).json(novo);
});

// atualizar
router.put('/:id', async (req, res) => {
  const db = await readJSON(DB);
  const idx = db.coletas.findIndex(c => c.id === req.params.id);
  if(idx === -1) return res.status(404).json({ erro: 'Ponto não encontrado' });
  db.coletas[idx] = { ...db.coletas[idx], ...req.body, id: db.coletas[idx].id };
  await writeJSON(DB, db);
  res.json(db.coletas[idx]);
});

// deletar
router.delete('/:id', async (req, res) => {
  const usuarioId = req.headers['usuarioid'];
  if (!usuarioId) {
    return res.status(400).json({ erro: 'ID do usuário não informado no header' });
  }
  const db = await readJSON(DB);
  const idx = db.coletas.findIndex(c => c.id === req.params.id && c.usuarioId === usuarioId);
  if (idx === -1) return res.status(404).json({ erro: 'Ponto não encontrado ou usuário não autorizado' });
  db.coletas.splice(idx, 1);
  await writeJSON(DB, db);
  res.json({ mensagem: 'Deletado' });
});

module.exports = router;
