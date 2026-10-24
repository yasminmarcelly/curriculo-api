import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import type { Linha } from './curriculo';

const W = 595.28;
const H = 841.89;
const M = 50;
const INK = rgb(0.12, 0.14, 0.19);
const MUTED = rgb(0.4, 0.44, 0.52);
const ACCENT = rgb(0.18, 0.36, 0.92);

// As fontes padrão do PDF só cobrem Latin-1 (acentos do português incluídos); o resto é descartado.
const limpa = (s: unknown) => String(s ?? '').replace(/[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026]/g, '');

const periodo = (i?: string | null, f?: string | null, atual = false) =>
  i || f ? `${i ?? ''} - ${atual ? 'atual' : (f ?? '')}`.trim() : '';

export async function gerarPdf(c: Linha): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page = doc.addPage([W, H]);
  let y = H - M;

  const quebra = (texto: string, font: PDFFont, size: number, largura: number) => {
    const linhas: string[] = [];
    let atual = '';
    for (const palavra of limpa(texto).split(/\s+/).filter(Boolean)) {
      const teste = atual ? `${atual} ${palavra}` : palavra;
      if (font.widthOfTextAtSize(teste, size) > largura && atual) {
        linhas.push(atual);
        atual = palavra;
      } else atual = teste;
    }
    if (atual) linhas.push(atual);
    return linhas;
  };

  const texto = (t: string, o: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; indent?: number; gap?: number } = {}) => {
    const { font = regular, size = 10.5, color = INK, indent = 0, gap = 3 } = o;
    for (const linha of quebra(t, font, size, W - 2 * M - indent)) {
      if (y < M + size) {
        page = doc.addPage([W, H]);
        y = H - M;
      }
      page.drawText(linha, { x: M + indent, y: y - size, size, font, color });
      y -= size * 1.35;
    }
    y -= gap;
  };

  const secao = (titulo: string) => {
    y -= 10;
    if (y < M + 60) {
      page = doc.addPage([W, H]);
      y = H - M;
    }
    texto(titulo, { font: bold, size: 12.5, color: ACCENT, gap: 1 });
    page.drawLine({ start: { x: M, y: y + 2 }, end: { x: W - M, y: y + 2 }, thickness: 0.6, color: rgb(0.89, 0.91, 0.94) });
    y -= 6;
  };

  texto(c.nome, { font: bold, size: 20, gap: 2 });
  if (c.titulo) texto(c.titulo, { size: 11.5, color: MUTED, gap: 2 });
  const contato = [c.cidade, c.email, c.telefone, c.linkedin, c.github].filter(Boolean).join('  |  ');
  if (contato) texto(contato, { size: 9, color: MUTED });

  if (c.objetivo) {
    secao('Objetivo');
    texto(c.objetivo);
  }
  if (c.formacoes.length) {
    secao('Formação acadêmica');
    for (const f of c.formacoes) {
      texto(f.curso, { font: bold, gap: 0 });
      const sub = [f.instituicao, periodo(f.inicio, f.fim), f.status].filter(Boolean).join('  |  ');
      if (sub) texto(sub, { color: MUTED, size: 9.5 });
      else y -= 3;
    }
  }
  if (c.experiencias.length) {
    secao('Experiência profissional');
    for (const e of c.experiencias) {
      texto(e.cargo, { font: bold, gap: 0 });
      const sub = [e.empresa, periodo(e.inicio, e.fim, e.atual)].filter(Boolean).join('  |  ');
      if (sub) texto(sub, { color: MUTED, size: 9.5, gap: 2 });
      for (const a of e.atividades as string[]) texto(`- ${a}`, { indent: 8, gap: 1 });
      y -= 5;
    }
  }
  if (c.projetos.length) {
    secao('Projetos');
    for (const p of c.projetos) {
      texto(p.nome, { font: bold, gap: 0 });
      if (p.descricao) texto(p.descricao, { gap: 1 });
      if (p.tecnologias.length) texto(`Tecnologias: ${(p.tecnologias as string[]).join(', ')}`, { color: MUTED, size: 9.5 });
      if (p.link) texto(p.link, { color: ACCENT, size: 9.5 });
      y -= 4;
    }
  }
  if (c.habilidades.length) {
    secao('Habilidades');
    texto(c.habilidades.map((h: Linha) => h.nome).join(', '));
  }
  if (c.idiomas.length) {
    secao('Idiomas');
    texto(c.idiomas.map((i: Linha) => `${i.idioma}: ${i.nivel ?? ''}`).join('  |  '));
  }

  return doc.save();
}
