export type SourceType =
  | 'article'
  | 'paper'
  | 'transcript'
  | 'slack-thread'
  | 'meeting-transcript'
  | 'image';

export type SourceStatus = 'queued' | 'reviewed' | 'ingested';
export type PageCategory =
  | 'summary'
  | 'entity'
  | 'concept'
  | 'comparison'
  | 'overview'
  | 'synthesis'
  | 'query-answer';

export type RawSourceRecord = {
  id: string;
  title: string;
  sourceType: SourceType;
  status: SourceStatus;
  importMethod: string;
  originalUrl?: string;
  createdAt: string;
  ingestedAt?: string;
  summary: string;
  notes: string;
  excerpt: string;
  attachments: { id: string; label: string; note: string }[];
  linkedPageSlugs: string[];
  priorRuns: {
    id: string;
    startedAt: string;
    status: string;
    pagesTouched: number;
  }[];
};

export type WikiPageRecord = {
  slug: string;
  title: string;
  category: PageCategory;
  summaryLine: string;
  tags: string[];
  sourceCount: number;
  updatedAt: string;
  backlinks: string[];
  outboundLinks: string[];
  linkedSourceIds: string[];
  gitHistory: { commit: string; summary: string; date: string }[];
  markdown: string;
};

export type QueryRecord = {
  id: string;
  prompt: string;
  answerFormat: 'markdown' | 'comparison-table';
  answerMarkdown: string;
  citedPageSlugs: string[];
  savedWikiPageSlug?: string;
  startedAt: string;
  summary: string;
};

export type LintFinding = {
  id: string;
  findingType:
    | 'contradiction'
    | 'stale-claim'
    | 'orphan-page'
    | 'missing-concept-page'
    | 'missing-cross-reference'
    | 'web-search-gap';
  severity: 'high' | 'medium' | 'low';
  title: string;
  details: string;
  wikiPageSlug?: string;
  relatedWikiPageSlug?: string;
  status: 'open' | 'dismissed' | 'reviewed';
};

export type LogEntry = {
  id: string;
  operation: 'ingest' | 'query' | 'lint' | 'review';
  title: string;
  entryDate: string;
  summary: string;
  relatedHref: string;
};

