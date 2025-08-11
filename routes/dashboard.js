
const express = require('express');
const path = require('path');
const { readJSON } = require('../utils/fileUtils');
const router = express.Router();
const estados = [
  { "uf": "AC", "nome": "Acre" },
  { "uf": "AL", "nome": "Alagoas" },
  { "uf": "AP", "nome": "Amapá" },
  { "uf": "AM", "nome": "Amazonas" },
  { "uf": "BA", "nome": "Bahia" },
  { "uf": "CE", "nome": "Ceará" },
  { "uf": "DF", "nome": "Distrito Federal" },
  { "uf": "ES", "nome": "Espírito Santo" },
  { "uf": "GO", "nome": "Goiás" },
  { "uf": "MA", "nome": "Maranhão" },
  { "uf": "MT", "nome": "Mato Grosso" },
  { "uf": "MS", "nome": "Mato Grosso do Sul" },
  { "uf": "MG", "nome": "Minas Gerais" },
  { "uf": "PA", "nome": "Pará" },
  { "uf": "PB", "nome": "Paraíba" },
  { "uf": "PR", "nome": "Paraná" },
  { "uf": "PE", "nome": "Pernambuco" },
  { "uf": "PI", "nome": "Piauí" },
  { "uf": "RJ", "nome": "Rio de Janeiro" },
  { "uf": "RN", "nome": "Rio Grande do Norte" },
  { "uf": "RS", "nome": "Rio Grande do Sul" },
  { "uf": "RO", "nome": "Rondônia" },
  { "uf": "RR", "nome": "Roraima" },
  { "uf": "SC", "nome": "Santa Catarina" },
  { "uf": "SP", "nome": "São Paulo" },
  { "uf": "SE", "nome": "Sergipe" },
  { "uf": "TO", "nome": "Tocantins" }
];

const DB = path.join(__dirname, '..', 'data', 'db.json');

router.get('/dashboard', async (req, res) => {
  const db = await readJSON(DB);
  const locais = db.coletas || [];
  const countPorEstado = {};

  // Contagem por estado
  locais.forEach(local => {
    const uf = (local.endereco && local.endereco.uf) ? local.endereco.uf.toUpperCase() : null;
    if (!uf) return;
    countPorEstado[uf] = (countPorEstado[uf] || 0) + 1;
  });

  const estadosResult = Object.keys(countPorEstado).map(uf => {
    const estado = estados.find(e => e.uf === uf);
    return {
      nome: estado ? estado.nome : uf,
      quantidade: countPorEstado[uf]
    };
  });

  // Lista de locais
  const locaisResult = locais
    .filter(local => local.nome && local.endereco && local.endereco.uf && local.coordenadas)
    .map(local => ({
      nome: local.nome || '',
      estado: local.endereco.uf || '',
      descricao: local.descricao || '',
      latitude: local.coordenadas.latitude || '',
      longitude: local.coordenadas.longitude || '',
      tipoMaterial: Array.isArray(local.residuos) ? local.residuos.join(', ') : ''
    }));

  res.json({
    estados: estadosResult,
    locais: locaisResult
  });
});

module.exports = router;
