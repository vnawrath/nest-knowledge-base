## App Description

**LLM Wiki** is a web app for building personal and team knowledge bases where an LLM incrementally builds and maintains a persistent wiki instead of re-deriving answers from raw documents on every question. It is intentionally positioned as an alternative to classic RAG-style experiences like NotebookLM or ChatGPT file uploads, where the model repeatedly rediscovers context instead of accumulating it. The product is for people doing long-running knowledge work: personal tracking, research, reading a book chapter-by-chapter, business/team internal knowledge, competitive analysis, due diligence, trip planning, course notes, and hobby deep-dives.

The blueprint should explicitly support the concrete use cases named in the goal: personal goals/health/psychology/self-improvement; research over papers, articles, and reports; chapter-by-chapter book reading with characters, themes, plot threads, and Tolkien Gateway-style interlinked coverage; and internal business knowledge drawn from Slack threads, meeting transcripts, project documents, and customer calls, with optional human review of updates.

The app models the exact three-layer architecture from `goal.md`:

- **Raw sources**: immutable source documents such as articles, papers, images, and data files. The LLM reads them but never modifies them. They remain the source of truth.
- **The wiki**: a directory of LLM-generated markdown files containing summaries, entity pages, concept pages, comparisons, overviews, and synthesis pages. The LLM owns this layer entirely and updates it as knowledge accumulates.
- **The schema**: an editable instruction document that tells the LLM how the wiki is structured and what workflows to follow when ingesting sources, answering questions, and maintaining the wiki. The app should store and edit an `AGENTS.md` schema document, while explicitly supporting teams that prefer a `CLAUDE.md`-style document.

The core value proposition is that the wiki is a persistent, compounding artifact. Cross-references, contradictions, and synthesis are compiled once and kept current instead of being rediscovered through classic RAG on every query. The app should make it easy for a user to work the way the goal describes: the LLM agent on one side, the wiki on the other, with real-time edits and browsing that feel similar to using Obsidian as the IDE, the LLM as the programmer, and the wiki as the codebase.

The product must support the three core operations from the goal:

- **Ingest**: add a new source, review its takeaways with the LLM, write a source summary page, update `index.md`, update relevant entity/concept pages, and append to `log.md`. A single source can touch 10-15 wiki pages. Support both one-at-a-time ingest and batch ingest.
- **Query**: answer questions against the wiki, synthesize with citations, and optionally save the answer back into the wiki as a new page. Supported answer formats are markdown pages first, with room for comparison tables, Marp slide decks, `matplotlib` charts, and canvas-style outputs later.
- **Lint**: run wiki health checks for contradictions, stale claims superseded by newer sources, orphan pages with no inbound links, important concepts lacking their own page, missing cross-references, and data gaps that could be filled with a web search.

The app must preserve the workflow details named in the goal:

- `index.md` is content-oriented, grouped by category such as entities, concepts, and sources, with each page listed with a link, one-line summary, and optional metadata like date and source count.
- `log.md` is chronological and append-only, with headings formatted like `## [2026-04-02] ingest | Article Title` so simple unix tooling such as `grep "^## \[" log.md | tail -5` remains useful.
- The wiki is a git repo of markdown files.
- Markdown pages may use YAML frontmatter for tags, dates, and source counts so Dataview-style queries are possible.
- The source workflow should explicitly mention Obsidian Web Clipper and local image downloading to `raw/assets/`; image-aware ingest should acknowledge the documented `Ctrl+Shift+D` workflow and the fact that images may need to be viewed separately from markdown text.
- The design should make space for graph-style browsing because Obsidian's graph view is highlighted in the goal as a key way to understand the wiki.
- Search should work without embeddings by default via `index.md`, but the architecture should leave room for optional `qmd` integration later for local, on-device hybrid BM25/vector search with LLM re-ranking via CLI or MCP as the wiki grows beyond roughly 100 sources / hundreds of pages.
- Git integration should surface the practical benefits named in the goal: version history, branching, and collaboration on top of markdown files.
- The product framing should acknowledge the Vannevar Bush Memex inspiration: a private, curated knowledge store where the links between documents are as valuable as the documents themselves.

## Server (NestJS)

Use the default stack: a NestJS modular monolith exposing a REST JSON API and also serving the React SPA through Vite middleware mode. This app is primarily authenticated and workspace-oriented, not a public SEO site.

Key modules:

- `AuthModule`: JWT auth, refresh-token rotation, session management, password login, logout, token refresh, rate limiting hooks, and RBAC checks.
- `UsersModule`: user profile, role assignment, personal preferences such as default ingest mode (single-source vs batch), and audit attribution for human-reviewed actions.
- `WorkspaceModule`: workspace-level settings, repository root, paths for `raw/`, `wiki/`, `raw/assets/`, and schema file selection (`AGENTS.md` by default, optional `CLAUDE.md` compatibility).
- `SchemaModule`: read, edit, version, and validate the schema document that instructs the LLM how to maintain the wiki.
- `RawSourcesModule`: register immutable raw sources, upload files, ingest metadata, source typing (article, paper, image, data file, transcript, note, Slack thread, meeting transcript, project document, customer call), attachment handling, checksum tracking, and source-to-page linkage.
- `WikiPagesModule`: manage wiki markdown pages, page metadata/frontmatter, rendered previews, backlinks, outbound links, page categories (`summary`, `entity`, `concept`, `comparison`, `overview`, `synthesis`, `query-answer`), and file path conventions.
- `IndexModule`: build and maintain `index.md` on every ingest or wiki-writing operation, enforce grouped sections such as entities, concepts, and sources, and compute one-line summaries and metadata like date and source count.
- `LogModule`: append-only `log.md` writer for ingest, query, lint, and manual review events using the exact parseable heading format `## [YYYY-MM-DD] operation | Title`.
- `IngestModule`: orchestrate source ingest jobs: read source, produce a summary page, identify affected wiki pages, update 10-15 pages when needed, update `index.md`, append `log.md`, and mark contradictions or superseded claims.
- `QueryModule`: search the wiki, read relevant pages beginning with `index.md`, synthesize answers with citations, and optionally persist answers back into the wiki as new markdown pages.
- `LintModule`: run periodic health checks for contradictions, stale claims, orphan pages, missing pages for heavily-mentioned concepts, missing cross-references, and suggested web-search gaps.
- `SearchModule`: default search over markdown/page metadata without vector infrastructure, but with an adapter boundary for optional future `qmd` CLI or MCP integration.
- `FilesModule`: serve raw file metadata, markdown exports, rendered markdown, image attachments from `raw/assets/`, and git-safe download endpoints.
- `GitModule`: read repository status, recent changes, and commit history metadata so the UI can show that the wiki is just a git repo of markdown files; do not auto-commit.
- `JobsModule`: background execution and status tracking for ingest, query-save, lint, and indexing runs.

Primary REST resources should include `/auth`, `/users`, `/workspace`, `/schema`, `/sources`, `/sources/:id/ingest`, `/wiki/pages`, `/wiki/pages/:slug`, `/index`, `/log`, `/queries`, `/lint`, `/search`, and `/jobs/:id`.

## Frontend (Vite / React Router)

Use the default frontend architecture: a React SPA with React Router in SPA mode, served by the NestJS server through Vite middleware. Server-side rendering is not required because the product is an authenticated workspace tool, not public content.

Primary information architecture: a two-pane knowledge-work layout inspired by the goal's "LLM agent on one side, Obsidian on the other" workflow. Desktop uses a resizable sidebar + main canvas + optional inspector/right rail. Mobile collapses to bottom sheets and stacked tabs.

Routes:

- `Login` at `/login`
  - Loader: auth/session status.
  - Actions: sign in.
  - Errors: invalid credentials, rate-limited, already authenticated.
- `Dashboard` at `/`
  - Loader: workspace summary, recent `log.md` entries, ingest queue, wiki stats, orphan page count, contradiction count, source count, page count.
  - Actions: start ingest, start lint, resume draft query, switch ingest mode.
  - Errors: auth required, workspace not configured, empty state for new repository.
- `Raw Sources` at `/sources`
  - Loader: paginated raw source list, filters by type/status, upload limits, image/source counts.
  - Actions: upload source files, register external source metadata, filter/sort, batch-select for ingest.
  - Errors: auth required, empty source library, unsupported file type.
- `Raw Source Detail` at `/sources/:sourceId`
  - Loader: source metadata, extracted text preview if available, linked wiki pages, prior ingest runs, local attachments from `raw/assets/`.
  - Actions: trigger ingest, mark source as reviewed, rename display title, add notes.
  - Errors: 404 source not found, source file missing on disk, ingest failed.