const rawSources: RawSourceRecord[] = [
  {
    attachments: [
      {
        id: 'asset-1',
        label: 'diagram-of-knowledge-loop.png',
        note: 'Downloaded into raw/assets/ after clipping the original article.',
      },
    ],
    createdAt: '2026-04-02T10:00:00.000Z',
    excerpt:
      'The article argues that persistent synthesis beats re-retrieval when questions arrive over months instead of minutes. It highlights the value of manual curation, explicit link graphs, and change logs.',
    id: 'src-memex',
    importMethod: 'Obsidian Web Clipper',
    ingestedAt: '2026-04-02T12:30:00.000Z',
    linkedPageSlugs: ['memex-lineage', 'knowledge-compilers', 'index'],
    notes:
      'Best high-level framing for why the product is not classic RAG. Pull quote on compounding synthesis reused in dashboard hero copy.',
    originalUrl: 'https://example.com/memex-persistent-knowledge',
    priorRuns: [
      {
        id: 'ing-201',
        pagesTouched: 11,
        startedAt: '2026-04-02T12:00:00.000Z',
        status: 'completed',
      },
    ],
    sourceType: 'article',
    status: 'ingested',
    summary:
      'Long-form essay connecting Vannevar Bush, Obsidian, and modern LLM-assisted knowledge maintenance.',
    title: 'Persistent Knowledge Systems After Memex',
  },
  {
    attachments: [],
    createdAt: '2026-04-05T08:45:00.000Z',
    excerpt:
      'The paper compares retrieval-heavy pipelines against systems that update a structured memory layer. The strongest result appears when contradictions are surfaced as first-class objects rather than hidden in embeddings.',
    id: 'src-paper-memory',
    importMethod: 'Local PDF upload',
    ingestedAt: '2026-04-05T11:15:00.000Z',
    linkedPageSlugs: ['memory-layer-design', 'contradiction-playbook'],
    notes:
      'Contains table worth citing in future comparison pages. Dataset section should be revisited when chart generation exists.',
    priorRuns: [
      {
        id: 'ing-204',
        pagesTouched: 14,
        startedAt: '2026-04-05T10:32:00.000Z',
        status: 'completed',
      },
    ],
    sourceType: 'paper',
    status: 'ingested',
    summary:
      'Research paper on structured memory layers for iterative question answering.',
    title: 'Structured Memory Beats Stateless Retrieval',
  },
  {
    attachments: [],
    createdAt: '2026-04-08T14:10:00.000Z',
    excerpt:
      'Slack thread captured decisions about requiring human review for customer-call ingest and preserving audit attribution for every approved page change.',
    id: 'src-slack-review',
    importMethod: 'Slack export',
    linkedPageSlugs: ['review-workflow', 'team-audit-trail'],
    notes:
      'Still queued for ingest because the team wants to merge two related threads first.',
    priorRuns: [],
    sourceType: 'slack-thread',
    status: 'queued',
    summary:
      'Internal discussion on human review gates, audit trails, and admin permissions.',
    title: 'Workspace Review Policy Thread',
  },
  {
    attachments: [
      {
        id: 'asset-2',
        label: 'obsidian-hotkey-card.png',
        note: 'Visual reminder for Settings -> Hotkeys -> Download attachments for current file.',
      },
    ],
    createdAt: '2026-04-10T09:20:00.000Z',
    excerpt:
      'Meeting transcript with implementation notes about raw/assets/, attachment download shortcuts, and why image-aware ingest needs the markdown note and image file reviewed together.',
    id: 'src-meeting-assets',
    importMethod: 'Meeting transcript upload',
    ingestedAt: '2026-04-10T13:05:00.000Z',
    linkedPageSlugs: ['asset-ingest-workflow', 'settings'],
    notes:
      'Useful operational source for onboarding guidance and settings help text.',
    priorRuns: [
      {
        id: 'ing-208',
        pagesTouched: 7,
        startedAt: '2026-04-10T12:30:00.000Z',
        status: 'completed',
      },
    ],
    sourceType: 'meeting-transcript',
    status: 'reviewed',
    summary:
      'Transcript detailing the exact Obsidian attachment workflow and local image handling.',
    title: 'Attachment Workflow Working Session',
  },
];

