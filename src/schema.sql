create table if not exists pessoas (
  id serial primary key,
  nome text not null,
  titulo text,
  objetivo text,
  cidade text,
  email text,
  telefone text,
  linkedin text,
  github text,
  criado_em timestamptz not null default now()
);

create table if not exists formacoes (
  id serial primary key,
  pessoa_id integer not null references pessoas(id) on delete cascade,
  tipo text not null default 'graduacao',
  curso text not null,
  instituicao text,
  inicio text,
  fim text,
  status text,
  detalhes text,
  ordem integer not null default 0
);

create table if not exists experiencias (
  id serial primary key,
  pessoa_id integer not null references pessoas(id) on delete cascade,
  cargo text not null,
  empresa text,
  inicio text,
  fim text,
  atual boolean not null default false,
  atividades text[] not null default '{}',
  ordem integer not null default 0
);

create table if not exists projetos (
  id serial primary key,
  pessoa_id integer not null references pessoas(id) on delete cascade,
  nome text not null,
  descricao text,
  tecnologias text[] not null default '{}',
  link text,
  ordem integer not null default 0
);

create table if not exists habilidades (
  id serial primary key,
  pessoa_id integer not null references pessoas(id) on delete cascade,
  nome text not null,
  categoria text,
  ordem integer not null default 0
);

create table if not exists idiomas (
  id serial primary key,
  pessoa_id integer not null references pessoas(id) on delete cascade,
  idioma text not null,
  nivel text,
  ordem integer not null default 0
);
