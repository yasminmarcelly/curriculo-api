import { Router, type NextFunction, type Request, type Response } from 'express';
import { pool } from './db';
import type { Resource } from './resources';

const wrap =
  (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

const parseId = (v: unknown) => {
  const n = typeof v === 'string' ? Number(v) : NaN;
  return Number.isInteger(n) && n > 0 ? n : null;
};

/** Gera as 5 rotas do CRUD de um recurso. Os nomes de coluna vêm sempre do schema zod, nunca do cliente. */
export function crudRouter({ table, child, schema }: Resource) {
  const r = Router();
  const order = child ? 'ordem, id' : 'id';

  r.get('/', wrap(async (req, res) => {
    const pid = typeof req.query.pessoa_id === 'string' ? parseId(req.query.pessoa_id) : null;
    const { rows } =
      child && pid
        ? await pool.query(`select * from ${table} where pessoa_id = $1 order by ${order}`, [pid])
        : await pool.query(`select * from ${table} order by ${order}`);
    res.json(rows);
  }));

  r.get('/:id', wrap(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'id inválido' });
    const { rows } = await pool.query(`select * from ${table} where id = $1`, [id]);
    return rows[0] ? res.json(rows[0]) : res.status(404).json({ erro: 'não encontrado' });
  }));

  r.post('/', wrap(async (req, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ erro: 'dados inválidos', detalhes: parsed.error.flatten().fieldErrors });
    const cols = Object.keys(parsed.data);
    const vals = Object.values(parsed.data);
    const { rows } = await pool.query(
      `insert into ${table} (${cols.join(', ')}) values (${cols.map((_, i) => `$${i + 1}`).join(', ')}) returning *`,
      vals,
    );
    return res.status(201).json(rows[0]);
  }));

  const update = wrap(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'id inválido' });
    // PUT exige o objeto completo; PATCH aceita campos parciais
    const parsed = (req.method === 'PUT' ? schema : schema.partial()).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ erro: 'dados inválidos', detalhes: parsed.error.flatten().fieldErrors });
    const cols = Object.keys(parsed.data);
    if (cols.length === 0) return res.status(400).json({ erro: 'nenhum campo para atualizar' });
    const { rows } = await pool.query(
      `update ${table} set ${cols.map((c, i) => `${c} = $${i + 1}`).join(', ')} where id = $${cols.length + 1} returning *`,
      [...Object.values(parsed.data), id],
    );
    return rows[0] ? res.json(rows[0]) : res.status(404).json({ erro: 'não encontrado' });
  });
  r.put('/:id', update);
  r.patch('/:id', update);

  r.delete('/:id', wrap(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ erro: 'id inválido' });
    const { rowCount } = await pool.query(`delete from ${table} where id = $1`, [id]);
    return rowCount ? res.status(204).end() : res.status(404).json({ erro: 'não encontrado' });
  }));

  return r;
}