const wikiPages: WikiPageRecord[] = [
  {
    backlinks: ['knowledge-compilers', 'review-workflow'],
    category: 'overview',
    gitHistory: [
      {
        commit: 'a12bc4d',
        date: '2026-04-10T12:00:00.000Z',
        summary: 'Clarify private knowledge-store framing',
      },
      {
        commit: '9d88ea1',
        date: '2026-04-02T12:35:00.000Z',
        summary: 'Add Memex lineage overview',
      },
    ],
    linkedSourceIds: ['src-memex'],
    markdown: `# Memex Lineage\n\nPersistent knowledge systems matter when the [[wiki]] itself becomes the durable product.\n\n## Why it matters\n- Bush's Memex framed linked notes as a thinking tool.\n- Obsidian normalized file-based knowledge graphs.\n- LLM workflows add synthesis, not just search.\n\n## Current framing\nThe product should feel like a research desk where raw sources stay immutable, the wiki evolves, and the schema tells the agent how to write.`,
    outboundLinks: ['knowledge-compilers', 'graph-literacy'],
    slug: 'memex-lineage',
    sourceCount: 1,
    summaryLine:
      'Historical framing for why linked knowledge stores beat repeated re-discovery.',
    tags: ['history', 'strategy', 'framing'],
    title: 'Memex Lineage',
    updatedAt: '2026-04-10T12:00:00.000Z',
  },
  {
    backlinks: ['query-save-patterns', 'memex-lineage', 'dashboard'],
    category: 'concept',
    gitHistory: [
      {
        commit: 'f21aa91',
        date: '2026-04-11T09:30:00.000Z',
        summary: 'Expand comparison against classic RAG',
      },
    ],
    linkedSourceIds: ['src-memex', 'src-paper-memory'],
    markdown: `# Knowledge Compilers\n\nA knowledge compiler converts raw notes into durable pages that can be cited, linted, and updated.\n\n## Distinguishing trait\nUnlike classic retrieval loops, it promotes recurring syntheses into first-class wiki pages with [[backlinks]] and source counts.\n\n> Best answers should graduate into the wiki instead of disappearing into chat history.`,
    outboundLinks: ['review-workflow', 'query-save-patterns'],
    slug: 'knowledge-compilers',
    sourceCount: 2,
    summaryLine:
      'Core concept page defining the app as a compiler for persistent knowledge.',
    tags: ['core-concept', 'product-language'],
    title: 'Knowledge Compilers',
    updatedAt: '2026-04-11T09:30:00.000Z',
  },
  {
    backlinks: ['knowledge-compilers'],
    category: 'concept',
    gitHistory: [
      {
        commit: 'b43dd72',
        date: '2026-04-05T11:20:00.000Z',
        summary: 'Capture contradiction handling guidance',
      },
    ],
    linkedSourceIds: ['src-paper-memory'],
    markdown: `# Contradiction Playbook\n\nContradictions should be visible objects, not hidden retrieval failures.\n\n## Triage loop\n- Mark the stale claim.\n- Link the superseding page.\n- Record the conflict in [[log.md]].\n\n## Review standard\nHuman reviewers confirm whether the contradiction is genuine or a harmless scope mismatch.`,
    outboundLinks: ['review-workflow', 'team-audit-trail'],
    slug: 'contradiction-playbook',
    sourceCount: 1,
    summaryLine:
      'Rules for surfacing, reviewing, and resolving contradictory wiki claims.',
    tags: ['lint', 'triage', 'quality'],
    title: 'Contradiction Playbook',
    updatedAt: '2026-04-05T11:20:00.000Z',
  },
  {
    backlinks: ['contradiction-playbook', 'knowledge-compilers'],
    category: 'overview',
    gitHistory: [
      {
        commit: 'cc91af2',
        date: '2026-04-08T16:00:00.000Z',
        summary: 'Add admin review and audit notes',
      },
    ],
    linkedSourceIds: ['src-slack-review'],
    markdown: `# Review Workflow\n\nThe safest ingest flow is raw source -> draft summary -> impacted pages -> approval.\n\n## Approval rules\n- Admins can replace schema conventions.\n- Users can review findings and upload sources.\n- Every approved change records who initiated it.\n\n## Notes\nCustomer-call sources require deliberate human review before wiki publication.`,
    outboundLinks: ['team-audit-trail', 'asset-ingest-workflow'],
    slug: 'review-workflow',
    sourceCount: 1,
    summaryLine:
      'Operational flow for approval, audit attribution, and human-reviewed ingest.',
    tags: ['workflow', 'auth', 'review'],
    title: 'Review Workflow',
    updatedAt: '2026-04-08T16:00:00.000Z',
  },
  {
    backlinks: ['review-workflow'],
    category: 'summary',
    gitHistory: [
      {
        commit: 'd8e3b6c',
        date: '2026-04-10T13:15:00.000Z',
        summary: 'Document attachment download sequence',
      },
    ],
    linkedSourceIds: ['src-meeting-assets'],
    markdown: `# Asset Ingest Workflow\n\nImages need the markdown note and the downloaded file reviewed together.\n\n## Obsidian setup\n- Set attachment folder path to \`raw/assets/\`.\n- Bind \`Download attachments for current file\` to \`Ctrl+Shift+D\`.\n\n## Why it matters\nWithout the local files, later wiki pages lose crucial diagrams and screenshots.`,
    outboundLinks: ['settings'],
    slug: 'asset-ingest-workflow',
    sourceCount: 1,
    summaryLine:
      'Practical instructions for keeping raw/assets/ aligned with clipped markdown notes.',
    tags: ['assets', 'obsidian', 'workflow'],
    title: 'Asset Ingest Workflow',
    updatedAt: '2026-04-10T13:15:00.000Z',
  },
  {
    backlinks: ['review-workflow'],
    category: 'entity',
    gitHistory: [
      {
        commit: 'a87fdd4',
        date: '2026-04-09T08:05:00.000Z',
        summary: 'Summarize reviewer attribution rules',
      },
    ],
    linkedSourceIds: ['src-slack-review'],
    markdown: `# Team Audit Trail\n\nAudit trails answer **who changed what, when, and why**.\n\n## Required fields\n- initiating user\n- affected pages\n- source references\n- review disposition\n\nThe audit trail should remain visible from schema edits, ingest approvals, and lint dismissals.`,
    outboundLinks: ['review-workflow'],
    slug: 'team-audit-trail',
    sourceCount: 1,
    summaryLine:
      'Entity page for the review metadata that keeps a private wiki trustworthy.',
    tags: ['governance', 'teams'],
    title: 'Team Audit Trail',
    updatedAt: '2026-04-09T08:05:00.000Z',
  },
  {
    backlinks: ['knowledge-compilers'],
    category: 'query-answer',
    gitHistory: [
      {
        commit: '8b1fa20',
        date: '2026-04-12T07:12:00.000Z',
        summary: 'Save comparison query into wiki',
      },
    ],
    linkedSourceIds: ['src-memex', 'src-paper-memory'],
    markdown: `# Query Save Patterns\n\nSaved answers work best when they graduate from chat into a page with citations.\n\n## Recommended structure\n1. State the question.\n2. Cite the relevant pages.\n3. Save the answer under a stable slug.\n4. Link it back from [[index.md]] and the related concepts.`,
    outboundLinks: ['knowledge-compilers', 'memex-lineage'],
    slug: 'query-save-patterns',
    sourceCount: 2,
    summaryLine:
      'Saved answer template for turning a good query into a durable wiki page.',
    tags: ['queries', 'save-to-wiki'],
    title: 'Query Save Patterns',
    updatedAt: '2026-04-12T07:12:00.000Z',
  },
];