- `Ingest Review` at `/sources/:sourceId/ingest`
  - Loader: source detail, suggested takeaways, impacted pages, draft summary markdown, contradiction warnings.
  - Actions: approve summary, edit emphasis, confirm affected pages, run ingest, save partial draft.
  - Errors: 404 source not found, no extractable content, LLM/job failure, conflicting concurrent ingest.
- `Batch Ingest` at `/ingest/batch`
  - Loader: selected sources, queue state, current workspace schema rules.
  - Actions: enqueue many sources, adjust batch order, start/cancel batch.
  - Errors: empty selection, job failure, validation error.
- `Wiki Index` at `/wiki`
  - Loader: rendered `index.md`, grouped page catalog, category counts, latest changes.
  - Actions: filter by category, open page, create manual page shell if needed.
  - Errors: auth required, missing `index.md`, empty wiki.
- `Wiki Page` at `/wiki/:slug`
  - Loader: markdown source, rendered HTML, frontmatter, backlinks, outbound links, linked sources, related pages, git history summary.
  - Actions: edit title/frontmatter, open in markdown editor, save manual note, request LLM refresh, delete only if page is user-created and not system-protected.
  - Errors: 404 page not found, broken link target, render failure.
- `Graph View` at `/wiki/graph`
  - Loader: page/link graph, orphan-page list, hub-page list.
  - Actions: filter graph by category, highlight contradictions, open page from graph.
  - Errors: empty wiki, graph too large fallback.
- `Query Workspace` at `/queries`
  - Loader: recent saved queries, starter prompts, relevant stats from `index.md`.
  - Actions: ask a question, choose answer format (markdown, comparison table; future Marp/chart/canvas), save answer into wiki as a new page.
  - Errors: auth required, empty wiki, search failure, no relevant pages found.
- `Saved Query Detail` at `/queries/:queryId`
  - Loader: query prompt, cited pages, rendered answer, linked saved wiki page if persisted.
  - Actions: rerun query, save as wiki page, compare versions.
  - Errors: 404 query not found, cited page deleted.
- `Lint` at `/lint`
  - Loader: last lint run, contradiction findings, stale-claim findings, orphan pages, missing concepts, missing cross-references, suggested web-search gaps.
  - Actions: run lint, dismiss false positives, create follow-up tasks/pages.
  - Errors: auth required, no wiki yet, job failure.
- `Log` at `/log`
  - Loader: parsed `log.md` entries with operation/date/title filters.
  - Actions: filter by operation (`ingest`, `query`, `lint`), open related source/page.
  - Errors: missing `log.md`, parse failure.
- `Schema` at `/schema`
  - Loader: current schema document contents, validation state, last modified metadata.
  - Actions: edit `AGENTS.md`, switch to or import `CLAUDE.md` conventions, restore last saved version.
  - Errors: auth required, schema file missing, validation failure.
- `Search` at `/search`
  - Loader: query string, page matches, source matches, optional `qmd` backend availability.
  - Actions: run search, filter by pages/sources/categories.
  - Errors: empty query, no results, search backend unavailable.
- `Settings` at `/settings`
  - Loader: profile, workspace paths, auth sessions, feature flags for optional `qmd`, Marp, and Dataview-friendly frontmatter defaults.
  - Actions: update profile, rotate password, configure paths, enable integrations.
  - Errors: auth required, invalid path, save failure.

Shared route states:

- 401 redirect to `/login` for protected routes.
- 404 for unknown routes/resources.
- First-run empty states must explain the three-layer model and prompt the user to configure `raw/`, `wiki/`, and the schema document.
- Long-running actions surface job progress for ingest/query/lint runs.

## Database

Use the default database stack: TypeORM with SQLite. SQLite matches the goal's local-first, Obsidian-adjacent, git-repo workflow and keeps the app lightweight for personal use while still supporting a small team setup.

Entities:

- `User`
  - Fields: `id`, `email` (unique), `passwordHash`, `role`, `displayName`, `createdAt`, `updatedAt`, `lastLoginAt`.
  - Constraints: unique `email`; `role` enum limited to `admin` or `user`.
- `Workspace`
  - Fields: `id`, `name`, `repoPath`, `rawSourcesPath`, `wikiPath`, `assetsPath`, `schemaFileName`, `createdAt`, `updatedAt`.
  - Constraints: single active workspace for v1; `schemaFileName` allowed values `AGENTS.md` or `CLAUDE.md`; default paths should support `raw/`, `wiki/`, and `raw/assets/`.
