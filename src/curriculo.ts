import { pool } from './db';

export type Linha = Record<string, any>;

/** Pessoa + todas as listas ligadas a ela; devolve null se a pessoa não existir. */
export async function carregarCurriculo(id: number) {
  const { rows } = await pool.query('select * from pessoas where id = $1', [id]);
  if (!rows[0]) return null;
  const filhos = await Promise.all(
    ['formacoes', 'experiencias', 'projetos', 'habilidades', 'idiomas'].map(async (t) => {
      const r = await pool.query(`select * from ${t} where pessoa_id = $1 order by ordem, id`, [id]);
      return [t, r.rows] as const;
    }),
  );
  return { ...rows[0], ...Object.fromEntries(filhos) } as Linha;
}
