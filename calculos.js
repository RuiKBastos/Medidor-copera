const cfg = require('./config');

// Arredonda para 2 casas só na resposta final da API
function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

// kWh/mês de um aparelho
function consumoMensalKwh(aparelho) {
  return (aparelho.potenciaW * aparelho.horasDia * aparelho.diasMes) / 1000;
}

// R$ de energia (só tarifa, sem bandeira)
function custoEnergia(kwh) {
  return kwh * cfg.TARIFA_KWH;
}

// R$ do adicional da bandeira (valor é por 100 kWh)
function adicionalBandeira(kwh) {
  return (kwh / 100) * cfg.VALORES_BANDEIRA[cfg.BANDEIRA];
}

// Quantidade de painéis (sempre arredonda para cima)
function paineisNecessarios(kwh) {
  const geracaoPorPainel =
    (cfg.POTENCIA_PAINEL_W / 1000) * cfg.HSP * 30 * cfg.EFICIENCIA;
  return Math.ceil(kwh / geracaoPorPainel);
}

function simular(aparelhos) {
  // consumo e custo de cada aparelho, com precisão total
  const itens = aparelhos.map((a) => {
    const kwh = consumoMensalKwh(a);
    return { nome: a.nome, kwh, custo: custoEnergia(kwh) };
  });

  const consumoTotal = itens.reduce((soma, i) => soma + i.kwh, 0);
  const custo = custoEnergia(consumoTotal);
  const bandeira = adicionalBandeira(consumoTotal);
  const maisCaro = itens.reduce((m, i) => (i.custo > m.custo ? i : m));

  return {
    consumoKwhMes: arredondar(consumoTotal),
    custoEnergia: arredondar(custo),
    adicionalBandeira: arredondar(bandeira),
    totalMes: arredondar(custo + bandeira),
    paineisNecessarios: paineisNecessarios(consumoTotal),
    aparelhoMaisCaro: { nome: maisCaro.nome, custo: arredondar(maisCaro.custo) },
    detalhes: itens.map((i) => ({
      nome: i.nome,
      kwhMes: arredondar(i.kwh),
      custo: arredondar(i.custo),
      percentual: consumoTotal > 0 ? arredondar((i.kwh / consumoTotal) * 100) : 0,
    })),
  };
}

module.exports = {
  consumoMensalKwh,
  custoEnergia,
  adicionalBandeira,
  paineisNecessarios,
  simular,
};