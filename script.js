const valorEl = document.getElementById('valor');
const modeloEl = document.getElementById('modelo');
const parcelasEl = document.getElementById('parcelas');
const divParcelas = document.getElementById('divParcelas');
const fechamentoEl = document.getElementById('fechamento');
const resumoTexto = document.getElementById('resumoTexto');
const calendarioEl = document.getElementById('calendario');

function formatarMoedaCampo(input) {
  input.addEventListener('input', () => {
    let valor = input.value.replace(/\D/g, '');
    valor = (parseInt(valor || '0', 10) / 100).toFixed(2) + '';
    valor = valor.replace('.', ',');
    valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    input.value = valor;
  });
}
function parseValor(v) {
  return parseFloat(v.replace(/\./g, '').replace(',', '.'));
}

function atualizarParcelas() {
  parcelasEl.innerHTML = '';
  if (modeloEl.value === 'antecipado') {
    divParcelas.style.display = 'none';
  } else {
    divParcelas.style.display = 'block';
    for (let i = 1; i <= 18; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.innerText = `${i}x`;
      parcelasEl.appendChild(opt);
    }
  }
}

function simular() {
  const valor = parseValor(valorEl.value);
  const modelo = modeloEl.value;
  const parcelas = modelo === 'antecipado' ? 4 : parseInt(parcelasEl.value);
  const fechamento = fechamentoEl.value;

  calendarioEl.innerHTML = '';

  if (!valor || !fechamento || !parcelas) {
    resumoTexto.textContent = "Preencha todos os campos corretamente.";
    return;
  }

  const [ano, mes] = fechamento.split('-').map(Number);
  const ultimoDiaMes = new Date(ano, mes, 0);

  let primeiraParcela = new Date(ultimoDiaMes);
  primeiraParcela.setDate(primeiraParcela.getDate() + 40);
  primeiraParcela.setDate(10);

  const taxa = modelo === 'antecipado' ? 0.10 : 0.05;
  const valorLiquido = valor * (1 - taxa);
  const valorParcela = valorLiquido / parcelas;

  let recebimentos = [];
  for (let i = 0; i < parcelas; i++) {
    let dataParcela = new Date(primeiraParcela);
    dataParcela.setMonth(dataParcela.getMonth() + i);
    recebimentos.push({ data: dataParcela, valor: valorParcela, parcela: i + 1 });
  }

  resumoTexto.textContent = `Simulação: ${parcelas} parcelas • Modelo: ${modeloEl.options[modeloEl.selectedIndex].text}`;
  mostrarCalendario(recebimentos);
}

function mostrarCalendario(recebimentos) {
  let mapa = new Map();

  recebimentos.forEach(r => {
    const key = `${r.data.getFullYear()}-${r.data.getMonth()}`;
    if (!mapa.has(key)) mapa.set(key, []);
    mapa.get(key).push(r);
  });

  mapa.forEach((lista, chave) => {
    const [ano, mes] = chave.split('-').map(Number);
    const dataRef = new Date(ano, mes);

    const divMes = document.createElement('div');
    divMes.className = 'mes';
    divMes.innerHTML = `<h3>${dataRef.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h3>`;

    const diasSemana = document.createElement('div');
    diasSemana.className = 'dias-semana';
    ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(d => {
      diasSemana.innerHTML += `<div>${d}</div>`;
    });

    const dias = document.createElement('div');
    dias.className = 'dias';

    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const offset = primeiroDia.getDay();

    for (let i = 0; i < offset; i++) dias.innerHTML += '<div></div>';

    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      const atual = new Date(ano, mes, d);
      const div = document.createElement('div');
      div.className = 'dia';
      div.innerHTML = `<strong>${d}</strong>`;

      lista.forEach(r => {
        if (r.data.toDateString() === atual.toDateString()) {
          div.innerHTML += `<span class="recebimento">Parc. ${r.parcela}: R$ ${r.valor.toFixed(2).replace('.', ',')}</span>`;
        }
      });

      dias.appendChild(div);
    }

    divMes.appendChild(diasSemana);
    divMes.appendChild(dias);
    calendarioEl.appendChild(divMes);
  });
}

document.getElementById('btnSimular').addEventListener('click', simular);
document.getElementById('btnReset').addEventListener('click', () => {
  valorEl.value = '';
  fechamentoEl.value = '';
  resumoTexto.textContent = "Preencha os dados e clique em Simular.";
  calendarioEl.innerHTML = '';
});

modeloEl.addEventListener('change', atualizarParcelas);
formatarMoedaCampo(valorEl);
atualizarParcelas();
