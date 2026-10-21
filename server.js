const express = require('express');
const { simular } = require('./calculos');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/api/simular', (req, res) => {
  // TODO 1: ler req.body.aparelhos
  // TODO 2: validar; se inválido: return res.status(400).json({ erro: '...' })
  // TODO 3: res.json(simular(aparelhos))
});

app.listen(3000, () => console.log('Medidor Coopera em http://localhost:3000'));