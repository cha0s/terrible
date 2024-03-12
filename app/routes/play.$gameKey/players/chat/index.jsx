import {useParams} from '@remix-run/react';
import ScrollableFeed from 'react-scrollable-feed';

import {useGame, useIsHydrated} from '#hooks';

import styles from './index.module.css';
import Form from './form';
import PlayersChatMessage from './message';

export default function PlayersChatSpace() {
  const game = useGame();
  const isHydrated = useIsHydrated();
  const {gameKey} = useParams();
  let messageOwner = false;
  return (
    <div className={styles.chat}>
      <ScrollableFeed>
        <div className={styles.stretch} />
        {
          isHydrated
            ? (
              game.messages
                .filter((message) => game.players[message.owner])
                .sort((l, r) => l.timestamp < r.timestamp ? -1 : 1)
                .map((message) => {
                  const $message = (
                    <PlayersChatMessage
                      key={message.key}
                      isShort={messageOwner === message.owner}
                      message={message}
                      name={game.players[message.owner].name}
                    />
                  );
                  messageOwner = message.owner;
                  return $message;
                })
            )
            : (
              <iframe
                className={styles['messages-iframe']}
                src={`/play/${gameKey}/messages`}
                title="Chat messages"
              />
            )
        }
      </ScrollableFeed>
      {
        isHydrated
          ? (
            <Form />
          )
          : (
            <iframe
              className={styles['form-iframe']}
              src={`/play/${gameKey}/chat-form`}
              title="Chat form"
            />
          )
      }
    </div>
  );
}
