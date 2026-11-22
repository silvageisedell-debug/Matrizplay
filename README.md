# 🎮 MatrizPlay

**🔴 Ao vivo:** [Abrir o painel](https://matrizplay.silvageisedell.workers.dev) · **🎮 Jogo:** [Abrir o jogo](https://matrizplay.silvageisedell.workers.dev/jogo.html)

Jogo de desafios de **matrizes** para a sala de aula, com painel ao vivo para o telão e ranking em tempo real.

Os alunos escaneiam um QR Code, jogam pelo celular e o painel mostra quem está na frente. No fim da rodada, o painel anuncia o campeão.

## Como funciona

1. O professor abre o **painel** no telão. Ele mostra um **QR Code** que leva direto ao jogo.
2. Os alunos escaneiam o QR, escolhem um apelido e resolvem **5 fases**.
3. Ao terminar, o resultado é enviado ao painel. Fica registrada a **melhor tentativa** de cada apelido. Vence quem tem mais acertos, e o menor tempo desempata.
4. Quando o cronômetro da rodada chega a zero (ou o professor clica em **Mostrar o campeão**), o painel exibe o **campeão** e o **2º e 3º lugares**.

## Estrutura do projeto

```
public/
  index.html    # painel do professor (telão)
  jogo.html     # o jogo (aberto pelo QR Code)
  config.js     # endereço da API do ranking
src/
  index.js      # API do ranking (Cloudflare Workers)
wrangler.jsonc  # configuração do Cloudflare Workers
package.json
```

## Tecnologias

- HTML, CSS e JavaScript puros no painel e no jogo
- **Cloudflare Workers** para hospedar o site e a API
- **MongoDB Atlas** para guardar o ranking

## API do ranking

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/api/ranking` | Lista o ranking |
| `POST` | `/api/ranking` | Envia `{name, hits, time}` e guarda a melhor tentativa do apelido |
| `DELETE` | `/api/ranking` | Zera o ranking (exige o cabeçalho `x-admin-key`) |

## Como publicar

1. Crie um cluster no **MongoDB Atlas** e um usuário de banco com permissão apenas no banco `matrizplay`.
2. Conecte este repositório ao **Cloudflare Workers** (ou rode `npx wrangler deploy`).
3. No Worker, em **Settings → Variables and Secrets**, cadastre dois *secrets*:

| Nome | Para que serve |
|---|---|
| `MONGODB_URI` | Endereço de conexão do MongoDB Atlas |
| `ADMIN_KEY` | Senha do botão "Zerar ranking" |

4. Abra