const queries: QueryRecord[] = [
  {
    answerFormat: 'markdown',
    answerMarkdown: `# Why persistent synthesis outlasts classic RAG\n\nPersistent synthesis wins when the same topic returns repeatedly. The wiki captures conclusions, contradictions, and page-to-page links once, then reuses them later.\n\n## Evidence\n- [[Knowledge Compilers]] frames saved answers as pages rather than transient chats.\n- [[Contradiction Playbook]] shows why explicit conflict tracking matters.\n- [[Memex Lineage]] explains the historical value of linked notes.`,
    citedPageSlugs: [
      'knowledge-compilers',
      'contradiction-playbook',
      'memex-lineage',
    ],
    id: 'qry-301',
    prompt: 'Why is the product positioned against classic RAG experiences?',
    savedWikiPageSlug: 'query-save-patterns',
    startedAt: '2026-04-12T07:00:00.000Z',
    summary:
      'Positioning answer comparing persistent synthesis and stateless retrieval.',
  },
  {
    answerFormat: 'comparison-table',
    answerMarkdown: `# Comparison\n\n| Workflow | Strength | Risk |\n| --- | --- | --- |\n| Single-source ingest | Fast review cycle | Narrow context |\n| Batch ingest | Efficient backlog clearing | Concurrent contradictions can stack up |\n| Save query to wiki | Durable synthesis | Needs citation review |`,
    citedPageSlugs: ['review-workflow', 'knowledge-compilers'],
    id: 'qry-302',
    prompt:
      'Compare single-source ingest, batch ingest, and save-to-wiki query flows.',
    startedAt: '2026-04-11T18:10:00.000Z',
    summary:
      'Operational comparison across the product’s three main write workflows.',
  },
];

