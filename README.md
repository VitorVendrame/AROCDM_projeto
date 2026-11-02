# AROCDM - Aplicativo para Reconhecimento de Objetos via Câmera de Dispositivo Móvel

Trabalho de Conclusão de Curso (TCC) — **Escola de Engenharia de Piracicaba (EEP)**

Aplicativo móvel em React Native + Expo que usa a câmera do celular para detectar objetos do cotidiano em tempo real e mostrar na tela o nome do item identificado, em português. O processamento (inferência) acontece **no próprio dispositivo** (*on-device*), sem enviar imagens para servidores externos.

## Funcionalidades

- Visualização da câmera em tempo real
- Detecção de objetos com caixas delimitadoras (*bounding boxes*)
- Nome do objeto em português e percentual de confiança
- Reconhecimento das 80 classes do conjunto de dados COCO (pessoa, cadeira, celular, garrafa, notebook etc.)
- Alternância entre câmera traseira e frontal
- Telas de carregamento do modelo e de erro/permissão

## Tecnologias

| Tecnologia | Uso |
|---|---|
| [React Native](https://reactnative.dev) 0.81 | Framework de desenvolvimento móvel multiplataforma |
| [Expo](https://expo.dev) SDK 54 / Expo Router | Ambiente de desenvolvimento, navegação e APIs nativas |
| expo-camera | Acesso à câmera do dispositivo |
| [TensorFlow.js](https://www.tensorflow.org/js) + tfjs-react-native | Execução do modelo de aprendizado profundo no dispositivo |
| COCO-SSD | Modelo de detecção de objetos pré-treinado no conjunto COCO (mesmas 80 classes usadas pelo YOLO) |
| TypeScript | Tipagem estática do código |

> **Sobre o YOLO:** o projeto segue a abordagem de detecção de objetos em passagem única (*single-shot*), a mesma ideia do YOLO. No protótipo atual é usado o COCO-SSD via TensorFlow.js, porque ele roda no Expo Go sem módulos nativos personalizados. Ele foi treinado no mesmo conjunto de dados (COCO) e reconhece as mesmas classes. Um modelo YOLO exportado para TensorFlow.js pode ser colocado no lugar dele no hook `src/hooks/useObjectDetection.ts`.

## Pré-requisitos

- [Node.js](https://nodejs.org) 18 ou superior (recomendado: versão LTS)
- npm (já vem com o Node.js) ou Yarn
- Expo CLI (usado via `npx expo`, não precisa instalar globalmente)
- [Visual Studio Code](https://code.visualstudio.com) (editor recomendado)
- Celular Android ou iOS com o app **Expo Go** instalado (Play Store / App Store)

## Instalação e execução

```bash
# 1. Clonar o repositório
git clone https://github.com/VitorVendrame/ARFCDM.git
cd ARFCDM

# 2. Instalar as dependências
npm install
# ou: yarn install

# 3. (Opcional) Ajustar as versões dos pacotes ao SDK do Expo
npx expo install --fix

# 4. Iniciar o servidor de desenvolvimento
npx expo start
```

## Como testar no celular com o Expo Go

1. Instale o **Expo Go** no celular.
2. Conecte o computador e o celular à **mesma rede Wi-Fi**.
3. Rode `npx expo start` no terminal do VSCode.
4. **Android:** abra o Expo Go e escaneie o QR Code que aparece no terminal.
   **iOS:** escaneie o QR Code com o app Câmera.
5. Quando pedir, permita o acesso à câmera.
6. Espere o modelo carregar (na primeira vez, o modelo é baixado e pode levar alguns segundos) e aponte a câmera para objetos.

> Se a rede bloquear a conexão, use `npx expo start --tunnel`.

## Estrutura do projeto

```
AROCDM/
├── app/                        # Telas (Expo Router)
│   ├── _layout.tsx             # Layout raiz e ErrorBoundary
│   ├── index.tsx               # Tela principal: câmera + detecção
│   └── +not-found.tsx          # Tela de rota não encontrada
├── src/
│   ├── components/
│   │   ├── DetectionOverlay.tsx  # Caixas e rótulos dos objetos detectados
│   │   ├── ErrorBoundary.tsx     # Tratamento de erros da interface
│   │   ├── ErrorScreen.tsx       # Tela de erro
│   │   └── LoadingScreen.tsx     # Tela de carregamento do modelo
│   ├── constants/
│   │   ├── cocoTranslations.ts   # Tradução das 80 classes COCO para PT-BR
│   │   └── theme.ts              # Cores e estilos
│   ├── hooks/
│   │   └── useObjectDetection.ts # Carregamento do modelo e inferência
│   └── types/
│       └── detection.ts          # Tipos TypeScript
├── shims/
│   └── react-native-fs.js      # Shim para a versão web
├── assets/                     # Ícones e splash screen
├── app.json                    # Configuração do Expo
├── metro.config.js             # Configuração do bundler Metro
├── package.json
└── tsconfig.json
```

## Autor

**Vitor Vendrame Campeão**

## Orientador

**Prof. Cleberson Eugenio Forte**

## Licença

Distribuído sob a licença descrita no arquivo [LICENSE](LICENSE).
