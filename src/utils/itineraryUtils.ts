export const getCitiesForDestination = (dest: string, orig: string = "Santa Luzia/MG"): string[] => {
  const d = dest.toUpperCase();
  
  if (d.includes("CURITIBA")) {
    return ["Santa Luzia/MG", "Carmópolis de Minas/MG", "Pouso Alegre/MG", "Juquitiba/SP", "Curitiba/PR"];
  }
  if (d.includes("CASTRO")) {
    return ["Santa Luzia/MG", "Carmópolis de Minas/MG", "Pouso Alegre/MG", "Juquitiba/SP", "Sorocaba/SP", "Itapetininga/SP", "Itapeva/SP", "Jaguariaíva/PR", "Piraí do Sul/PR", "Castro/PR"];
  }
  if (d.includes("BRASILIA") || d.includes("BRASÍLIA")) {
    return ["Santa Luzia/MG", "Sete Lagoas/MG", "Felixlândia/MG", "Três Marias/MG", "João Pinheiro/MG", "Paracatu/MG", "Cristalina/GO", "Brasília/DF"];
  }
  if (d.includes("BEBEDOURO")) {
    return ["Santa Luzia/MG", "Divinópolis/MG", "Capitólio/MG", "Passos/MG", "São Sebastião do Paraíso/MG", "Batatais/SP", "Ribeirão Preto/SP", "Bebedouro/SP"];
  }
  if (d.includes("SUMARE") || d.includes("SUMARÉ")) {
    return ["Santa Luzia/MG", "Carmópolis de Minas/MG", "Pouso Alegre/MG", "Bragança Paulista/SP", "Campinas/SP", "Sumaré/SP"];
  }
  if (d.includes("SALVADOR") && d.includes("MOC")) {
    return ["Santa Luzia/MG", "Curvelo/MG", "Montes Claros/MG", "Vitória da Conquista/BA", "Feira de Santana/BA", "Salvador/BA"];
  }
  if (d.includes("SALVADOR") && (d.includes("VALADARES") || d.includes("ANTONIO DIAS") || d.includes("ANTÔNIO DIAS"))) {
    return ["Santa Luzia/MG", "Antônio Dias/MG", "Governador Valadares/MG", "Teófilo Otoni/MG", "Vitória da Conquista/BA", "Feira de Santana/BA", "Salvador/BA"];
  }
  if (d.includes("SALVADOR")) {
    // Fallback to MOC if not specified
    return ["Santa Luzia/MG", "Curvelo/MG", "Montes Claros/MG", "Vitória da Conquista/BA", "Feira de Santana/BA", "Salvador/BA"];
  }
  if (d.includes("RIO DE JANEIRO")) {
    return ["Santa Luzia/MG", "Congonhas/MG", "Barbacena/MG", "Santos Dumont/MG", "Juiz de Fora/MG", "Petrópolis/RJ", "Rio de Janeiro/RJ"];
  }
  if (d.includes("PATROCINIO PAULISTA") || d.includes("PATROCÍNIO PAULISTA")) {
    return ["Santa Luzia/MG", "Divinópolis/MG", "Capitólio/MG", "Passos/MG", "Patrocínio Paulista/SP"];
  }
  
  // Default fallback if no match
  return [orig, "Carmópolis de Minas/MG", "Pouso Alegre/MG", "Bragança Paulista/SP", "Jarinu/SP", "Juquitiba/SP", "São José dos Pinhais/PR", "Joinville/SC", dest];
};
