# Cesta: app nativo (Android e iPhone)

App feito com **Expo / React Native**: um código só para os dois sistemas. Traz tudo o que o protótipo web tem, com a mesma lógica de cálculo.

## Testar no celular (sem loja, sem cabo)

1. Instale o app **Expo Go** no celular (Play Store ou App Store).
2. No computador, com [Node.js](https://nodejs.org) 20 ou mais novo instalado:

   ```bash
   cd app
   npm install
   npx expo start
   ```

3. Vai aparecer um **QR Code** no terminal.
   - **Android:** abra o Expo Go e toque em "Scan QR code".
   - **iPhone:** aponte a câmera normal do iPhone para o QR Code e toque no aviso do Expo Go.
4. O app abre no celular. Cada vez que o código muda, ele recarrega sozinho.

O celular e o computador precisam estar na **mesma rede Wi-Fi**. Se não conectar (rede da empresa, roteador que bloqueia), use `npx expo start --tunnel`.

Para ver no navegador do computador: `npx expo start --web`.

## Estrutura

```
app/
├── App.js               # cabeçalho, abas e navegação
├── app.json             # nome, ícone, permissão de câmera
└── src/
    ├── data.js          # itens, preços, receitas, lanches, tabela nutricional (vindos do protótipo)
    ├── engine.js        # motor: escolhe receitas, cabe no orçamento, lista por corredor, trocas, NFC-e
    ├── store.js         # estado salvo no celular (AsyncStorage)
    ├── ui.js            # cores (claro e escuro) e componentes
    ├── Basket.js        # ilustração, logo e ícones
    └── screens/
        ├── Plan.js      # assistente passo a passo (uma pergunta por tela)
        ├── Menu.js      # cardápio, nutrição, trocas, marmita, receita (Não gostei / Favoritar)
        ├── List.js      # lista por corredor, carrinho ao vivo, QR Code da nota, pontos
        └── Prices.js    # tabela de preços editável
```

## O que muda em relação ao protótipo web

- **QR Code da nota:** usa a câmera do celular direto (expo-camera), sem precisar tirar foto.
- **Lista da família:** por enquanto é compartilhada como texto (WhatsApp etc.). A lista em tempo real, com o check de cada pessoa, precisa de um backend (próxima fase).
- **Dados** (respostas, plano, carrinho, preços, notas) ficam salvos no próprio celular.
- **Modo escuro** segue o do sistema.

## Publicar nas lojas (depois)

Quando for a hora, o [EAS Build](https://docs.expo.dev/build/introduction/) gera o `.apk`/`.aab` (Android) e o `.ipa` (iPhone) na nuvem, sem precisar de Android Studio ou Xcode. Publicar exige conta de desenvolvedor no Google Play (US$ 25, uma vez) e na Apple (US$ 99 por ano).
