import { useActionData, useLoaderData } from 'react-router';
import { PageScaffold } from './PageScaffold';
import {
  assertPlaceholderRecord,
  createPlaceholderAction,
  requireAuthenticatedLoader,
} from '../session';

export async function loader({ params }: { params: { slug?: string } }) {
  const slug = assertPlaceholderRecord(params.slug, 'Wiki page');
  return requireAuthenticatedLoader({
    backlinks: [],
    frontmatter: { tags: [], sourceCount: 0 },
    gitHistory: [],
    route: 'Wiki Page',
    slug,
  });
}

export const action = createPlaceholderAction('request-llm-refresh');

export default function WikiPageDetail() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <PageScaffold
      actionData={actionData}
      fields={[
        {
          defaultValue: 'request-llm-refresh',
          label: 'Intent',
          name: 'intent',
        },
        { defaultValue: 'Manual note title', label: 'Title', name: 'title' },
      ]}
      loaderData={loaderData}
      route="/wiki/:slug"
      submitLabel="Submit wiki page action"
      summary="Markdown source, render output, links, citations, and git history scaffold."
      title="Wiki Page"
    />
  );
}
