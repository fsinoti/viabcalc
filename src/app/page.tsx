import { useState, useEffect } from 'react';

const CalculadoraViabilidade = () => {
  // Estados para o logo e título personalizáveis
  const [logo, setLogo] = useState(null);
  const [titulo, setTitulo] = useState('Calculadora de Viabilidade de Investimento Imobiliário');
  const [editandoTitulo, setEditandoTitulo] = useState(false);
  
  // Estado para controlar as abas
  const [abaAtiva, setAbaAtiva] = useState('entrada');
  
  // Estado para taxa de renda fixa e cenário de comparação
  const [taxaRendaFixa, setTaxaRendaFixa] = useState(10);
  const [cenarioComparacao, setCenarioComparacao] = useState('otimo');
  
  // Estado para os valores do formulário (valores numéricos)
  const [formData, setFormData] = useState({
    valorTerreno: 1000000,
    areaTerreno: 442,
    areaConstruida: 450,
    custoM2: 4500,
    precoVenda: 4050000,
    tipoImposto: 'PF',
    tipoCorretagem: 'corretor',
    itbi: 3,
    escritura: 0.75,
    certidoes: 3900,
    contadorSPE: 12000,
    condominio: 12800,
    luzAgua: 3900,
    iptu: 3000,
    contingencia: 10000,
    adminObra: 14, 
    projetos: 22000 
  });
  
  // Estado para os valores formatados exibidos nos inputs
  const [formattedInput, setFormattedInput] = useState({
    valorTerreno: '1.000.000,00',
    areaTerreno: '442,00',
    areaConstruida: '450,00',
    custoM2: '4.500,00',
    precoVenda: '4.050.000,00',
    itbi: '3,00',
    escritura: '0,75',
    certidoes: '3.900,00',
    contadorSPE: '12.000,00',
    condominio: '12.800,00',
    luzAgua: '3.900,00',
    iptu: '3.000,00',
    contingencia: '10.000,00',
    adminObra: '14,00',
    projetos: '22.000,00'
  });
  
  // Estado para armazenar os resultados
  const [resultados, setResultados] = useState(null);
  
  // Atualiza a formatação inicial
  useEffect(() => {
    const formattedValues = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'tipoImposto' && key !== 'tipoCorretagem') {
        formattedValues[key] = formatarNumeroInput(formData[key]);
      }
    });
    setFormattedInput(formattedValues);
  }, []);
  
  // Função para lidar com o upload de logo
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Função para alternar entre visualizar e editar o título
  const toggleEditarTitulo = () => {
    setEditandoTitulo(!editandoTitulo);
  };
  
  // Função para atualizar o título
  const handleTituloChange = (e) => {
    setTitulo(e.target.value);
  };
  
  // Função para finalizar a edição do título ao pressionar Enter
  const handleTituloKeyDown = (e) => {
    if (e.key === 'Enter') {
      setEditandoTitulo(false);
    }
  };
  
  // Função para formatar números no formato brasileiro
  const formatarNumeroInput = (valor) => {
    if (valor === null || valor === undefined) return '';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  // Função para converter string formatada para número
  const converterParaNumero = (valorFormatado) => {
    if (!valorFormatado) return 0;
    return parseFloat(valorFormatado.replace(/\./g, '').replace(',', '.')) || 0;
  };
  
  // Função para atualizar os valores do formulário
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    
    if (id === 'tipoImposto' || id === 'tipoCorretagem') {
      // Para select, atualiza diretamente
      setFormData({
        ...formData,
        [id]: value
      });
    } else {
      // Para campos numéricos, atualiza os estados de valor e formatação
      const numeroLimpo = converterParaNumero(value);
      
      setFormData({
        ...formData,
        [id]: numeroLimpo
      });
      
      setFormattedInput({
        ...formattedInput,
        [id]: value
      });
    }
  };
  
  // Função para lidar com o foco/blur em campos numéricos
  const handleFocus = (e) => {
    const { id, value } = e.target;
    const numeroDesformatado = value.replace(/\./g, '');
    setFormattedInput({
      ...formattedInput,
      [id]: numeroDesformatado
    });
  };
  
  const handleBlur = (e) => {
    const { id, value } = e.target;
    const numeroLimpo = converterParaNumero(value);
    setFormData({
      ...formData,
      [id]: numeroLimpo
    });
    setFormattedInput({
      ...formattedInput,
      [id]: formatarNumeroInput(numeroLimpo)
    });
  };
  
  // Função para formatar valores monetários
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(valor);
  };
  
  // Função para formatar porcentagens
  const formatarPorcentagem = (valor) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'percent', 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(valor / 100);
  };
  
  // Função para calcular a viabilidade
  const calcularViabilidade = () => {
    // Calcular para os três cenários
    const cenarios = ['ruim', 'otimo', 'perfeito'];
    const multiplicadores = [0.9, 1, 1.1]; // -10%, original, +10%
    const resultadosCenarios = {};
    
    // Cálculos comuns
    const custoConstrucao = formData.areaConstruida * formData.custoM2;
    const custoAdminObra = custoConstrucao * (formData.adminObra / 100);
    const custoTotalConstrucao = custoConstrucao + custoAdminObra;
    
    const custoItbi = formData.valorTerreno * (formData.itbi / 100);
    const custoEscritura = formData.valorTerreno * (formData.escritura / 100);
    
    // Custos fora da obra (incluindo custos relacionados ao terreno)
    const custoForaObra = formData.contadorSPE + formData.condominio + 
      formData.luzAgua + formData.iptu + formData.contingencia + 
      custoItbi + custoEscritura + formData.certidoes + formData.projetos;
    
    // Investimento total bruto
    const investimentoBruto = formData.valorTerreno + custoTotalConstrucao;
    
    cenarios.forEach((cenario, index) => {
      const valorVenda = formData.precoVenda * multiplicadores[index];
      
      // Custos de corretagem/propaganda
      let custoCorretagem = 0;
      if (formData.tipoCorretagem === 'corretor') {
        custoCorretagem = valorVenda * 0.05; // 5% para corretor
      } else {
        custoCorretagem = valorVenda * 0.01; // 1% para propaganda própria
      }
      
      // Lucro bruto
      const lucroBruto = valorVenda - investimentoBruto;
      
      // Imposto de renda
      let impostoRenda = 0;
      if (formData.tipoImposto === 'PF') {
        impostoRenda = lucroBruto * 0.15; // 15% para PF
      } else {
        impostoRenda = lucroBruto * 0.06; // 6% para PJ
      }
      
      // Resultado líquido antes de descontar custos fora obra
      const aReceber = lucroBruto - impostoRenda - custoCorretagem;
      
      // Resultado líquido final
      const resultadoLiquido = aReceber - custoForaObra;
      
      // Resultado líquido mensal
      const resultadoLiquidoMensal = resultadoLiquido / 12;
      
      // Cap Rate
      const capRateAnual = (resultadoLiquido / investimentoBruto) * 100;
      const capRateMensal = capRateAnual / 12;
      
      // Armazenar resultados
      resultadosCenarios[cenario] = {
        valorVenda,
        custoCorretagem,
        impostoRenda,
        lucroBruto,
        aReceber,
        resultadoLiquido,
        resultadoLiquidoMensal,
        capRateAnual,
        capRateMensal
      };
    });
    
    // Definir resultados
    setResultados({
      custoConstrucao,
      custoAdminObra,
      custoTotalConstrucao,
      custoItbi,
      custoEscritura,
      custoForaObra,
      investimentoBruto,
      cenarios: resultadosCenarios
    });
    
    // Mudar para a aba de resultados
    setAbaAtiva('resultados');
  };
  
  return (
    <div className="max-w-4xl mx-auto bg-white rounded shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="relative group cursor-pointer">
            {logo ? (
              <img 
                src={logo} 
                alt="Logo" 
                className="h-16 w-auto max-w-32 mr-4" 
                onClick={() => document.getElementById('logo-upload').click()}
              />
            ) : (
              <div 
                className="h-16 w-32 bg-gray-200 flex items-center justify-center mr-4 border border-dashed border-gray-400"
                onClick={() => document.getElementById('logo-upload').click()}
              >
                <span className="text-gray-500 text-xs text-center">Clique para adicionar logo</span>
              </div>
            )}
            <input 
              id="logo-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleLogoUpload}
            />
            <div className="hidden group-hover:block absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white text-xs">Alterar</span>
            </div>
          </div>
          
          <div>
            {editandoTitulo ? (
              <input
                type="text"
                value={titulo}
                onChange={handleTituloChange}
                onBlur={() => setEditandoTitulo(false)}
                onKeyDown={handleTituloKeyDown}
                className="text-2xl font-bold text-gray-700 border-b border-blue-500 focus:outline-none w-full"
                autoFocus
              />
            ) : (
              <h1 
                className="text-2xl font-bold text-gray-700 cursor-pointer" 
                onClick={toggleEditarTitulo}
                title="Clique para editar o título"
              >
                {titulo}
              </h1>
            )}
          </div>
        </div>
      </div>
      
      {/* Abas de navegação */}
      <div className="flex mb-6">
        <button 
          className={`px-6 py-2 ${abaAtiva === 'entrada' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-t`}
          onClick={() => setAbaAtiva('entrada')}
        >
          Entrada de Dados
        </button>
        <button 
          className={`px-6 py-2 ml-1 ${abaAtiva === 'resultados' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-t`}
          onClick={() => resultados && setAbaAtiva('resultados')}
        >
          Resultados
        </button>
        <button 
          className={`px-6 py-2 ml-1 ${abaAtiva === 'comparacao' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-t`}
          onClick={() => resultados && setAbaAtiva('comparacao')}
        >
          Comparativo Renda Fixa
        </button>
      </div>
      
      {abaAtiva === 'entrada' ? (
        <div>
          {/* Dados do Investimento */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white bg-gray-700 p-2 mb-4">Dados do Investimento</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className="block mb-1">Valor do Terreno (R$):</label>
                <input 
                  type="text" 
                  id="valorTerreno" 
                  value={formattedInput.valorTerreno} 
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block mb-1">Tipo de Imposto:</label>
                <select 
                  id="tipoImposto" 
                  value={formData.tipoImposto} 
                  onChange={handleInputChange} 
                  className="w-full p-2 border rounded"
                >
                  <option value="PF">Pessoa Física (15%)</option>
                  <option value="PJ">Pessoa Jurídica - Lucro Presumido (6%)</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1">Área do Terreno (m²):</label>
                <input 
                  type="text" 
                  id="areaTerreno" 
                  value={formattedInput.areaTerreno} 
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block mb-1">Tipo de Corretagem:</label>
                <select 
                  id="tipoCorretagem" 
                  value={formData.tipoCorretagem} 
                  onChange={handleInputChange} 
                  className="w-full p-2 border rounded"
                >
                  <option value="corretor">Corretor (5%)</option>
                  <option value="propria">Propaganda Própria (1%)</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1">Área Construída (m²):</label>
                <input 
                  type="text" 
                  id="areaConstruida" 
                  value={formattedInput.areaConstruida} 
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block mb-1">ITBI (%):</label>
                <input 
                  type="text" 
                  id="itbi" 
                  value={formattedInput.itbi} 
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block mb-1">Custo de Construção por m² (R$):</label>
                <input 
                  type="text" 
                  id="custoM2" 
                  value={formattedInput.custoM2} 
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block mb-1">Escritura/RGI (%):</label>
                <input 
                  type="text" 
                  id="escritura" 
                  value={formattedInput.escritura} 
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block mb-1">Preço de Venda (R$):</label>
                <input 
                  type="text" 
                  id="precoVenda" 
                  value={formattedInput.precoVenda} 
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block mb-1">Certidões, Cópias e Autenticações (R$):</label>
                <input 
                  type="text" 
                  id="certidoes" 
                  value={formattedInput.certidoes} 
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block mb-1">Taxa de Administração da Obra (%):</label>
                <input 
                  type="text" 
                  id="adminObra" 
                  value={formattedInput.adminObra} 
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block mb-1">Projetos (R$):</label>
                <input 
                  type="text" 
                  id="projetos" 
                  value={formattedInput.projetos} 
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
          
          {/* Custos Fora da Obra */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white bg-gray-700 p-2 mb-4">Custos Fora da Obra</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className="block mb-1">Contador + SPE (R$):</label>
                <input 
                  type="text" 
                  id="contadorSPE" 
                  value={formattedInput.contadorSPE} 
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block mb-1">Luz e Água (R$):</label>
                <input 
                  type="text" 
                  id="luzAgua" 
                  value={formattedInput.luzAgua} 
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block mb-1">Condomínio (R$):</label>
                <input 
                  type="text" 
                  id="condominio" 
                  value={formattedInput.condominio} 
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block mb-1">IPTU Anual (R$):</label>
                <input 
                  type="text" 
                  id="iptu" 
                  value={formattedInput.iptu} 
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block mb-1">Contingência (R$):</label>
                <input 
                  type="text" 
                  id="contingencia" 
                  value={formattedInput.contingencia} 
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={calcularViabilidade} 
              className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Calcular Viabilidade
            </button>
            <button 
              onClick={() => {
                const defaultValues = {
                  valorTerreno: 1000000,
                  areaTerreno: 442,
                  areaConstruida: 450,
                  custoM2: 4500,
                  precoVenda: 4050000,
                  tipoImposto: 'PF',
                  tipoCorretagem: 'corretor',
                  itbi: 3,
                  escritura: 0.75,
                  certidoes: 3900,
                  contadorSPE: 12000,
                  condominio: 12800,
                  luzAgua: 3900,
                  iptu: 3000,
                  contingencia: 10000,
                  adminObra: 14,
                  projetos: 22000
                };
                
                setFormData(defaultValues);
                
                const formattedValues = {};
                Object.keys(defaultValues).forEach(key => {
                  if (key !== 'tipoImposto' && key !== 'tipoCorretagem') {
                    formattedValues[key] = formatarNumeroInput(defaultValues[key]);
                  }
                });
                setFormattedInput(formattedValues);
                
                setResultados(null);
              }} 
              className="p-3 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Limpar Dados
            </button>
          </div>
        </div>
      ) : abaAtiva === 'resultados' ? (
        <div>
          {resultados ? (
            <div>
              <h2 className="text-lg font-bold text-white bg-gray-700 p-2 mb-4">Resultados da Análise de Viabilidade</h2>
              
              <table className="w-full border-collapse mb-6">
                <thead>
                  <tr className="bg-gray-700 text-white">
                    <th className="border border-gray-300 p-2 text-left">Item</th>
                    <th className="border border-gray-300 p-2 text-left">Ruim (-10%)</th>
                    <th className="border border-gray-300 p-2 text-left">Ótimo (Esperado)</th>
                    <th className="border border-gray-300 p-2 text-left">Perfeito (+10%)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Seção de Custos */}
                  <tr className="bg-blue-50">
                    <td colSpan="4" className="border p-2 font-bold bg-blue-100">Custos de Aquisição e Construção</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="border p-2">Valor do Terreno</td>
                    <td className="border p-2" colSpan="3">{formatarMoeda(formData.valorTerreno)}</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="border p-2">Custo de Construção Base</td>
                    <td className="border p-2" colSpan="3">{formatarMoeda(resultados.custoConstrucao)}</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="border p-2">Administração da Obra ({formData.adminObra}%)</td>
                    <td className="border p-2" colSpan="3">{formatarMoeda(resultados.custoAdminObra)}</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="border p-2">Custo Total de Construção</td>
                    <td className="border p-2" colSpan="3">{formatarMoeda(resultados.custoTotalConstrucao)}</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="border p-2 font-bold">Investimento Bruto</td>
                    <td className="border p-2 font-bold" colSpan="3">{formatarMoeda(resultados.investimentoBruto)}</td>
                  </tr>
                  
                  {/* Seção de Receitas */}
                  <tr className="bg-green-50">
                    <td colSpan="4" className="border p-2 font-bold bg-green-100">Receitas e Vendas</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="border p-2">Valor Final de Venda</td>
                    <td className="border p-2">{formatarMoeda(resultados.cenarios.ruim.valorVenda)}</td>
                    <td className="border p-2">{formatarMoeda(resultados.cenarios.otimo.valorVenda)}</td>
                    <td className="border p-2">{formatarMoeda(resultados.cenarios.perfeito.valorVenda)}</td>
                  </tr>
                  
                  {/* Seção de Custos Adicionais */}
                  <tr className="bg-red-50">
                    <td colSpan="4" className="border p-2 font-bold bg-red-100">Custos Adicionais</td>
                  </tr>
                  <tr className="bg-red-50">
                    <td className="border p-2">ITBI ({formData.itbi}%)</td>
                    <td className="border p-2" colSpan="3">{formatarMoeda(resultados.custoItbi)}</td>
                  </tr>
                  <tr className="bg-red-50">
                    <td className="border p-2">Escritura/RGI ({formData.escritura}%)</td>
                    <td className="border p-2" colSpan="3">{formatarMoeda(resultados.custoEscritura)}</td>
                  </tr>
                  <tr className="bg-red-50">
                    <td className="border p-2">Certidões, Cópias e Autenticações</td>
                    <td className="border p-2" colSpan="3">{formatarMoeda(formData.certidoes)}</td>
                  </tr>
                  
                  {/* Seção de Resultados */}
                  <tr className="bg-yellow-50">
                    <td colSpan="4" className="border p-2 font-bold bg-yellow-100">Análise de Lucros</td>
                  </tr>
                  <tr className="bg-yellow-50">
                    <td className="border p-2">Lucro Bruto</td>
                    <td className="border p-2">{formatarMoeda(resultados.cenarios.ruim.lucroBruto)}</td>
                    <td className="border p-2">{formatarMoeda(resultados.cenarios.otimo.lucroBruto)}</td>
                    <td className="border p-2">{formatarMoeda(resultados.cenarios.perfeito.lucroBruto)}</td>
                  </tr>
                  <tr className="bg-yellow-50">
                    <td className="border p-2">Imposto de Renda ({formData.tipoImposto === 'PF' ? '15%' : '6%'})</td>
                    <td className="border p-2">{formatarMoeda(resultados.cenarios.ruim.impostoRenda)}</td>
                    <td className="border p-2">{formatarMoeda(resultados.cenarios.otimo.impostoRenda)}</td>
                    <td className="border p-2">{formatarMoeda(resultados.cenarios.perfeito.impostoRenda)}</td>
                  </tr>
                  <tr className="bg-yellow-50">
                    <td className="border p-2">{formData.tipoCorretagem === 'corretor' ? 'Corretagem (5%)' : 'Propaganda Própria (1%)'}</td>
                    <td className="border p-2">{formatarMoeda(resultados.cenarios.ruim.custoCorretagem)}</td>
                    <td className="border p-2">{formatarMoeda(resultados.cenarios.otimo.custoCorretagem)}</td>
                    <td className="border p-2">{formatarMoeda(resultados.cenarios.perfeito.custoCorretagem)}</td>
                  </tr>
                  <tr className="bg-yellow-50">
                    <td className="border p-2">A Receber (antes dos custos fora obra)</td>
                    <td className="border p-2">{formatarMoeda(resultados.cenarios.ruim.aReceber)}</td>
                    <td className="border p-2">{formatarMoeda(resultados.cenarios.otimo.aReceber)}</td>
                    <td className="border p-2">{formatarMoeda(resultados.cenarios.perfeito.aReceber)}</td>
                  </tr>
                  <tr className="bg-yellow-50">
                    <td className="border p-2">Custos Fora Obra</td>
                    <td className="border p-2" colSpan="3">{formatarMoeda(resultados.custoForaObra)}</td>
                  </tr>
                  
                  {/* Linha de Resultado Final */}
                  <tr className="bg-purple-100 font-bold text-lg">
                    <td className="border p-2">Resultado Líquido</td>
                    <td className="border p-2">{formatarMoeda(resultados.cenarios.ruim.resultadoLiquido)}</td>
                    <td className="border p-2">{formatarMoeda(resultados.cenarios.otimo.resultadoLiquido)}</td>
                    <td className="border p-2">{formatarMoeda(resultados.cenarios.perfeito.resultadoLiquido)}</td>
                  </tr>
