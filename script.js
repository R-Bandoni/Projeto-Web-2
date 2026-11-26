const getData = async () => {
	const dataRaw = await fetch(
			//	`https://dadosabertos.camara.leg.br/api/v2/deputados?siglauf=SP`,
			`https://dadosabertos.camara.leg.br/api/v2/deputados`,
		),
		data = await dataRaw.json()
	console.log(
		data.dados
			//[0].siglaUF
			.filter( e =>
				
				e.siglaUf === 'SP'// &&
				// e.nome.includes("Kataguiri")
			).length,
	) //.filter()
}
