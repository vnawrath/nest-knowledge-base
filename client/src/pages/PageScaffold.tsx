import { Form } from 'react-router';
import type { PlaceholderActionData } from '../session';

type Field = {
  defaultValue?: string;
  label?: string;
  name: string;
  type?: 'hidden' | 'password' | 'search' | 'text';
  value?: string;
};

type PageScaffoldProps = {
  actionData?: PlaceholderActionData;
  fields?: Field[];
  loaderData: unknown;
  route: string;
  submitLabel?: string;
  summary: string;
  title: string;
};

export function PageScaffold({
  actionData,
  fields = [],
  loaderData,
  route,
  submitLabel,
  summary,
  title,
}: PageScaffoldProps) {
  return (
    <main>
      <h1>{title}</h1>
      <p>{route}</p>
      <p>{summary}</p>
      {submitLabel ? (
        <Form method="post">
          {fields.map((field) => {
            if (field.type === 'hidden') {
              return (
                <input
                  key={field.name}
                  name={field.name}
                  type="hidden"
                  value={field.value ?? ''}
                />
              );
            }

            return (
              <label key={field.name}>
                <span>{field.label ?? field.name}</span>
                <input
                  defaultValue={field.defaultValue}
                  name={field.name}
                  type={field.type ?? 'text'}
                />
              </label>
            );
          })}
          <button type="submit">{submitLabel}</button>
        </Form>
      ) : null}
      <section>
        <h2>Loader data</h2>
        <pre>{JSON.stringify(loaderData, null, 2)}</pre>
      </section>
      {actionData ? (
        <section>
          <h2>Action result</h2>
          <pre>{JSON.stringify(actionData, null, 2)}</pre>
        </section>
      ) : null}
    </main>
  );
}
