import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from './db';

type Row = Record<string, unknown>;

async function insert(client: { query: (q: string, v: unknown[]) => Promise<{ rows: Row[] }> }, table: string, row: Row) {
  const cols = Object.keys(row);
  const { rows } = await client.query(
    `insert into ${table} (${cols.join(', ')}) values (${cols.map((_, i) => `$${i + 1}`).join(', ')}) returning id`,
    Object.values(row),
  );
  return rows[0].id as number;
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query(readFileSync(join(__dirname, 'schema.sql'), 'utf8'));
    await client.query('begin');
    await client.query('truncate pessoas restart identity cascade');

    // ---------- Yasmin ----------
    const y = await insert(client, 'pessoas', {
      nome: 'Yasmin Marcelly Vasconcelos de Arruda',
      titulo: 'Estudante de Sistemas para Internet',
      objetivo:
        'Estudante do curso de Sistemas para Internet na UNICAP, com experiência prática em suporte técnico de primeiro nível. Busco uma oportunidade para continuar a desenvolver minhas habilidades tecnológicas, ao mesmo tempo em que contribuo para o suporte ao usuário e para soluções digitais. Perfil comunicativo, organizado e autodidata, com grande interesse em metodologias ágeis.',
      cidade: 'Recife/PE',
      linkedin: 'https://www.linkedin.com/in/yasminmarcelly',
      github: 'https://github.com/yasminmarcelly',
    });

    await insert(client, 'formacoes', {
      pessoa_id: y, tipo: 'graduacao', curso: 'Sistemas para Internet', instituicao: 'UNICAP',
      inicio: '01/2025', fim: '01/2027', status: 'Em andamento · previsão de conclusão em 01/2027 · turno noturno', ordem: 1,
    });
    await insert(client, 'formacoes', {
      pessoa_id: y, tipo: 'curso', curso: 'Pacote Office (Word, Excel e PowerPoint)', instituicao: 'IJCPM', ordem: 2,
    });

    // TODO: preencher empresa e período das duas experiências abaixo (PUT /experiencias/:id)
    await insert(client, 'experiencias', {
      pessoa_id: y, cargo: 'Suporte técnico de primeiro nível', ordem: 1,
      atividades: [
        'Suporte técnico de primeiro nível a usuários (hardware, software e sistemas)',
        'Atendimento e suporte aos usuários no sistema CRM corporativo',
        'Cadastro, atualização e organização de dados em sistemas internos',
        'Criação, manutenção e organização de planilhas no Microsoft Excel para controle de chamados e informações operacionais',
      ],
    });
    await insert(client, 'experiencias', {
      pessoa_id: y, cargo: 'Auxiliar administrativo', ordem: 2,
      atividades: [
        'Lançamento e conferência de notas fiscais no sistema TOTVS Datasul',
        'Elaboração e atualização de planilhas de controle',
        'Organização de documentos administrativos',
        'Atendimento e recebimento de fornecedores e materiais',
      ],
    });

    await insert(client, 'projetos', {
      pessoa_id: y, nome: 'MoviePicker', ordem: 1,
      descricao:
        'Projeto pessoal que recomenda filmes do século 21 de forma aleatória, com base na lista do The New York Times. Desenvolvido para praticar HTML, CSS e JavaScript, com consumo de APIs e manipulação do DOM, e Git para versionar o código.',
      tecnologias: ['HTML', 'CSS', 'JavaScript', 'Git', 'GitHub'],
    });

    const skills: [string, string][] = [
      ['Java', 'Programação'], ['JavaScript', 'Programação'], ['HTML', 'Programação'], ['CSS', 'Programação'],
      ['React', 'Programação'], ['Next.js', 'Programação'], ['Node.js', 'Programação'],
      ['MySQL', 'Banco de dados'], ['PostgreSQL', 'Banco de dados'],
      ['Pacote Office', 'Ferramentas'], ['Atendimento ao usuário', 'Comportamental'],
    ];
    for (const [i, [nome, categoria]] of skills.entries()) {
      await insert(client, 'habilidades', { pessoa_id: y, nome, categoria, ordem: i });
    }
    await insert(client, 'idiomas', { pessoa_id: y, idioma: 'Inglês', nivel: 'C1', ordem: 1 });

    // ---------- Taysi ----------
    const t = await insert(client, 'pessoas', {
      nome: 'Taysi Biank Vasconcelos de Arruda',
      titulo: 'Profissional administrativa',
      objetivo:
        'Atuar na área administrativa, contribuindo com a organização de processos, atendimento ao público, faturamento e suporte operacional. Busco aplicar minhas experiências em logística, gestão de agendas, conferência de convênios e apoio às equipes, agregando eficiência e qualidade ao ambiente de trabalho.',
      cidade: 'Boa Viagem, Recife/PE',
    });

    await insert(client, 'formacoes', {
      pessoa_id: t, tipo: 'ensino_medio', curso: 'Ensino médio', instituicao: 'Escola Brigadeiro Eduardo Gomes',
      fim: '2011', status: 'Concluído', ordem: 1,
    });

    const atividadesExames = [
      'Autorização de atendimentos por convênios, organização de agendas e atendimento ao público presencial e por telefone',
      'Suporte aos exames, auxiliando pacientes e médicos e preenchendo laudos',
      'Procedimentos como colocação de MAPA, Holter e MRPA, garantindo fluxo eficiente e acolhimento no atendimento diagnóstico',
    ];
    await insert(client, 'experiencias', {
      pessoa_id: t, cargo: 'Supervisora administrativa', empresa: 'Clínica Médica Moser', inicio: '08/2025', fim: '05/2026', ordem: 1,
      atividades: [
        'Conferência e faturamento de guias de convênios',
        'Emissão de notas fiscais e organização de agendas médicas',
        'Atendimento por telefone e WhatsApp',
        'Suporte operacional, incluindo a substituição temporária de funcionárias para manter a continuidade dos processos',
      ],
    });
    await insert(client, 'experiencias', {
      pessoa_id: t, cargo: 'Auxiliar de exames / recepcionista', empresa: 'Clínica Médica Moser', inicio: '08/2020', fim: '07/2025', ordem: 2,
      atividades: atividadesExames,
    });
    await insert(client, 'experiencias', {
      pessoa_id: t, cargo: 'Auxiliar de exames / recepcionista', empresa: 'Prevencor Centro de Cardiologia e Diagnósticos',
      inicio: '08/2019', fim: '06/2020', ordem: 3, atividades: atividadesExames,
    });
    await insert(client, 'experiencias', {
      pessoa_id: t, cargo: 'Auxiliar administrativo', empresa: 'Loja Alcacell', inicio: '07/2016', fim: '01/2018', ordem: 4,
      atividades: [
        'Recebimento e conferência de aparelhos celulares',
        'Geração de ordens de serviço e preparação de envios via Sedex, com organização e controle do fluxo logístico',
        'Suporte administrativo geral, mantendo registros atualizados e auxiliando nas demandas operacionais da loja',
      ],
    });

    await insert(client, 'habilidades', { pessoa_id: t, nome: '14 anos de experiência no setor administrativo', categoria: 'Qualificação', ordem: 1 });
    await insert(client, 'habilidades', { pessoa_id: t, nome: 'Pacote Office (nível básico)', categoria: 'Ferramentas', ordem: 2 });
    await insert(client, 'idiomas', { pessoa_id: t, idioma: 'Inglês', nivel: 'Básico', ordem: 1 });

    await client.query('commit');
    console.log('Seed concluído: 2 currículos cadastrados.');
  } catch (e) {
    await client.query('rollback');
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
