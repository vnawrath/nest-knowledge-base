import { useActionData, useLoaderData } from 'react-router';
import { PageScaffold } from './PageScaffold';
import {
  createPlaceholderAction,
  requireAuthenticatedLoader,
} from '../session';

export async function loader() {
  return requireAuthenticatedLoader({
    recentQueries: [],
    route: 'Query Workspace',
    starterPrompts: ['Summarize the current wiki state'],
  });
}

export const action = createPlaceholderAction('ask-question');

export default function QueriesPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <PageScaffold
      actionData={actionData}
      fields={[
        { defaultValue: 'ask-question', label: 'Intent', name: 'intent' },
        {
          defaultValue: 'What changed recently?',
          label: 'Prompt',
          name: 'prompt',
        },
      ]}
      loaderData={loaderData}
      route="/queries"
      submitLabel="Submit query action"
      summary="Query workspace scaffold with starter prompts and save-to-wiki action wiring."
      title="Query Workspace"
    />
  );
}
