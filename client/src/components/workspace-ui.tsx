import type { ReactNode } from 'react';
import { Link } from 'react-router';
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpenText,
  Clock3,
  FileSymlink,
  GitBranch,
  Network,
  ScanSearch,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn, formatRelativeDate, titleCase } from '@/lib/utils';
import type {
  LintFinding,
  LogEntry,
  QueryRecord,
  RawSourceRecord,
  WikiPageRecord,
} from '@/lib/mock-data';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  actions?: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <p className="muted-label">{eyebrow}</p>
        <div className="space-y-2">
          <h1 className="inked-title text-4xl sm:text-5xl">{title}</h1>
          <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
            {description}
          </p>
        </div>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
}: {
  detail: string;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardDescription className="muted-label">{label}</CardDescription>
        <CardTitle className="text-4xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

export function InspectorCard({
  title,
  description,
  children,
}: {
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export function SourceCard({ source }: { source: RawSourceRecord }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-3 border-b border-border/70 bg-secondary/35">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">Immutable raw</Badge>
          <Badge>{titleCase(source.sourceType)}</Badge>
          <Badge variant={source.status === 'ingested' ? 'success' : 'warning'}>
            {source.status}
          </Badge>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="text-3xl">{source.title}</CardTitle>
            <CardDescription>{source.summary}</CardDescription>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to={`/sources/${source.id}`}>
              Open
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 pt-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            {source.notes}
          </p>
          <p className="rounded-2xl border border-border/80 bg-background/80 p-4 text-sm leading-6 text-foreground/80">
            {source.excerpt}
          </p>
        </div>
        <dl className="space-y-3 text-sm">
          <InfoRow label="Imported via" value={source.importMethod} />
          <InfoRow
            label="Created"
            value={formatRelativeDate(source.createdAt)}
          />
          <InfoRow
            label="Linked pages"
            value={`${source.linkedPageSlugs.length} pages touched`}
          />
          <InfoRow
            label="Attachments"
            value={
              source.attachments.length ? source.attachments[0].label : 'None'
            }
          />
        </dl>
      </CardContent>
    </Card>
  );
}

export function WikiPageCard({ page }: { page: WikiPageRecord }) {
  return (
    <Card>
      <CardHeader className="gap-3 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{page.category}</Badge>
          <Badge variant="accent">{page.sourceCount} sources</Badge>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-3xl">{page.title}</CardTitle>
          <CardDescription>{page.summaryLine}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {page.tags.map((tag) => (
            <Badge key={tag} variant="accent">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>{page.backlinks.length} backlinks</span>
          <Button asChild size="sm" variant="outline">
            <Link to={`/wiki/${page.slug}`}>Open page</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function MarkdownSheet({
  markdown,
  title,
}: {
  markdown: string;
  title?: string;
}) {
  const blocks = markdown.split('\n\n');

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/70 bg-secondary/35">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-3xl">
              {title ?? 'Manuscript Preview'}
            </CardTitle>
            <CardDescription>
              Rendered in the app’s manuscript view.
            </CardDescription>
          </div>
          <Badge variant="accent">Markdown</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6 text-[15px] leading-7 text-foreground/90">
        {blocks.map((block, index) => {
          if (block.startsWith('# ')) {
            return (
              <h2 key={`${block}-${index}`} className="inked-title text-4xl">
                {block.replace(/^# /, '')}
              </h2>
            );
          }

          if (block.startsWith('## ')) {
            return (
              <div key={`${block}-${index}`} className="space-y-3">
                <h3 className="inked-title text-2xl">
                  {block.replace(/^## /, '')}
                </h3>
                <Separator />
              </div>
            );
          }

          if (block.startsWith('> ')) {
            return (
              <blockquote
                key={`${block}-${index}`}
                className="rounded-r-3xl border-l-4 border-primary bg-primary/5 px-5 py-4 italic text-primary"
              >
                {renderInline(block.replace(/^> /, ''))}
              </blockquote>
            );
          }

          if (block.startsWith('- ')) {
            return (
              <ul key={`${block}-${index}`} className="space-y-3 pl-5">
                {block.split('\n').map((line) => (
                  <li key={line} className="list-disc text-muted-foreground">
                    <span className="text-foreground/90">
                      {renderInline(line.replace(/^- /, ''))}
                    </span>
                  </li>
                ))}
              </ul>
            );
          }

          if (/^\d+\. /.test(block)) {
            return (
              <ol key={`${block}-${index}`} className="space-y-3 pl-5">
                {block.split('\n').map((line) => (
                  <li key={line} className="list-decimal text-muted-foreground">
                    <span className="text-foreground/90">
                      {renderInline(line.replace(/^\d+\. /, ''))}
                    </span>
                  </li>
                ))}
              </ol>
            );
          }

          return (
            <p
              key={`${block}-${index}`}
              className="text-[15px] leading-7 text-foreground/90"
            >
              {renderInline(block)}
            </p>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function GraphConstellation({
  links,
  nodes,
}: {
  links: { from: string; to: string }[];
  nodes: {
    category: string;
    contradiction: boolean;
    slug: string;
    title: string;
    x: number;
    y: number;
  }[];
}) {
  const nodeMap = new Map(nodes.map((node) => [node.slug, node]));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/70 bg-secondary/35">
        <CardTitle className="flex items-center gap-3 text-3xl">
          <Network className="size-6 text-primary" />
          Graph View
        </CardTitle>
        <CardDescription>
          First-class link topology for understanding the wiki’s shape.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative min-h-[520px] overflow-hidden rounded-b-3xl bg-[radial-gradient(circle_at_top,rgba(29,110,110,0.14),transparent_40%),linear-gradient(180deg,rgba(255,253,249,0.82),rgba(246,241,232,0.96))] p-0">
        <svg className="absolute inset-0 h-full w-full">
          {links.map((link) => {
            const from = nodeMap.get(link.from);
            const to = nodeMap.get(link.to);
            if (!from || !to) {
              return null;
            }

            return (
              <line
                key={`${link.from}-${link.to}`}
                stroke={
                  from.contradiction || to.contradiction
                    ? 'var(--warning)'
                    : 'var(--border)'
                }
                strokeOpacity="0.9"
                strokeWidth="2"
                x1={`${from.x}%`}
                x2={`${to.x}%`}
                y1={`${from.y}%`}
                y2={`${to.y}%`}
              />
            );
          })}
        </svg>
        {nodes.map((node) => (
          <Link
            key={node.slug}
            className={cn(
              'absolute flex w-40 -translate-x-1/2 -translate-y-1/2 flex-col rounded-3xl border bg-card/95 p-4 shadow-[0_14px_40px_rgba(31,26,23,0.1)] transition-transform hover:scale-[1.03]',
              node.contradiction ? 'border-warning/60' : 'border-border',
            )}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            to={`/wiki/${node.slug}`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {node.category}
            </span>
            <span className="mt-2 font-serif text-xl text-foreground">
              {node.title}
            </span>
            {node.contradiction ? (
              <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-warning">
                <AlertTriangle className="size-3.5" />
                Contradiction flagged
              </span>
            ) : null}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

export function LintFindingCard({ finding }: { finding: LintFinding }) {
  const severityVariant: 'default' | 'accent' | 'warning' =
    finding.severity === 'high'
      ? 'warning'
      : finding.severity === 'medium'
        ? 'accent'
        : 'default';

  return (
    <Card>
      <CardHeader className="gap-3 pb-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant={severityVariant}>{finding.severity}</Badge>
          <Badge>{finding.findingType}</Badge>
        </div>
        <CardTitle className="text-2xl">{finding.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          {finding.details}
        </p>
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>Status: {finding.status}</span>
          {finding.wikiPageSlug ? (
            <Link
              className="font-semibold text-primary"
              to={`/wiki/${finding.wikiPageSlug}`}
            >
              Open page
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function LogEntryCard({ entry }: { entry: LogEntry }) {
  return (
    <Card>
      <CardHeader className="gap-2 border-l-4 border-primary/40">
        <p className="font-mono text-xs text-muted-foreground">
          {`## [${entry.entryDate}] ${entry.operation} | ${entry.title}`}
        </p>
        <CardTitle className="text-2xl">{entry.title}</CardTitle>
        <CardDescription>{entry.summary}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>{titleCase(entry.operation)} entry</span>
        <Link className="font-semibold text-primary" to={entry.relatedHref}>
          Open related record
        </Link>
      </CardContent>
    </Card>
  );
}

export function QueryCard({ query }: { query: QueryRecord }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <Badge variant="accent">{query.answerFormat}</Badge>
          <span className="text-xs text-muted-foreground">
            {formatRelativeDate(query.startedAt)}
          </span>
        </div>
        <CardTitle className="text-2xl">{query.prompt}</CardTitle>
        <CardDescription>{query.summary}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>{query.citedPageSlugs.length} cited pages</span>
        <Button asChild size="sm" variant="outline">
          <Link to={`/queries/${query.id}`}>Open answer</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function ActionBanner({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
      {message}
    </div>
  );
}

export function InsightStrip() {
  const items = [
    { icon: BookOpenText, label: 'Manuscript-first wiki pages' },
    { icon: Network, label: 'Graph-native browsing' },
    { icon: ScanSearch, label: 'Query answers that can be saved back' },
    { icon: GitBranch, label: 'Git-friendly markdown workflow' },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="bg-card/85">
          <CardContent className="flex items-center gap-3 p-4">
            <item.icon className="size-5 text-primary" />
            <span className="text-sm text-foreground/85">{item.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TimelineMini({ entries }: { entries: LogEntry[] }) {
  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className="flex gap-3">
          <div className="mt-1 flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Clock3 className="size-4" />
          </div>
          <div className="space-y-1">
            <p className="font-mono text-xs text-muted-foreground">
              {`## [${entry.entryDate}] ${entry.operation} | ${entry.title}`}
            </p>
            <p className="text-sm text-foreground/85">{entry.summary}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PillLinks({
  items,
  to,
}: {
  items: string[];
  to: (value: string) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item}
          className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          to={to(item)}
        >
          <FileSymlink className="mr-2 size-3.5" />
          {item}
        </Link>
      ))}
    </div>
  );
}

export function EmptySearchState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
        <Sparkles className="size-10 text-primary" />
        <p className="inked-title text-3xl">
          Start with a manuscript-friendly query
        </p>
        <p className="max-w-xl text-sm text-muted-foreground">
          Search leans on index.md and explicit page summaries first, leaving
          room for qmd later.
        </p>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-secondary/45 px-4 py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right text-foreground">{value}</dd>
    </div>
  );
}

function renderInline(content: string) {
  const parts = content.split(/(\[\[[^\]]+\]\])/g);

  return parts.map((part, index) => {
    if (part.startsWith('[[') && part.endsWith(']]')) {
      const label = part.slice(2, -2);
      return (
        <span
          key={`${part}-${index}`}
          className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-sm font-semibold text-primary"
        >
          {label}
        </span>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}
