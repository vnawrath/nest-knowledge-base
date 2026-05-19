import { useActionData, useLoaderData } from 'react-router';
import { PageScaffold } from './PageScaffold';
import {
  createPlaceholderAction,
  requireAuthenticatedLoader,
} from '../session';

export async function loader() {
  return requireAuthenticatedLoader({
    featureFlags: {
      dataviewFrontmatter: true,
      marp: false,
      qmd: false,
    },
    profile: { email: 'analyst@example.com' },
    route: 'Settings',
    workspacePaths: {
      raw: 'raw/',
      schema: 'AGENTS.md',
      wiki: 'wiki/',
    },
  });
}

export const action = createPlaceholderAction('update-settings');

export default function SettingsPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <PageScaffold
      actionData={actionData}
      fields={[
        { defaultValue: 'update-settings', label: 'Intent', name: 'intent' },
        { defaultValue: 'wiki/', label: 'Wiki path', name: 'wikiPath' },
      ]}
      loaderData={loaderData}
      route="/settings"
      submitLabel="Submit settings action"
      summary="Profile, workspace paths, auth sessions, and feature-flag configuration scaffold."
      title="Settings"
    />
  );
}
