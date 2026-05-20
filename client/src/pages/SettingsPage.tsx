import { Form, useActionData, useLoaderData } from 'react-router';
import { ActionBanner, PageHeader } from '@/components/workspace-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createPlaceholderAction,
  requireAuthenticatedLoader,
} from '../session';
import { getSettingsSnapshot } from '@/lib/mock-data';

export async function loader() {
  return requireAuthenticatedLoader(getSettingsSnapshot());
}

export const action = createPlaceholderAction('update-settings');

export default function SettingsPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const actionMessage = actionData
    ? `Recorded ${actionData.intent} with wiki path ${actionData.fields.wikiPath ?? loaderData.workspacePaths.wiki}.`
    : undefined;

  return (
    <main className="space-y-6">
      <PageHeader
        description="Manage profile, workspace paths, auth sessions, and optional integrations without leaving the manuscript workflow."
        eyebrow="Settings"
        title="Workspace Configuration"
      />
      <ActionBanner message={actionMessage} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Profile and paths</CardTitle>
            </CardHeader>
            <CardContent>
              <Form className="space-y-4" method="post">
                <input name="intent" type="hidden" value="update-settings" />
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-foreground">
                      Display name
                    </span>
                    <input
                      className="h-11 w-full rounded-2xl border border-input bg-card px-4"
                      defaultValue={loaderData.profile.displayName}
                      name="displayName"
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-foreground">Email</span>
                    <input
                      className="h-11 w-full rounded-2xl border border-input bg-card px-4"
                      defaultValue={loaderData.profile.email}
                      name="email"
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-foreground">
                      Raw path
                    </span>
                    <input
                      className="h-11 w-full rounded-2xl border border-input bg-card px-4"
                      defaultValue={loaderData.workspacePaths.raw}
                      name="rawPath"
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-foreground">
                      Wiki path
                    </span>
                    <input
                      className="h-11 w-full rounded-2xl border border-input bg-card px-4"
                      defaultValue={loaderData.workspacePaths.wiki}
                      name="wikiPath"
                    />
                  </label>
                </div>
                <Button type="submit">Save settings</Button>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Feature flags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {Object.entries(loaderData.featureFlags).map(
                ([flag, enabled]) => (
                  <div
                    key={flag}
                    className="flex items-center justify-between rounded-2xl bg-secondary/45 px-4 py-3"
                  >
                    <span>{flag}</span>
                    <span>{enabled ? 'enabled' : 'disabled'}</span>
                  </div>
                ),
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Active sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {loaderData.sessions.map((session) => (
                <div
                  key={session.label}
                  className="rounded-2xl bg-secondary/45 px-4 py-3"
                >
                  <p className="font-semibold text-foreground">
                    {session.label}
                  </p>
                  <p>
                    {session.current ? 'Current session' : 'Previous session'}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Obsidian asset workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Set attachment folder path to{' '}
                <code>{loaderData.workspacePaths.assets}</code>.
              </p>
              <p>
                Bind <code>Download attachments for current file</code> to{' '}
                <code>Ctrl+Shift+D</code>.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
