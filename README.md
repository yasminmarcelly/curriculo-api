# Currículo API

API REST em Express + TypeScript + PostgreSQL (NeonDB), publicada no Vercel.

## Rotas

| Recurso | Rotas |
|---|---|
| `/pessoas`, `/formacoes`, `/experiencias`, `/projetos`, `/habilidades`, `/idiomas` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `PATCH /:id`, `DELETE /:id` |
| `/pessoas/:id/curriculo` | `GET` — pessoa + formações, experiências, projetos, habilidades e idiomas |

`formacoes`, `experiencias`, `projetos`, `habilidades` e `idiomas` pertencem a uma pessoa (`pessoa_id`, com `on delete cascade`) e aceitam o filtro `?pessoa_id=1` na listagem.

## Rodar localmente

```bash
npm install
cp .env.example .env     # preencha DATABASE_URL com a string do NeonDB
npm run seed             # cria as tabelas e cadastra os 2 currículos
npm run dev              # http://localhost:3000
```

`npm run seed` apaga e recria os dados das tabelas; rode só quando quiser resetar o banco.

## Deploy no Vercel

1. Suba o código no GitHub.
2. No Vercel: Add New > Project > importe o repositório (framework: Other).
3. Em Environment Variables, crie `DATABASE_URL` com a connection string do NeonDB.
4. Deploy. A API fica em `https://<projeto>.vercel.app`.

## Postman

Importe `postman/curriculo-api.postman_collection.json` e troque a variável `baseUrl` pela URL do Vercel (aba Variables da coleção). Rode "Criar" antes de "Buscar", "Atualizar" e "Excluir": o id criado fica salvo em `novoId`.
