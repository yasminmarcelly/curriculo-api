import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { crudRouter } from './crud';
import { pool } from './db';
import { resources } from './resources';

export const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ api: 'curriculo-api', rotas: Object.keys(resources).map((r) => `/${r}`), curriculo: '/pessoas/:id/curriculo' });
});

// Currículo completo de uma pessoa (usado pelo app) — precisa vir antes do router de /pessoas
app.get('/pessoas/:id/curriculo', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: 'id inválido' });
    const { rows } = await pool.query('select * from pessoas where id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ erro: 'não encontrado' });
    const filhos = await Promise.all(
      ['formacoes', 'experiencias', 'projetos', 'habilidades', 'idiomas'].map(async (t) => {
        const r = await pool.query(`select * from ${t} where pessoa_id = $1 order by ordem, id`, [id]);
        return [t, r.rows] as const;
      }),
    );
    return res.json({ ...rows[0], ...Object.fromEntries(filhos) });
  } catch (e) {
    return next(e);
  }
});

for (const [nome, recurso] of Object.entries(resources)) app.use(`/${nome}`, crudRouter(recurso));

app.use((_req, res) => res.status(404).json({ erro: 'rota não encontrada' }));
app.use((err: Error & { code?: string }, _req: Request, res: Response, _next: NextFunction) => {
  if (err.code === '23503') return res.status(400).json({ erro: 'pessoa_id não existe' });
  console.error(err);
  return res.status(500).json({ erro: 'erro interno' });
});

export default app;
