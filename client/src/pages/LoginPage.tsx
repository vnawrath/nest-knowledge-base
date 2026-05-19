import { useActionData, useLoaderData } from 'react-router';
import { loginAction, loginLoader } from '../session';
import { PageScaffold } from './PageScaffold';

export default function LoginPage() {
  const loaderData = useLoaderData<typeof loginLoader>();
  const actionData = useActionData<typeof loginAction>();

  return (
    <PageScaffold
      actionData={actionData}
      fields={[
        { defaultValue: 'analyst@example.com', label: 'Email', name: 'email' },
        {
          defaultValue: 'password',
          label: 'Password',
          name: 'password',
          type: 'password',
        },
        { name: 'intent', type: 'hidden', value: 'sign-in' },
      ]}
      loaderData={loaderData}
      route="/login"
      submitLabel="Sign in"
      summary="Placeholder login route with a route action for sign-in and redirect handling."
      title="Login"
    />
  );
}
