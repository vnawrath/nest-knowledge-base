import { Form, useActionData, useLoaderData } from 'react-router';
import {
  ActionBanner,
  MarkdownSheet,
  PageHeader,
} from '@/components/workspace-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createPlaceholderAction,
  requireAuthenticatedLoader,
} from '../session';
import { getSchemaSnapshot } from '@/lib/mock-data';

export async function loader() {
  return requireAuthenticatedLoader(getSchemaSnapshot());
}

export const action = createPlaceholderAction('save-schema');

export default function SchemaPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const actionMessage = actionData
    ? `Prepared ${actionData.intent} for ${loaderData.fileName}.`
    : undefined;

  return (
    <main className="space-y-6">
      <PageHeader
        description="The schema is the editable instruction manual for how the agent ingests, answers, and maintains wiki structure."
        eyebrow="Schema"
        title={loaderData.fileName}
      />
      <ActionBanner message={actionMessage} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <MarkdownSheet markdown={loaderData.content} title="Schema preview" />
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Edit schema document</CardTitle>
            </CardHeader>
            <CardContent>
              <Form className="space-y-4" method="post">
                <input name="intent" type="hidden" value="save-schema" />
                <input
                  name="schemaFile"
                  type="hidden"
                  value={loaderData.fileName}
                />
                <textarea
                  className="min-h-64 w-full rounded-3xl border border-input bg-card p-4 text-sm"
                  defaultValue={loaderData.content}
                  name="content"
                />
                <div className="flex flex-wrap gap-3">
                  <Button type="submit">Save schema</Button>
                  <Button type="submit" variant="outline">
                    Restore previous version
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Validation state</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Status:{' '}
                <span className="font-semibold text-foreground">
                  {loaderData.validationState}
                </span>
              </p>
              <p>
                Last modified:{' '}
                {new Date(loaderData.lastModified).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Convention switching</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                AGENTS.md remains the default. Teams preferring CLAUDE.md can
                import conventions without changing the visual workflow.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