const lintFindings: LintFinding[] = [
  {
    details:
      'The contradiction playbook says every superseded claim must link the newer page, but Review Workflow still implies manual note-only resolution.',
    findingType: 'contradiction',
    id: 'lint-1',
    relatedWikiPageSlug: 'review-workflow',
    severity: 'high',
    status: 'open',
    title: 'Resolution rule is inconsistent between review pages',
    wikiPageSlug: 'contradiction-playbook',
  },
  {
    details:
      'Memex Lineage still references local-only usage and should mention collaboration once team features become first-class.',
    findingType: 'stale-claim',
    id: 'lint-2',
    severity: 'medium',
    status: 'reviewed',
    title: 'Historical framing undersells team workflows',
    wikiPageSlug: 'memex-lineage',
  },
  {
    details:
      'Team Audit Trail has only one inbound link despite being cited in review decisions.',
    findingType: 'orphan-page',
    id: 'lint-3',
    severity: 'medium',
    status: 'open',
    title: 'Audit page needs more inbound references',
    wikiPageSlug: 'team-audit-trail',
  },
  {
    details:
      'The wiki often mentions graph literacy but no dedicated page exists yet.',
    findingType: 'missing-concept-page',
    id: 'lint-4',
    severity: 'low',
    status: 'open',
    title: 'Create a graph literacy concept page',
  },
  {
    details:
      'Asset Ingest Workflow should link directly to Team Audit Trail when image review requires manual approval.',
    findingType: 'missing-cross-reference',
    id: 'lint-5',
    relatedWikiPageSlug: 'team-audit-trail',
    severity: 'medium',
    status: 'open',
    title: 'Missing audit link from asset workflow',
    wikiPageSlug: 'asset-ingest-workflow',
  },
  {
    details:
      'Search results suggest interest in qmd integration, but no source yet summarizes local hybrid search tradeoffs.',
    findingType: 'web-search-gap',
    id: 'lint-6',
    severity: 'low',
    status: 'open',
    title: 'Research qmd tradeoffs for larger workspaces',
  },
];

const logEntries: LogEntry[] = [
  {
    entryDate: '2026-04-12',
    id: 'log-1',
    operation: 'query',
    relatedHref: '/queries/qry-301',
    summary:
      'Saved the positioning answer back into the wiki as Query Save Patterns.',
    title: 'Why is the product positioned against classic RAG experiences?',
  },
  {
    entryDate: '2026-04-10',
    id: 'log-2',
    operation: 'ingest',
    relatedHref: '/sources/src-meeting-assets',
    summary:
      'Captured the Obsidian attachment workflow and updated two operational pages.',
    title: 'Attachment Workflow Working Session',
  },
  {
    entryDate: '2026-04-08',
    id: 'log-3',
    operation: 'review',
    relatedHref: '/wiki/review-workflow',
    summary:
      'Admin reviewer clarified which roles can replace the schema document.',
    title: 'Review policy language cleanup',
  },
  {
    entryDate: '2026-04-05',
    id: 'log-4',
    operation: 'ingest',
    relatedHref: '/sources/src-paper-memory',
    summary:
      'Published contradiction guidance and linked it into the main concept page.',
    title: 'Structured Memory Beats Stateless Retrieval',
  },
  {
    entryDate: '2026-04-04',
    id: 'log-5',
    operation: 'lint',
    relatedHref: '/lint',
    summary:
      'Found one contradiction, one orphan page, and a missing concept page.',
    title: 'Workspace health sweep',
  },
  {
    entryDate: '2026-04-02',
    id: 'log-6',
    operation: 'ingest',
    relatedHref: '/sources/src-memex',
    summary:
      'Seeded the workspace with historical framing pages and index entries.',
    title: 'Persistent Knowledge Systems After Memex',
  },
];

const graphLayout = [
  { slug: 'memex-lineage', x: 16, y: 22 },
  { slug: 'knowledge-compilers', x: 42, y: 34 },
  { slug: 'contradiction-playbook', x: 68, y: 24 },
  { slug: 'review-workflow', x: 61, y: 58 },
  { slug: 'asset-ingest-workflow', x: 28, y: 68 },
  { slug: 'team-audit-trail', x: 78, y: 72 },
  { slug: 'query-save-patterns', x: 44, y: 78 },
];

export function getWorkspaceSummary() {
  return {
    contradictionCount: lintFindings.filter(
      (finding) =>
        finding.findingType === 'contradiction' && finding.status === 'open',
    ).length,
    currentIngestMode: 'single-source review',
    orphanPageCount: lintFindings.filter(
      (finding) =>
        finding.findingType === 'orphan-page' && finding.status === 'open',
    ).length,
    pageCount: wikiPages.length,
    queuedJobs: [
      {
        id: 'job-91',
        label: 'Slack review thread ingest',
        progress: 0.2,
        status: 'queued',
      },
      {
        id: 'job-92',
        label: 'Weekly lint run',
        progress: 0.72,
        status: 'running',
      },
      {
        id: 'job-93',
        label: 'Search index refresh',
        progress: 1,
        status: 'complete',
      },
    ],
    recentLogEntries: logEntries.slice(0, 4),
    sourceCount: rawSources.length,
    workspaceName: 'North Quay Knowledge Room',
  };
}

