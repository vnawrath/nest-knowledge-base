import { useState } from 'react';
import { Form, useActionData, useLoaderData, useLocation } from 'react-router';
import {
  ActionBanner,
  MarkdownSheet,
  PageHeader,
  QueryCard,
} from '@/components/workspace-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  createPlaceholderAction,
  requireAuthenticatedLoader,
} from '../session';
import {
  getStarterPrompts,
  getWorkspaceSummary,
  listQueries,
} from '@/lib/mock-data';

export async function loader() {
  return requireAuthenticatedLoader({
    previewQuery: listQueries()[0],
    recentQueries: listQueries(),
    starterPrompts: getStarterPrompts(),
    stats: getWorkspaceSummary(),
  });
}

export const action = createPlaceholderAction('ask-question');

function hasPromptState(value: unknown): value is { prompt: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'prompt' in value &&
    typeof value.prompt === 'string'
  );
}

export default function QueriesPage() {
  const location = useLocation();
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const promptFromNavigation = hasPromptState(location.state)
    ? location.state.prompt
    : loaderData.starterPrompts[0];
  const [prompt, setPrompt] = useState(promptFromNavigation);
  const [format, setFormat] = useState<'markdown' | 'comparison-table'>(
    'markdown',
  );
  const actionMessage = actionData
    ? `Prepared ${actionData.intent} in ${actionData.fields.format ?? 'markdown'} format.`
    : undefined;

  return (
    <main className="space-y-6">
      <PageHeader
        description="Ask questions against the wiki, then promote strong answers into durable pages with citations."
        eyebrow="Query Workspace"
        title="Answer, Compare, Save"
      />

      <ActionBanner message={actionMessage} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                Compose a workspace query
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form className="space-y-4" method="post">
                <input name="intent" type="hidden" value="ask-question" />
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-foreground">
                    Question
                  </span>
                  <Textarea
                    name="prompt"
                    onChange={(event) => setPrompt(event.target.value)}
                    value={prompt}
                  />
                </label>
                <div className="grid gap-3 md:grid-cols-4">
                  {[
                    'markdown',
                    'comparison-table',
                    'marp',
                    'matplotlib-chart',
                  ].map((option) => (
                    <button
                      key={option}
                      className={`rounded-3xl border px-4 py-4 text-left ${format === option ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground'}`}
                      onClick={() => {
                        if (
                          option === 'markdown' ||
                          option === 'comparison-table'
                        ) {
                          setFormat(option);
                        }
                      }}
                      type="button"
                    >
                      <p className="font-semibold">{option}</p>
                      <p className="mt-1 text-xs">
                        {option === 'markdown' || option === 'comparison-table'
                          ? 'Available now'
                          : 'Reserved for later'}
                      </p>
                    </button>
                  ))}
                </div>
                <input name="format" type="hidden" value={format} />
                <div className="flex flex-wrap gap-3">
                  <Button type="submit">Ask question</Button>
                  <Button type="submit" variant="outline">
                    Save answer into wiki
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>

          <MarkdownSheet
            markdown={loaderData.previewQuery.answerMarkdown}
            title="Preview answer"
          />

          <div className="grid gap-4 lg:grid-cols-2">
            {loaderData.recentQueries.map((query) => (
              <QueryCard key={query.id} query={query} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Starter prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {loaderData.starterPrompts.map((starter) => (
                <button
                  key={starter}
                  className="w-full rounded-2xl bg-secondary/45 px-4 py-3 text-left hover:bg-secondary/70"
                  onClick={() => setPrompt(starter)}
                  type="button"
                >
                  {starter}
                </button>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Workspace context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{loaderData.stats.pageCount} pages available for citation.</p>
              <p>
                {loaderData.stats.sourceCount} immutable raw sources in the
                library.
              </p>
              <p>
                {loaderData.stats.contradictionCount} contradiction requiring
                follow-up before broad publication.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
