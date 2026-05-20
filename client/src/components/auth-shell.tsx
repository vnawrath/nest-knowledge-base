import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { BookOpenText, LibraryBig, Network, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function AuthShell({
  alternateHref,
  alternateLabel,
  alternatePrompt,
  children,
  description,
  title,
}: {
  alternateHref: string;
  alternateLabel: string;
  alternatePrompt: string;
  children: ReactNode;
  description: string;
  title: string;
}) {
  const features = [
    {
      icon: LibraryBig,
      text: 'Turn raw sources into a durable wiki instead of repeating retrieval work.',
    },
    {
      icon: Network,
      text: 'See the shape of knowledge through backlinks, graph view, and cross-references.',
    },
    {
      icon: ScrollText,
      text: 'Keep index.md, log.md, and schema instructions visible as first-class artifacts.',
    },
  ];

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="paper-panel relative overflow-hidden bg-[linear-gradient(145deg,rgba(29,110,110,0.12),transparent_35%),linear-gradient(180deg,rgba(255,253,249,0.96),rgba(241,232,216,0.94))] p-8 sm:p-10 lg:p-12">
          <div className="absolute inset-y-0 right-0 hidden w-px bg-[linear-gradient(180deg,transparent,rgba(92,83,75,0.2),transparent)] lg:block" />
          <div className="flex h-full flex-col justify-between gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card/80 px-4 py-2 text-sm text-muted-foreground">
                <BookOpenText className="size-4 text-primary" />
                LLM Wiki
              </div>
              <div className="space-y-4">
                <p className="muted-label">Scholar&apos;s Workshop</p>
                <h1 className="inked-title max-w-xl text-5xl leading-none sm:text-6xl">
                  A living manuscript for long-running knowledge work.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                  Raw sources stay immutable. The wiki accumulates synthesis.
                  The schema tells the agent how to think.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {features.map((feature) => (
                <div
                  key={feature.text}
                  className="rounded-3xl border border-border/70 bg-card/80 p-5"
                >
                  <feature.icon className="mb-3 size-5 text-primary" />
                  <p className="text-sm leading-6 text-foreground/80">
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <Card className="w-full max-w-xl bg-card/95">
            <CardHeader className="space-y-4">
              <div className="space-y-2">
                <p className="muted-label">Private Workspace Access</p>
                <CardTitle className="text-4xl">{title}</CardTitle>
                <CardDescription className="text-base leading-7">
                  {description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {children}
              <div className="flex items-center justify-between rounded-3xl border border-border/70 bg-secondary/45 p-4 text-sm text-muted-foreground">
                <span>{alternatePrompt}</span>
                <Button asChild size="sm" variant="outline">
                  <Link to={alternateHref}>{alternateLabel}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