- `RawSource`
  - Fields: `id`, `workspaceId`, `title`, `sourceType`, `filePath`, `checksum`, `mimeType`, `importMethod`, `originalUrl`, `isImmutable`, `status`, `createdAt`, `updatedAt`, `ingestedAt`.
  - Constraints: `isImmutable` always true after creation; unique `filePath` per workspace; unique `checksum` per workspace when available.
  - Relationships: many `RawSource` to one `Workspace`; one `RawSource` to many `AttachmentAsset`; one `RawSource` to many `IngestRun`; many-to-many with `WikiPage` through `WikiPageSource`.
- `AttachmentAsset`
  - Fields: `id`, `rawSourceId`, `filePath`, `mimeType`, `width`, `height`, `createdAt`.
  - Constraints: files live under `raw/assets/` when locally downloaded.
- `WikiPage`
  - Fields: `id`, `workspaceId`, `slug`, `title`, `category`, `filePath`, `summaryLine`, `frontmatterJson`, `markdownBody`, `sourceCount`, `inboundLinkCount`, `outboundLinkCount`, `lastSynthesizedAt`, `createdAt`, `updatedAt`.
  - Constraints: unique `slug` per workspace; unique `filePath` per workspace; `category` enum limited to `summary`, `entity`, `concept`, `comparison`, `overview`, `synthesis`, `query-answer`.
  - Relationships: many `WikiPage` to one `Workspace`; many-to-many self-reference through `WikiPageLink`; many-to-many with `RawSource` through `WikiPageSource`; one `WikiPage` to many `QueryRun` when saved answers create pages.
- `WikiPageLink`
  - Fields: `id`, `fromPageId`, `toPageId`, `linkText`, `isBroken`, `createdAt`.
  - Constraints: unique pair of `fromPageId` + `toPageId` + `linkText`.
- `WikiPageSource`
  - Fields: `id`, `wikiPageId`, `rawSourceId`, `citationNote`, `createdAt`.
  - Constraints: unique pair of `wikiPageId` + `rawSourceId`.
- `SchemaDocument`
  - Fields: `id`, `workspaceId`, `fileName`, `content`, `version`, `createdAt`, `updatedAt`.
  - Constraints: one active schema document per workspace; `fileName` matches the workspace setting.
- `IngestRun`
  - Fields: `id`, `workspaceId`, `rawSourceId`, `status`, `mode`, `summaryPageId`, `pagesTouchedCount`, `startedAt`, `finishedAt`, `errorMessage`.
  - Constraints: `mode` enum `single` or `batch`; `pagesTouchedCount` should capture the common 10-15 page touch pattern when applicable.
- `QueryRun`
  - Fields: `id`, `workspaceId`, `userId`, `prompt`, `answerFormat`, `answerMarkdown`, `savedWikiPageId`, `status`, `startedAt`, `finishedAt`, `errorMessage`.
  - Constraints: `answerFormat` enum `markdown`, `comparison-table`, `marp`, `matplotlib-chart`, `canvas`; v1 UI should expose `markdown` and `comparison-table` first.
- `QueryCitation`
  - Fields: `id`, `queryRunId`, `wikiPageId`, `createdAt`.
  - Constraints: unique pair of `queryRunId` + `wikiPageId`.
- `LintRun`
  - Fields: `id`, `workspaceId`, `status`, `startedAt`, `finishedAt`, `summary`, `errorMessage`.
- `LintFinding`
  - Fields: `id`, `lintRunId`, `findingType`, `severity`, `title`, `details`, `wikiPageId`, `relatedWikiPageId`, `status`, `createdAt`.
  - Constraints: `findingType` enum includes `contradiction`, `stale-claim`, `orphan-page`, `missing-concept-page`, `missing-cross-reference`, `web-search-gap`.
- `LogEntry`
  - Fields: `id`, `workspaceId`, `entryDate`, `operation`, `title`, `markdownBlock`, `relatedRawSourceId`, `relatedWikiPageId`, `relatedQueryRunId`, `relatedLintRunId`, `createdAt`.
  - Constraints: append-only from the application layer; `operation` enum `ingest`, `query`, `lint`, `review`.

The filesystem markdown remains the long-term source of truth for wiki content; SQLite is the operational index for fast UI access, job tracking, auth, and integrity checks.

