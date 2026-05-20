import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../lib/auth-context';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('analyst@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login(email, password);
      await navigate('/');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to sign in right now.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      alternateHref="/register"
      alternateLabel="Register"
      alternatePrompt="Need a workspace account?"
      description="Sign in with the existing JWT and refresh-cookie session managed by the Nest auth backend."
      title="Return to the workshop"
    >
      <form
        className="space-y-4"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-foreground">Email</span>
          <Input
            autoComplete="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-foreground">
            Password
          </span>
          <Input
            autoComplete="current-password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>
        {error ? (
          <p className="rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3 text-sm text-warning">
            {error}
          </p>
        ) : null}
        <Button
          className="w-full"
          disabled={submitting}
          size="lg"
          type="submit"
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </AuthShell>
  );
}
