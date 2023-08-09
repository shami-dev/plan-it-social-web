import type { LoaderArgs, ActionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { Card } from '~/components/ui/containers';
import { Input } from '~/components/ui/forms';
import { matchesHash } from '~/modules/database/crypto.server';
import { db } from '~/modules/database/db.server';
import { createUserSession, getUserSession } from '~/modules/session/session.server';

export async function action({ request }: ActionArgs) {
  const form = await request.formData();
  const email = form.get('email');
  const password = form.get('password');

  if (!email || !password) {
    return { status: 400, message: 'Missing required fields' };
  }
  const cleanEmail: string = email.toString().toLowerCase().trim();

  const user = await db.user.findUnique({ where: { email: cleanEmail } });

  if (!user) {
    return { status: 400, message: 'Email not in use. Please sign up instead.' };
  }

  const passwordObject = await db.password.findUnique({ where: { userId: user.id } });
  if (!passwordObject) {
    return { status: 400, message: "Credentials don't match. Please try again." };
  }

  if (!matchesHash(password.toString(), passwordObject.hash)) {
    return { status: 400, message: "Credentials don't match. Please try again." };
  }

  const headers = await createUserSession(user.id);

  return redirect('/', { headers });
}

export async function loader({ request }: LoaderArgs) {
  const session = await getUserSession(request);
  if (session) {
    return redirect('/');
  }
  return {};
}

export default function Component() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isPending = navigation.state === 'submitting' || navigation.state === 'loading';
  return (
    <div className="flex w-full items-center justify-center">
      <div className="max-w-[400px] w-full">
        <Card>
          <Form method="post" className="w-full flex flex-col items-center justify-center gap-5">
            <h1 className="text-4xl">Log In</h1>
            <Input name="email" type="email" autoComplete="email" placeholder="Email" label="Email" required />
            <Input name="password" type="password" placeholder="Password" label="Password" required />
            <button type="submit" disabled={isPending}>
              {isPending ? 'Logging in...' : 'Log In'}
            </button>
            {actionData && actionData.message && <p className="text-red-500">{actionData.message}</p>}
            <p>
              New here? <Link to="/signup">Sign up</Link>
            </p>
          </Form>
        </Card>
      </div>
    </div>
  );
}
