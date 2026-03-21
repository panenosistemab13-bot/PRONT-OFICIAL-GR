export const getCitiesForDestination = (dest: string, orig: string = "Santa Luzia/MG"): string[] => {
  const d = dest.toUpperCase();
  
  if (d.includes("ARIQUEMES")) {
    return ["Santa Luzia/MG", "Brasília/DF", "Cuiabá/MT", "Ariquemes/RO"];
  }
  if (d.includes("BEBEDOURO")) {
    return ["Santa Luzia/MG", "Divinópolis/MG", "Capitólio/MG", "Passos/MG", "São Sebastião do Paraíso/MG", "Batatais/SP", "Ribeirão Preto/SP", "Bebedouro/SP"];
  }
  if (d.includes("BRASILIA") || d.includes("BRASÍLIA")) {
    return ["Santa Luzia/MG", "Sete Lagoas/MG", "Felixlândia/MG", "Três Marias/MG", "João Pinheiro/MG", "Paracatu/MG", "Cristalina/GO", "Brasília/DF"];
  }
  if (d.includes("CAMBE") || d.includes("CAMBÉ")) {
    return ["Santa Luzia/MG", "Divinópolis/MG", "Passos/MG", "Ribeirão Preto/SP", "Marília/SP", "Londrina/PR", "Cambé/PR"];
  }
  if (d.includes("CAMPO GRANDE")) {
    return ["Santa Luzia/MG", "Araxá/MG", "Uberlândia/MG", "Campo Grande/MS"];
  }
  if (d.includes("CASTRO")) {
    return ["Santa Luzia/MG", "Carmópolis de Minas/MG", "Pouso Alegre/MG", "Juquitiba/SP", "Sorocaba/SP", "Itapetininga/SP", "Itapeva/SP", "Jaguariaíva/PR", "Piraí do Sul/PR", "Castro/PR"];
  }
  if (d.includes("CUIABA") || d.includes("CUIABÁ")) {
    return ["Santa Luzia/MG", "Nova Serrana/MG", "Araxá/MG", "Uberlândia/MG", "Itumbiara/GO", "Rio Verde/GO", "Alto Araguaia/MT", "Rondonópolis/MT", "Cuiabá/MT"];
  }
  if (d.includes("CURITIBA")) {
    return ["Santa Luzia/MG", "Carmópolis de Minas/MG", "Pouso Alegre/MG", "Juquitiba/SP", "Curitiba/PR"];
  }
  if (d.includes("EUSEBIO") || d.includes("EUSÉBIO")) {
    if (d.includes("NATAL")) {
      return ["Santa Luzia/MG", "Curvelo/MG", "Montes Claros/MG", "Vitória da Conquista/BA", "Feira de Santana/BA", "Paulo Afonso/BA", "Euclides da Cunha/BA", "Salgueiro/PE", "Caruaru/PE", "Recife/PE", "João Pessoa/PB", "Natal/RN", "Eusébio/CE"];
    }
    return ["Santa Luzia/MG", "Curvelo/MG", "Montes Claros/MG", "Vitória da Conquista/BA", "Feira de Santana/BA", "Euclides da Cunha/BA", "Salgueiro/PE", "Eusébio/CE"];
  }
  if (d.includes("GUARULHOS")) {
    return ["Santa Luzia/MG", "Carmópolis de Minas/MG", "Pouso Alegre/MG", "Guarulhos/SP"];
  }
  if (d.includes("GOV. CELSO RAMOS") || d.includes("GOVERNADOR CELSO RAMOS")) {
    return ["Santa Luzia/MG", "Carmópolis de Minas/MG", "Pouso Alegre/MG", "Bragança Paulista/SP", "Jarinu/SP", "Juquitiba/SP", "São José dos Pinhais/PR", "Joinville/SC", "Gov. Celso Ramos/SC"];
  }
  if (d.includes("XAXIM")) {
    return ["Santa Luzia/MG", "Carmópolis de Minas/MG", "Pouso Alegre/MG", "Jarinu/SP", "Osasco/SP", "Juquitiba/SP", "Registro/SP", "São José dos Pinhais/PR", "São Mateus do Sul/PR", "União da Vitória/PR", "Gen. Carneiro/PR", "Ponte Serrada/SC", "Xanxerê/SC", "Xaxim/SC"];
  }
  if (d.includes("JUIZ DE FORA")) {
    return ["Santa Luzia/MG", "Contagem/MG", "Conselheiro Lafaiete/MG", "Barbacena/MG", "Juiz de Fora/MG"];
  }
  if (d.includes("LINHARES")) {
    return ["Santa Luzia/MG", "Vargem Linda/MG", "Rio Casca/MG", "Manhuaçu/MG", "Venda Nova do Imigrante/ES", "Linhares/ES"];
  }
  if (d.includes("NATAL")) {
    return ["Santa Luzia/MG", "Curvelo/MG", "Montes Claros/MG", "Vitória da Conquista/BA", "Feira de Santana/BA", "Paulo Afonso/BA", "Caruaru/PE", "Recife/PE", "João Pessoa/PB", "Natal/RN"];
  }
  if (d.includes("PINHAIS")) {
    return ["Santa Luzia/MG", "Carmópolis de Minas/MG", "Pouso Alegre/MG", "Juquitiba/SP", "Pinhais/PR"];
  }
  if (d.includes("PATROCINIO PAULISTA") || d.includes("PATROCÍNIO PAULISTA")) {
    return ["Santa Luzia/MG", "Divinópolis/MG", "Capitólio/MG", "Passos/MG", "Patrocínio Paulista/SP"];
  }
  if (d.includes("RIO DE JANEIRO")) {
    return ["Santa Luzia/MG", "Congonhas/MG", "Barbacena/MG", "Santos Dumont/MG", "Juiz de Fora/MG", "Petrópolis/RJ", "Rio de Janeiro/RJ"];
  }
  if (d.includes("SALVADOR")) {
    if (d.includes("VALADARES") || d.includes("ANTONIO DIAS") || d.includes("ANTÔNIO DIAS")) {
      return ["Santa Luzia/MG", "Antônio Dias/MG", "Governador Valadares/MG", "Teófilo Otoni/MG", "Vitória da Conquista/BA", "Feira de Santana/BA", "Salvador/BA"];
    }
    return ["Santa Luzia/MG", "Curvelo/MG", "Montes Claros/MG", "Vitória da Conquista/BA", "Feira de Santana/BA", "Salvador/BA"];
  }
  if (d.includes("SUMARE") || d.includes("SUMARÉ")) {
    return ["Santa Luzia/MG", "Carmópolis de Minas/MG", "Pouso Alegre/MG", "Bragança Paulista/SP", "Campinas/SP", "Sumaré/SP"];
  }
  if (d.includes("VIANA")) {
    return ["Santa Luzia/MG", "Vargem Linda/MG", "Rio Casca/MG", "Manhuaçu/MG", "Venda Nova do Imigrante/ES", "Viana/ES"];
  }
  if (d.includes("GRAVATAI") || d.includes("GRAVATAÍ")) {
    return [
      "Santa Luzia/MG",
      "Carmópolis de Minas/MG",
      "Pouso Alegre/MG",
      "Juquitiba/SP",
      "Pinhais/PR",
      "Joinville/SC",
      "Tubarão/SC",
      "Osório/RS",
      "Gravatai/RS"
    ];
  }
  
  // Default fallback if no match
  return [orig, "Carmópolis de Minas/MG", "Pouso Alegre/MG", "Bragança Paulista/SP", "Jarinu/SP", "Juquitiba/SP", "São José dos Pinhais/PR", "Joinville/SC", dest];
};
