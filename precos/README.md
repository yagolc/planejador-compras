# Tabela de preços médios v1 (nov/2026)

Arquivo: `precos_medios_v1.csv` com 80 itens: preço da embalagem, preço por unidade base (kg, L ou unidade), categoria, tipo e fonte.

- **38 itens pesquisados**: preços médios reais da pesquisa de cesta básica Procon-SP/DIEESE de outubro/2026, cidade de São Paulo.
- **42 itens estimados** (coluna `tipo = estimativa`): hortifrúti fora da cesta, cortes específicos de carne, laticínios e mercearia. São estimativas minhas, sem uma pesquisa de preço por trás. Valide antes de usar em produção.

Atenção: os preços são de São Paulo, a capital com a cesta mais cara do país. Em outubro/2026 a cesta DIEESE custava R$ 951 em SP, R$ 811 em BH e Brasília, R$ 706 em Recife e R$ 678 em Salvador. Um fator regional simples (custo da cesta na capital ÷ custo em SP) já ajusta bem a tabela para outras cidades.

## Fontes e o que dá para atualizar automaticamente

| Fonte | O que traz | Frequência | Automatizável? |
|---|---|---|---|
| IBGE SIDRA, IPCA por subitem (tabela 7060) | Variação % mensal de cerca de 200 subitens de alimentos (arroz, tomate, frango...) | Mensal | **Sim, API oficial e gratuita** (apisidra.ibge.gov.br). Ideal para corrigir os preços base todo mês. Não traz preço em R$, só a variação. |
| Conab Prohort | Preços diários de hortifrúti no atacado (Ceasas) | Diária | **Sim, dados abertos.** É preço de atacado, então precisa de margem de varejo (em torno de 1,5 a 2x, a calibrar). |
| Procon-SP/DIEESE cesta (SP) | Preço médio em R$ de 39 produtos, com embalagem | Mensal | **Parcial.** Sai em PDF com URL previsível. Dá para extrair por script, mas é frágil. |
| DIEESE/Conab cesta nacional (27 capitais) | Custo total da cesta por capital e variação por item | Mensal | **Parcial.** O PDF não traz preço por item, mas serve para o fator regional. |
| Notas fiscais estaduais (ex.: Menor Preço/Nota Paraná, Preço da Hora Bahia, Economiza Alagoas) | Preço real por produto e por mercado, a partir da NFC-e | Quase em tempo real | **Promissor, mas não verifiquei.** Só cobre alguns estados e cada um tem regras próprias de acesso. |
| Sites de supermercados (Carrefour, Pão de Açúcar etc.) | Preço de prateleira online | Diária | Tecnicamente sim (muitos usam a VTEX, com API pública de catálogo), mas há risco com os termos de uso. Não recomendo como base. |

**Sugestão de pipeline:** usar esta tabela como base, aplicar todo mês a variação do IPCA por subitem (SIDRA), atualizar o hortifrúti com o Prohort mais margem e ajustar por região com o fator da cesta DIEESE.

## Referências
- Procon-SP, cesta básica out/2026: https://www.procon.sp.gov.br/wp-content/uploads/2026/11/CB-outubro-2026-com-comparativo-anual.pdf
- DIEESE, cesta básica out/2026: https://www.dieese.org.br/analisecestabasica/2026/202610cestabasica.pdf
- Conab, dados abertos: https://www.gov.br/conab/pt-br/acesso-a-informacao/dados-abertos
