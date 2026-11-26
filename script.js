const API = 'https://dadosabertos.camara.leg.br/api/v2/deputados'
const UFS = [
	'AC',
	'AL',
	'AP',
	'AM',
	'BA',
	'CE',
	'DF',
	'ES',
	'GO',
	'MA',
	'MT',
	'MS',
	'MG',
	'PA',
	'PB',
	'PR',
	'PE',
	'PI',
	'RJ',
	'RN',
	'RS',
	'RO',
	'RR',
	'SC',
	'SP',
	'SE',
	'TO',
]

const selectUf = document.getElementById('uf')
const busca = document.getElementById('busca')
const status = document.getElementById('status')
const lista = document.getElementById('lista')
const graficoArea = document.getElementById('grafico-area')
const resumo = document.getElementById('resumo-grafico')

let deputados = [] // dados da UF atual
let grafico = null // instância do Chart.js

// Preenche o <select> com os estados
UFS.forEach(uf => selectUf.add(new Option(uf, uf)))

// Busca na API (Fetch API + async/await + tratamento de erro)
async function carregar(uf) {
	status.textContent = 'Carregando...'
	lista.innerHTML = ''
	graficoArea.hidden = true
	try {
		const params = new URLSearchParams({
			siglaUf: uf,
			itens: 100,
			ordem: 'ASC',
			ordenarPor: 'nome',
		})
		const resp = await fetch(`${API}?${params}`)
		if (!resp.ok) throw new Error(`Erro ${resp.status}`)
		const json = await resp.json()
		deputados = json.dados
		status.textContent = `${deputados.length} deputados encontrados em ${uf}.`
		mostrarLista()
		mostrarGrafico()
	} catch (erro) {
		status.textContent =
			'Não foi possível carregar os dados. Verifique sua conexão e tente novamente.'
		console.error(erro)
	}
}

// Desenha os cartões (aplica o filtro de busca por nome)
function mostrarLista() {
	const termo = busca.value.trim().toLowerCase()
	const filtrados = deputados.filter(d => d.nome.toLowerCase().includes(termo))
	lista.innerHTML = ''
	filtrados.forEach(d => {
		const li = document.createElement('li')
		li.className = 'card'
		li.innerHTML = `
      <img src="${d.urlFoto}" alt="Foto de ${d.nome}" loading="lazy">
      <h3>${d.nome}</h3>
      <p>${d.siglaPartido} · ${d.siglaUf}</p>`
		lista.appendChild(li)
	})
	if (termo)
		status.textContent = `${filtrados.length} deputado(s) para "${busca.value}".`
}

// Conta deputados por partido e desenha com Chart.js
function mostrarGrafico() {
	const contagem = deputados.reduce((acc, d) => {
		acc[d.siglaPartido] = (acc[d.siglaPartido] || 0) + 1
		return acc
	}, {})
	const ordenado = Object.entries(contagem).sort((a, b) => b[1] - a[1])
	graficoArea.hidden = false
	if (grafico) grafico.destroy()
	grafico = new Chart(document.getElementById('grafico'), {
		type: 'bar',
		data: {
			labels: ordenado.map(e => e[0]),
			datasets: [
				{
					label: 'Deputados',
					data: ordenado.map(e => e[1]),
					backgroundColor: '#0b3d91',
				},
			],
		},
		options: { plugins: { legend: { display: false } } },
	})
	// Alternativa em texto para leitores de tela
	resumo.textContent =
		'Resumo: ' + ordenado.map(e => `${e[0]} ${e[1]}`).join(', ') + '.'
}

selectUf.onchange = () => selectUf.value && carregar(selectUf.value),
busca.oninput = mostrarLista
$('#filtro').on('submit', e => e.preventDefault())
