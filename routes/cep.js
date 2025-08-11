
const express = require('express');
const axios = require('axios');
const path = require('path');
const { readJSON } = require('../utils/fileUtils');
const router = express.Router();

// baseCities: a few real city coordinates per UF (used to construct a 15-item list by repeating)
const baseCities = {
  "SP":[[-23.55052,-46.633308],[-23.567,-46.648],[-23.547,-46.636],[-23.561,-46.655]],
  "RJ":[[-22.906847,-43.172896],[-22.970722,-43.182365],[-22.923611,-43.230278]],
  "MG":[[-19.920833,-43.937778],[-19.931111,-43.938889],[-19.899,-43.967]],
  "BA":[[-12.977749,-38.501629],[-12.971,-38.505],[-13.0,-38.5]],
  "AM":[[-3.119028,-60.021731],[-3.101944,-60.025],[-3.0,-60.0]],
  "PR":[[-25.4284,-49.2733],[-25.427,-49.273],[-25.4,-49.28]],
  "RS":[[-30.0346,-51.2177],[-30.03,-51.2],[-29.9,-51.1]],
  "CE":[[-3.71722,-38.54306],[-3.73,-38.54],[-3.8,-38.5]],
  "PE":[[-8.0476,-34.877],[-8.06,-34.88],[-8.0,-34.9]],
  "PA":[[-1.455,-48.502],[-1.46,-48.48],[-1.4,-48.5]],
  "GO":[[-16.6869,-49.2648],[-16.7,-49.28],[-16.65,-49.25]],
  "MA":[[-2.5307,-44.2966],[-2.52,-44.3],[-2.5,-44.28]],
  "MT":[[-12.642,-55.416],[-12.63,-55.4],[-15.6,-56.1]],
  "MS":[[-20.468,-54.646],[-20.45,-54.6],[-20.4,-54.6]],
  "PB":[[-7.1195,-34.8450],[-7.12,-34.84],[-7.1,-34.85]],
  "RS":[[-30.0346,-51.2177],[-29.7,-50.9],[-31.7,-52.3]],
  "RN":[[-5.7945,-35.2110],[-5.8,-35.2],[-5.9,-35.2]],
  "PI":[[-5.0892,-42.8016],[-5.1,-42.8],[-5.0,-42.7]],
  "AL":[[-9.66599,-35.735],[-9.66,-35.7],[-9.67,-35.73]],
  "SE":[[-10.9111,-37.0717],[-10.9,-37.07],[-10.95,-37.08]],
  "RO":[[-8.762,-63.903],[-8.77,-63.9],[-9.0,-63.8]],
  "AC":[[-9.9780,-67.8243],[-9.97,-67.8],[-10.0,-67.8]],
  "RR":[[2.8196,-60.6738],[2.8,-60.66],[2.7,-60.7]],
  "AP":[[0.0340,-51.0705],[0.03,-51.07],[0.05,-51.06]],
  "TO":[[-10.1848,-48.3336],[-10.18,-48.33],[-10.2,-48.34]],
  "RO":[[-8.762,-63.903],[-9.0,-63.9],[-8.7,-63.9]],
  "DF":[[-15.793889,-47.882778],[-15.8,-47.9],[-15.75,-47.85]]
};

function buildListForUF(uf) {
  const base = baseCities[uf] || [[0,0]];
  const out = [];
  let i=0;
  while(out.length < 15) {
    const item = base[i % base.length];
    // small random jitter to diversify points slightly but keep within city area
    const jitterLat = (Math.random()-0.5)*0.02;
    const jitterLng = (Math.random()-0.5)*0.02;
    out.push([parseFloat((item[0]+jitterLat).toFixed(6)), parseFloat((item[1]+jitterLng).toFixed(6))]);
    i++;
  }
  return out;
}

// build full mapping at startup
const coordenadasPorUF = {};
Object.keys(baseCities).forEach(uf => {
  coordenadasPorUF[uf] = buildListForUF(uf);
});

router.get('/cep/:cep', async (req, res) => {
  const cep = req.params.cep.replace(/\D/g, '');
  try {
    const resp = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    const data = resp.data;
    if(data.erro) return res.status(404).json({ erro: 'CEP não encontrado' });
    const uf = data.uf;
    const list = coordenadasPorUF[uf];
    let coord = null;
    if(list && list.length>0) {
      const idx = Math.floor(Math.random()*list.length);
      coord = { latitude: list[idx][0], longitude: list[idx][1] };
    }
    // return viaCEP data plus coord
    res.json({ ...data, coordenada: coord });
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ erro: 'Erro ao consultar CEP' });
  }
});

module.exports = router;
