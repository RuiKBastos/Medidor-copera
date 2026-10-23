const aparelhos = [];

const form = document.querySelector('#form-aparelho');
const lista = document.querySelector('#lista-aparelhos');
const listaVazia = document.querySelector('#lista-vazia');
const saida = document.querySelector('#resultado');
const msgErro = document.querySelector('#erro');

function formatarReais(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function desenharLista() {
  lista.textContent = '';
  listaVazia.hidden = aparelhos.length > 0;

  aparelhos.forEach((aparelho, indice) => {
    const li = document.createElement('li');

    const texto = document.createElement('span');
    texto.textContent =
      `${aparelho.nome} — ${aparelho.potenciaW} W, ` +
      `${aparelho.horasDia} h/dia, ${aparelho.diasMes} dias/mês`;

    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'btn-remover';
    botao.textContent = 'Remover';
    botao.addEventListener('click', () => {
      aparelhos.splice(indice, 1);
      desenharLista();
    });

    li.append(texto, botao);
    lista.appendChild(li);
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  aparelhos.push({
    nome: document.querySelector('#nome').value.trim(),
    potenciaW: Number(document.querySelector('#potencia').value),
    horasDia: Number(document.querySelector('#horas').value),
    diasMes: Number(document.querySelector('#dias').value),
  });

  desenharLista();
  form.reset();
  document.querySelector('#nome').focus();
});

function criarMetrica(rotulo, valor) {
  const div = document.createElement('div');
  div.className = 'metrica';

  const span = document.createElement('span');
  span.textContent = rotulo;

  const strong = document.createElement('strong');
  strong.textContent = valor;

  div.append(span, strong);
  return div;
}

function desenharResultado(dados) {
  saida.textContent = '';

  const card = document.createElement('div');
  card.className = 'card';

  const titulo = document.createElement('h2');
  titulo.textContent = 'Resultado da simulação';
  card.appendChild(titulo);

  const resumo = document.createElement('div');
  resumo.className = 'resumo';
  resumo.append(
    criarMetrica('Consumo mensal', `${dados.consumoKwhMes.toLocaleString('pt-BR')} kWh`),
    criarMetrica('Total da conta', formatarReais(dados.totalMes)),
    criarMetrica('Painéis necessários', String(dados.paineisNecessarios)),
    criarMetrica('Energia', formatarReais(dados.custoEnergia)),
    criarMetrica('Bandeira', formatarReais(dados.adicionalBandeira))
  );
  card.appendChild(resumo);

  const caro = document.createElement('div');
  caro.className = 'destaque-caro';
  caro.textContent =
    `Aparelho que mais pesa no bolso: ${dados.aparelhoMaisCaro.nome} ` +
    `(${formatarReais(dados.aparelhoMaisCaro.custo)} por mês)`;
  card.appendChild(caro);

  const tabela = document.createElement('table');
  const cabecalho = document.createElement('tr');
  ['Aparelho', 'kWh/mês', 'Custo', '% do consumo'].forEach((nome) => {
    const th = document.createElement('th');
    th.textContent = nome;
    cabecalho.appendChild(th);
  });
  const thead = document.createElement('thead');
  thead.appendChild(cabecalho);
  tabela.appendChild(thead);

  const tbody = document.createElement('tbody');
  dados.detalhes.forEach((item) => {
    const tr = document.createElement('tr');
    [
      item.nome,
      item.kwhMes.toLocaleString('pt-BR'),
      formatarReais(item.custo),
      `${item.percentual.toLocaleString('pt-BR')}%`,
    ].forEach((valor) => {
      const td = document.createElement('td');
      td.textContent = valor;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  tabela.appendChild(tbody);
  card.appendChild(tabela);

  saida.appendChild(card);
}

document.querySelector('#btn-simular').addEventListener('click', async () => {
  msgErro.textContent = '';
  saida.textContent = '';

  try {
    const resposta = await fetch('/api/simular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aparelhos }),
    });

    const dados = await resposta.json();

    if (resposta.status === 400) {
      msgErro.textContent = dados.erro;
      return;
    }

    desenharResultado(dados);
  } catch (erro) {
    msgErro.textContent = 'Não foi possível falar com o servidor.';
  }
});

desenharLista();