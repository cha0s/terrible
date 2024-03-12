import {
  Form,
  json,
  redirect,
  useLoaderData,
  useSearchParams,
} from '@remix-run/react';

import styles from './index.module.css';
import Games from './games';

export const meta = () => {
  return [{title: 'Join | Do Terrible'}];
};

export async function action({request}) {
  const formData = await request.formData();
  const gameKey = formData.get('gameKey').toUpperCase();
  if (!gameKey.match(/^[A-Z]{4}$/)) {
    throw new Response('', {status: 400});
  }
  const {loadGame} = await import('#state/game.server');
  const game = await loadGame(gameKey);
  if (!game) {
    throw redirect(`/join?nope=${gameKey}`);
  }
  return redirect(`/play/${gameKey}`);
}

export async function loader() {
  const {joinList} = await import('#state/game.server');
  const games = await joinList();
  if (0 === games.length) {
    throw redirect('/create?none');
  }
  return json({games: await joinList()});
}

export default function Join() {
  const {games} = useLoaderData();
  const [searchParams] = useSearchParams();
  return (
    <div className={styles.joinWrapper}>
      <div className={styles.join}>
        <h1>Join a game</h1>
        {searchParams.has('full') && (
          <div className={styles.error}>
            That game is full, try joining another one!
          </div>
        )}
        {searchParams.has('nope') && (
          <div className={styles.error}>
            <code>{searchParams.get('nope')}</code> is not a valid game key
          </div>
        )}
        <Form method="post">
          <label>
            <div>Have a code? Stick it in</div>
            {' '}
            <input
              aria-label="Game code"
              minLength="4"
              maxLength="4"
              name="gameKey"
              pattern="^[a-zA-Z]{4}$"
              placeholder="CODE"
              spellCheck={false}
              size="4"
              title="A four-letter game code."
              type="text"
            />
          </label>
          <button type="submit">Join</button>
        </Form>
        <h2 className={styles.jump}>Or, jump into a game</h2>
        <Games games={games} />
      </div>
    </div>
  );
}