export function listSources(filters?: {
  query?: string;
  status?: string;
  type?: string;
}) {
  return rawSources.filter((source) => {
    const matchesQuery = filters?.query
      ? `${source.title} ${source.summary} ${source.notes}`
          .toLowerCase()
          .includes(filters.query.toLowerCase())
      : true;
    const matchesStatus =
      filters?.status && filters.status !== 'all'
        ? source.status === filters.status
        : true;
    const matchesType =
      filters?.type && filters.type !== 'all'
        ? source.sourceType === filters.type
        : true;

    return matchesQuery && matchesStatus && matchesType;
  });
}

export function getSource(sourceId: string) {
  return rawSources.find((source) => source.id === sourceId) ?? null;
}

export function getIngestReview(sourceId: string) {
  const source = getSource(sourceId);
  if (!source) {
    return null;
  }

  return {
    contradictionWarnings: lintFindings.filter(
      (finding) => finding.findingType === 'contradiction',
    ),
    draftSummaryMarkdown: `# ${source.title}\n\n${source.summary}\n\n## Suggested additions\n- Mention why the source matters for long-running knowledge work.\n- Link affected pages into index.md with one-line summaries.\n- Append a parseable entry to log.md once approved.`,
    impactedPages: source.linkedPageSlugs
      .map((slug) => wikiPages.find((page) => page.slug === slug))
      .filter((page): page is WikiPageRecord => Boolean(page)),
    source,
    suggestedTakeaways: [
      'Persistent pages preserve synthesis so the same work is not repeated.',
      'Contradictions should be visible objects with explicit review states.',
      'The ingest flow should update index.md and log.md together.',
    ],
  };
}

export function getBatchIngestSnapshot() {
  return {
    queueState: 'ready',
    schemaRules: [
      'Update index.md with grouped sections and one-line summaries.',
      'Append log.md headings using ## [YYYY-MM-DD] operation | Title.',
      'Prefer adding backlinks over leaving pages isolated.',
    ],
    selectedSources: [rawSources[2], rawSources[3]].filter(
      (source): source is RawSourceRecord => Boolean(source),
    ),
  };
}

export function getWikiIndexSnapshot(category?: string) {
  const pages =
    category && category !== 'all'
      ? wikiPages.filter((page) => page.category === category)
      : wikiPages;

  const grouped = pages.reduce<Record<string, WikiPageRecord[]>>(
    (accumulator, page) => {
      accumulator[page.category] ??= [];
      accumulator[page.category].push(page);
      return accumulator;
    },
    {},
  );

  return {
    grouped,
    latestChanges: wikiPages
      .slice()
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 4),
    renderedIndex: `# index.md\n\n## Concepts\n- [[Knowledge Compilers]] - ${wikiPages[1]?.summaryLine}\n- [[Contradiction Playbook]] - ${wikiPages[2]?.summaryLine}\n\n## Overviews\n- [[Memex Lineage]] - ${wikiPages[0]?.summaryLine}\n- [[Review Workflow]] - ${wikiPages[3]?.summaryLine}\n\n## Operations\n- [[Asset Ingest Workflow]] - ${wikiPages[4]?.summaryLine}`,
  };
}

export function getWikiPage(slug: string) {
  return wikiPages.find((page) => page.slug === slug) ?? null;
}

