import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { crudRouter } from './crud';
import { carregarCurriculo } from './curriculo';
import { gerarPdf } from './pdf';
import { resources } from './resources';

export const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ api: 'curriculo-api', rotas: Object.keys(resources).map((r) => `/${r}`), curriculo: '/pessoas/:id/curriculo', pdf: '/pessoas/:id/curriculo.pdf' });
});

const idValido = (v: unknown) => {
  const n = typeof v === 'string' ? Number(v) : NaN;
  return Number.isInteger(n) && n > 0 ? n : null;
};

// Currículo completo de uma pessoa (usado pelo app) — precisa vir antes do router de /pessoas
app.get('/pessoas/:id/curriculo', async (req, res, next) => {
  try {
    const id = idValido(req.params.id);
    if (!id) return res.status(400).json({ erro: 'id inválido' });
    const curriculo = await carregarCurriculo(id);
    return curriculo ? res.json(curriculo) : res.status(404).json({ erro: 'não encontrado' });
  } catch (e) {
    return next(e);
  }
});

// Currículo em PDF: o app abre este endereço e o celular baixa o arquivo
app.get('/pessoas/:id/curriculo.pdf', async (req, res, next) => {
  try {
    const id = idValido(req.params.id);
    if (!id) return res.status(400).json({ erro: 'id inválido' });
    const curriculo = await carregarCurriculo(id);
    if (!curriculo) return res.status(404).json({ erro: 'não encontrado' });
    const pdf = await gerarPdf(curriculo);
    const slug = String(curriculo.nome).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="curriculo-${slug}.pdf"`);
    return res.send(Buffer.from(pdf));
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