## Auth

Use the default auth approach because `goal.md` does not specify a different provider: JWT-based auth with short-lived access tokens, refresh-token rotation, httpOnly secure cookies, session revocation, login rate limiting, and stolen-refresh-token detection.

Roles:

- `admin`
  - Permissions: manage workspace paths and schema settings, edit the schema document, upload sources, run ingest/query/lint, review and approve wiki updates, manage users, configure optional integrations such as `qmd`, and change security settings.
- `user`
  - Permissions: browse sources and wiki pages, run queries, save query answers as wiki pages, upload sources, and review lint findings.
  - Restrictions: cannot change auth settings, cannot change workspace root paths, cannot manage other users, cannot replace the schema document without admin approval.

Auth behavior:

- All application routes except `/login` require authentication.
- The app is private-by-default because the knowledge base may contain personal notes, internal team material, customer calls, and due-diligence content.
- Audit trails should record which authenticated user initiated ingest, query-save, lint, schema edits, and manual wiki edits.

## UI & Design

Use the default UI toolkit: Tailwind CSS + shadcn/ui. The goal does not specify a different component system.

Design direction: "scholar's workshop" rather than generic SaaS. The app should feel like a hybrid of an editor, a research desk, and an Obsidian-like knowledge graph browser. The memorable visual idea is that the wiki is a living manuscript compiled from raw material.

Color and materials:

- Background: `#F6F1E8` parchment tone for light mode.
- Primary ink: `#1F1A17`.
- Secondary text: `#5C534B`.
- Panel surface: `#FFFDF9`.
- Accent: `#1D6E6E` for links, active states, and graph highlights.
- Warning/contradiction: `#B4492D`.
- Success/current: `#3F6B3F`.
- Border: `#D8CCBC`.
- Optional dark mode background: `#161412`, surface `#211D1A`, text `#F3EBDD`, accent `#5FB3B3`.

Typography:

- Use a characterful serif for headings and page titles to evoke published knowledge work.
- Use a highly readable sans or text face for body copy and UI chrome.
- Markdown content should feel like a manuscript, while controls remain crisp and modern.

Layout patterns:

- Desktop shell: left navigation for Sources / Wiki / Queries / Lint / Log / Schema, center workspace for markdown or tables, right inspector for backlinks, citations, raw source references, and job status.
- Wiki page layout should prominently show title, one-line summary, frontmatter metadata, backlinks, outbound links, and linked sources.
- Graph View should be a first-class visual mode, not a hidden extra, because the goal explicitly calls out Obsidian's graph view as the best way to see the shape of the wiki.
- Query Workspace should make it obvious that good answers can be filed back into the wiki as pages.
- Ingest Review should compare raw source material, extracted takeaways, and impacted wiki pages side-by-side.

Component patterns:

- Rich markdown renderer with wiki-link styling, citation pills, frontmatter chips (`tags`, `dates`, `source counts`), and inline contradiction/staleness callouts.
- Source cards that clearly distinguish immutable raw sources from editable wiki pages.
- Log timeline cards that visually emphasize the exact parseable heading structure `## [2026-04-02] ingest | Article Title`.
- Search results grouped by pages, sources, and log entries; default search leans on `index.md` before optional advanced backends.
- Lint findings shown as triage cards for contradictions, stale claims, orphan pages, missing concept pages, missing cross-references, and web-search gaps.

Workflow-specific UI notes from the goal:

- The app should explicitly reference Obsidian Web Clipper as a recommended source-ingest path.
- The source detail UI should expose locally downloaded images in `raw/assets/` and explain the documented Obsidian workflow: in Settings -> Files and links, set "Attachment folder path" to `raw/assets/`, then in Settings -> Hotkeys bind "Download attachments for current file" to `Ctrl+Shift+D`.
- Query output options should reserve space for future Marp slide decks and charts, because the goal calls them out as valuable answer forms.
- Query output options should reserve space for future `matplotlib` chart generation in addition to Marp slide decks, because the goal calls them out as valuable answer forms.
- Dataview-friendly frontmatter should be visible and editable so dynamic tables/lists remain possible.

Interaction feel:

- Calm, archival, and deliberate rather than fast-growth SaaS.
- Dense enough for serious research work, but not cluttered.
- Mobile should preserve key tasks (upload, review source, read page, run query), while the full graph and side-by-side ingest workflow are desktop-first.