export function getGraphSnapshot(category?: string) {
  const visiblePages =
    category && category !== 'all'
      ? wikiPages.filter((page) => page.category === category)
      : wikiPages;
  const visibleSlugs = new Set(visiblePages.map((page) => page.slug));

  return {
    hubPages: ['knowledge-compilers', 'review-workflow']
      .map((slug) => getWikiPage(slug))
      .filter((page): page is WikiPageRecord => Boolean(page)),
    links: visiblePages.flatMap((page) =>
      page.outboundLinks
        .filter((target) => visibleSlugs.has(target))
        .map((target) => ({ from: page.slug, to: target })),
    ),
    nodes: graphLayout
      .filter((node) => visibleSlugs.has(node.slug))
      .map((node) => {
        const page = getWikiPage(node.slug);
        if (!page) {
          throw new Error('Missing graph page');
        }

        return {
          ...node,
          category: page.category,
          contradiction: lintFindings.some(
            (finding) =>
              finding.findingType === 'contradiction' &&
              finding.wikiPageSlug === page.slug,
          ),
          title: page.title,
        };
      }),
    orphanPages: lintFindings
      .filter((finding) => finding.findingType === 'orphan-page')
      .map((finding) => getWikiPage(finding.wikiPageSlug ?? ''))
      .filter((page): page is WikiPageRecord => Boolean(page)),
  };
}

export function listQueries() {
  return queries;
}

export function getQuery(queryId: string) {
  return queries.find((query) => query.id === queryId) ?? null;
}

export function getLintSnapshot() {
  return {
    findings: lintFindings,
    lastRun: '2026-04-12T06:48:00.000Z',
    summary:
      'One contradiction still needs editor review. The wiki is otherwise healthy, with a few cross-reference gaps and a pending concept page.',
  };
}

export function getLogSnapshot(operation?: string) {
  return logEntries.filter((entry) =>
    operation && operation !== 'all' ? entry.operation === operation : true,
  );
}

export function getSchemaSnapshot() {
  return {
    content: `# AGENTS.md\n\n## Mission\nTreat the wiki as the durable memory layer for the workspace.\n\n## Ingest workflow\n1. Read the raw source and summarize it.\n2. Update affected pages before writing new pages.\n3. Update index.md with grouped sections and one-line summaries.\n4. Append a log entry in parseable format.\n\n## Query workflow\n- Start with index.md.\n- Prefer existing wiki pages over raw sources when answering.\n- Save strong answers back into the wiki when they add durable structure.\n\n## Review rules\n- Flag contradictions explicitly.\n- Record the initiating user on every approved write action.\n- Keep raw sources immutable.`,
    fileName: 'AGENTS.md',
    lastModified: '2026-04-11T17:20:00.000Z',
    validationState: 'valid',
  };
}

export function searchWorkspace(query: string, scope?: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return { logs: [], pages: [], sources: [] };
  }

  const pages =
    scope && scope !== 'all' && scope !== 'pages'
      ? []
      : wikiPages.filter((page) =>
          `${page.title} ${page.summaryLine} ${page.markdown}`
            .toLowerCase()
            .includes(normalizedQuery),
        );
  const sources =
    scope && scope !== 'all' && scope !== 'sources'
      ? []
      : rawSources.filter((source) =>
          `${source.title} ${source.summary} ${source.notes}`
            .toLowerCase()
            .includes(normalizedQuery),
        );
  const logs =
    scope && scope !== 'all' && scope !== 'logs'
      ? []
      : logEntries.filter((entry) =>
          `${entry.title} ${entry.summary}`
            .toLowerCase()
            .includes(normalizedQuery),
        );

  return { logs, pages, sources };
}

export function getSettingsSnapshot() {
  return {
    featureFlags: {
      dataviewFrontmatter: true,
      marp: false,
      qmd: false,
    },
    profile: {
      defaultIngestMode: 'single',
      displayName: 'Archive Steward',
      email: 'analyst@example.com',
      role: 'admin',
    },
    sessions: [
      {
        current: true,
        createdAt: '2026-04-12T06:30:00.000Z',
        label: 'Chrome on Linux',
      },
      {
        current: false,
        createdAt: '2026-04-10T18:10:00.000Z',
        label: 'Safari on macOS',
      },
    ],
    workspacePaths: {
      assets: 'raw/assets/',
      raw: 'raw/',
      repo: '~/knowledge-room',
      schema: 'AGENTS.md',
      wiki: 'wiki/',
    },
  };
}

export function getStarterPrompts() {
  return [
    'What claims in the wiki are newest and least well-linked?',
    'Compare single-source ingest versus batch ingest for research-heavy work.',
    'Which pages should be created next to strengthen graph coverage?',
  ];
}

export const mockWorkspace = {
  lintFindings,
  logEntries,
  queries,
  rawSources,
  wikiPages,
};
