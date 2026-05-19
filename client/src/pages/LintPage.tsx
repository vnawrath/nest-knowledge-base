import { useActionData, useLoaderData } from 'react-router';
import { PageScaffold } from './PageScaffold';
import {
  createPlaceholderAction,
  requireAuthenticatedLoader,
} from '../session';

export async function loader() {
  return requireAuthenticatedLoader({
    findings: {
      contradictions: [],
      missingConcepts: [],
      orphanPages: [],
      staleClaims: [],
    },
    route: 'Lint',
  });
}

export const action = createPlaceholderAction('run-lint');

export default function LintPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <PageScaffold
      actionData={actionData}
      fields={[
        { defaultValue: 'run-lint', label: 'Intent', name: 'intent' },
        {
          defaultValue: 'contradiction',
          label: 'Finding type',
          name: 'findingType',
        },
      ]}
      loaderData={loaderData}
      route="/lint"
      submitLabel="Submit lint action"
      summary="Workspace lint scaffold with contradiction, stale-claim, and orphan-page results."
      title="Lint"
    />
  );
}
