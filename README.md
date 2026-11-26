<div align="center">

# 🛒 Cesta

**Planejador de compras e cardápio que cabe no seu orçamento.**

Você diz quanto pode gastar, quantas pessoas comem em casa e por quanto tempo. O Cesta monta o cardápio, as receitas e a lista do mercado, já com o custo estimado.

![Status](https://img.shields.io/badge/status-protótipo-orange)
![Plataformas](https://img.shields.io/badge/plataformas-Android%20%7C%20iOS-blue)
![Feito com](https://img.shields.io/badge/app-Expo%20%2F%20React%20Native-yellow)
![Idioma](https://img.shields.io/badge/idioma-pt--BR-green)
![Licença](https://img.shields.io/badge/licença-todos%20os%20direitos%20reservados-lightgrey)

</div>

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Como testar](#como-testar)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Base de preços](#base-de-preços)
- [Roadmap](#roadmap)
- [Como contribuir](#como-contribuir)
- [Licença](#licença)
- [Autor](#autor)

## Sobre o projeto

Planejar as compras do mês costuma ser um quebra-cabeça: o dinheiro é contado, cada pessoa da casa tem uma restrição ou um gosto, e sobra comida estragando na geladeira. O **Cesta** resolve isso em poucos toques.

A pessoa responde a um **assistente passo a passo** (uma pergunta por tela) e recebe:

1. um **cardápio** para o período escolhido, de uma semana a um mês;
2. as **receitas** de cada refeição;
3. a **lista de compras** organizada por corredor do mercado, com o preço estimado de cada item e o total.

O objetivo final é um app para **Android e iPhone**. Este repositório guarda, por enquanto, o protótipo web usado para validar a ideia e a tabela de preços que alimenta o cálculo.

## Funcionalidades

### O que o assistente pergunta

| Pergunta | Exemplo |
|---|---|
| Orçamento | R$ 200 |
| Pessoas | 2 adultos e 1 criança |
| Período | 7, 15 ou 30 dias |
| Restrições e intolerâncias | sem lactose, sem glúten, vegetariano |
| Ingredientes que não gosta | fígado, berinjela (diferente de restrição) |
| Culinárias preferidas | nordestina, caseira, italiana |
| Calorias e meta de proteína (opcional) | 2.000 kcal, proteína "mais" |
| Rotina | refeições fora de casa, quantas vezes cozinha, lanches |
| Despensa | o que já tem em casa |

### O que o app entrega

- ♻️ **Aproveitamento total**: receitas escolhidas para usar o mesmo ingrediente até o fim e evitar desperdício.
- 🏠 **Despensa**: itens que você já tem saem da lista e do custo.
- 🔄 **Trocas inteligentes**: sugestões de substituição mais baratas ou que respeitam restrições.
- 🍱 **Modo marmita**: cozinha uma vez e rende várias refeições.
- 👨‍👩‍👧 **Lista compartilhada da família**, organizada por corredor.
- 🧺 **Carrinho ao vivo**: anote o preço pago no mercado, veja a soma e receba aviso antes de estourar o orçamento.
- 🧾 **QR Code da nota fiscal**: lê a chave da NFC-e (a leitura dos itens depende de backend).
- 🥗 **Tabela nutricional** por pessoa/dia e por porção (valores aproximados da TACO).
- ❤️ **Favoritar** e 👎 **Não gostei**: receitas rejeitadas são trocadas e não voltam nos próximos planos.
- ✏️ **Tabela de preços editável** dentro do app.

## Como testar

### App nativo (Android e iPhone)

Instale o **Expo Go** no celular, rode `cd app && npm install && npx expo start` no computador e leia o QR Code que aparece. Passo a passo em [`app/README.md`](app/README.md).

### Protótipo web no computador

Não há instalação nem build. Basta abrir o arquivo no navegador:

```bash
git clone https://github.com/yagolc/planejador-compras.git
cd planejador-compras
# abra prototipo/index.html no navegador (duplo clique funciona)
```

### Protótipo web no celular

**Opção 1: versão publicada (recomendada).** Abra o link do protótipo publicado no Claude no navegador do celular. É a única forma em que a lista compartilhada da família funciona, porque ela usa o armazenamento do Claude.

**Opção 2: servidor local na mesma rede Wi-Fi.**

```bash
npx serve prototipo
# ou: python3 -m http.server 8000 --directory prototipo
```

Descubra o IP do computador (ex.: `192.168.0.10`) e abra `http://192.168.0.10:3000` (ou `:8000`) no navegador do celular. Para ficar com cara de app, use "Adicionar à tela inicial".

> Os dados do protótipo (respostas, lista marcada, preços editados) ficam salvos no `localStorage` do navegador.

## Estrutura do repositório

```
planejador-compras/
├── app/                      # App nativo Android e iPhone (Expo / React Native), ver app/README.md
├── prototipo/
│   └── index.html            # Protótipo web completo (HTML, CSS e JS em um único arquivo)
├── precos/
│   ├── precos_medios_v1.csv  # Tabela de preços médios (80 itens, nov/2026)
│   └── README.md             # Fontes dos preços e como atualizá-los
└── README.md
```

### Formato da tabela de preços

| Coluna | Descrição |
|---|---|
| `id` | Identificador do item |
| `item` | Nome do produto (ex.: Arroz agulhinha tipo 1) |
| `categoria` | Corredor/categoria (ex.: Grãos e cereais) |
| `embalagem`, `qtd_embalagem` | Embalagem padrão e quantidade |
| `unidade_base` | kg, L ou unidade |
| `preco_embalagem_brl` | Preço da embalagem em R$ |
| `preco_por_unidade_base_brl` | Preço por kg, L ou unidade |
| `tipo` | `pesquisado` ou `estimativa` |
| `fonte`, `referencia` | Origem do preço e mês de referência |

## Base de preços

- A cidade base dos testes é **Quixadá (CE)**.
- O protótipo usa os preços da cesta básica **DIEESE de Fortaleza** (out/2026). Itens fora da cesta usam o preço de São Paulo ajustado por um fator regional e aparecem como estimativa.
- 38 itens têm preço pesquisado (Procon-SP/DIEESE) e 42 são estimativas. Veja as fontes e a proposta de atualização automática (IPCA por subitem do IBGE, Conab Prohort) em [`precos/README.md`](precos/README.md).

## Roadmap

- [x] Protótipo web com assistente passo a passo
- [x] Tabela de preços médios v1
- [x] Cardápio, receitas, lista por corredor e carrinho ao vivo
- [x] Tabela nutricional e meta de proteína
- [x] App nativo para Android e iPhone (Expo / React Native) na pasta `app/`
- [ ] Backend para sincronizar a lista da família e ler os itens da nota fiscal
- [ ] Atualização mensal automática dos preços
- [ ] Ofertas da semana dos mercados próximos
- [ ] Preços regionais pela localização, com pontos para quem fotografa preços

## Como contribuir

1. Crie um branch a partir do `main`: `git checkout -b minha-melhoria`
2. Faça commits pequenos e com mensagens claras em português
3. Abra um pull request descrevendo o que mudou e como testar

## Licença

Projeto privado. Todos os direitos reservados. Uma licença aberta pode ser definida no futuro.

## Autor

Feito por **Yago** ([@yagolc](https://github.com/yagolc)), de Quixadá (CE).
