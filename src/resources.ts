import { z } from 'zod';

const txt = z.string().trim().min(1);
const opt = z.string().trim().nullish();
const pessoaId = z.number().int().positive();
const ordem = z.number().int().optional();

export type Resource = {
  table: string;
  /** true quando a tabela pertence a uma pessoa (tem pessoa_id) */
  child: boolean;
  schema: z.ZodObject<z.ZodRawShape>;
};

export const resources: Record<string, Resource> = {
  pessoas: {
    table: 'pessoas',
    child: false,
    schema: z.object({
      nome: txt,
      titulo: opt,
      objetivo: opt,
      cidade: opt,
      email: opt,
      telefone: opt,
      linkedin: opt,
      github: opt,
    }),
  },
  formacoes: {
    table: 'formacoes',
    child: true,
    schema: z.object({
      pessoa_id: pessoaId,
      tipo: txt.optional(),
      curso: txt,
      instituicao: opt,
      inicio: opt,
      fim: opt,
      status: opt,
      detalhes: opt,
      ordem,
    }),
  },
  experiencias: {
    table: 'experiencias',
    child: true,
    schema: z.object({
      pessoa_id: pessoaId,
      cargo: txt,
      empresa: opt,
      inicio: opt,
      fim: opt,
      atual: z.boolean().optional(),
      atividades: z.array(txt).optional(),
      ordem,
    }),
  },
  projetos: {
    table: 'projetos',
    child: true,
    schema: z.object({
      pessoa_id: pessoaId,
      nome: txt,
      descricao: opt,
      tecnologias: z.array(txt).optional(),
      link: opt,
      ordem,
    }),
  },
  habilidades: {
    table: 'habilidades',
    child: true,
    schema: z.object({ pessoa_id: pessoaId, nome: txt, categoria: opt, ordem }),
  },
  idiomas: {
    table: 'idiomas',
    child: true,
    schema: z.object({ pessoa_id: pessoaId, idioma: txt, nivel: opt, ordem }),
  },
};
