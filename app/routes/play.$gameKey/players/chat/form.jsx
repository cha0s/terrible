import {useState} from 'react';
import {useFetcher, useParams} from '@remix-run/react';

import {useGame, useIsHydrated, useSession} from '#hooks';

import styles from './index.module.css';

export default function Form() {
  const {gameKey} = useParams();
  const game = useGame();
  const isHydrated = useIsHydrated();
  const session = useSession();
  const [text, setText] = useState('');
  const fetcher = useFetcher();
  return (
    <fetcher.Form
      action={`/play/${gameKey}`}
      className={styles.form}
      method="post"
      onSubmit={(event) => {
        const formData = new FormData(event.target);
        const key = formData.get('key');
        game.messages.push({
          key,
          owner: session.id,
          text: formData.get('text'),
          timestamp: Date.now(),
        });
        setText('');
      }}
    >
      <input
        aria-label="Write a chat message"
        autoComplete="off"
        // Doesn't work in iframe..?
        autoFocus // eslint-disable-line jsx-a11y/no-autofocus
        name="message"
        type="text"
        maxLength="1024"
        onChange={(event) => {
          setText(event.target.value);
        }}
        tabIndex={0}
        value={text}
      />
      {!isHydrated && (
        <input name="chat" type="hidden" />
      )}
      <input name="key" type="hidden" value={Math.random()} />
      <input className={styles.hidden} name="action" type="submit" value="message" />
    </fetcher.Form>
  );
}