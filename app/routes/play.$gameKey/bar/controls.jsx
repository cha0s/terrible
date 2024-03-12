import {useBlocker, useFetcher} from '@remix-run/react';
import PropTypes from 'prop-types';
import {useEffect} from 'react';

import {useGame, useIsHydrated} from '#hooks';

import ChatButton from './chat-button';
import MuteButton from './mute-button';
import styles from './index.module.css';

function Controls({
  mutedTuple,
  chatOpenTuple,
  unreadTuple,
}) {
  const fetcher = useFetcher({key: 'bar'});
  const game = useGame();
  const isHydrated = useIsHydrated();
  // UX: allow "back" to close the chat.
  useBlocker(() => {
    if (!game.destroyed && chatOpenTuple[0]) {
      chatOpenTuple[1](false);
      return true;
    }
  });
  useEffect(() => {
    function onBeforeUnload(event) {
      if (chatOpenTuple[0]) {
        chatOpenTuple[1](false);
        event.preventDefault();
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  });
  return (
    <div className={styles.controls}>
      <fetcher.Form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <button
          aria-label={mutedTuple[0] ? 'Unmute the game' : 'Mute the game'}
          className={[
            styles.mute,
            (
              !isHydrated
              || 0 === (window.speechSynthesis?.getVoices().length || 0)
            ) && styles.hidden,
            mutedTuple[0] && styles.muted,
          ].filter(Boolean).join(' ')}
          onClick={() => {
            mutedTuple[1](!mutedTuple[0]);
          }}
          type="button"
        >
          <MuteButton />
        </button>
        <button
          className={[styles.chat, unreadTuple[0] > 0 && styles.unread].filter(Boolean).join(' ')}
          name={chatOpenTuple[0] ? '' : 'chat'}
          onClick={() => {
            chatOpenTuple[1](!chatOpenTuple[0]);
            unreadTuple[1](0);
          }}
          type="submit"
        >
          <ChatButton />
          <span
            className={
              [styles.unread, 0 === unreadTuple[0] && styles.hidden].filter(Boolean).join(' ')
            }
          >
            <span className={styles.rendered}>{unreadTuple[0]}</span>
            <span className={styles.streaming}></span>
          </span>

        </button>
      </fetcher.Form>
    </div>
  );
}

Controls.displayName = 'Controls';

Controls.propTypes = {
  mutedTuple: PropTypes.array,
  chatOpenTuple: PropTypes.array,
  unreadTuple: PropTypes.array,
}

export default Controls;
