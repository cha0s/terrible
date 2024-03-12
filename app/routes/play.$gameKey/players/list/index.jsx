import {
  Form,
  useFetcher,
  useSearchParams,
} from "@remix-run/react";
import {useEffect, useState} from 'react';

import {Presence} from '#state/globals';
import {useGame, useIsHydrated, useSession} from '#hooks';

import styles from './index.module.css';

export function playerJoinedUpdateStyle(index, {name, score}) {
  return `
    <style>
      .${styles.player}:nth-child(${index + 1}) {
        display: inline-block !important;
        order: 10;
      }
      .${styles.player}:nth-child(${index + 1})
      .${styles.name} {
        opacity: 1;
        text-decoration: none;
      }
      .${styles.player}:nth-child(${index + 1})
      .${styles.name}
      .${styles.streaming}:before {
        content: '${name.replaceAll("'", "\\'")}';
      }
      .${styles.player}:nth-child(${index + 1})
      .${styles.score}
      .${styles.number}:before {
        content: '${score}';
      }
    </style>
  `;
}

export function playerNameUpdateStyle(index, name) {
  return `
    <style>
      .${styles.player}:nth-child(${index + 1})
      .${styles.name}
      .${styles.rendered} {
        display:none;
      }
      .${styles.player}:nth-child(${index + 1})
      .${styles.name}
      .${styles.streaming}:before {
        content: '${name.replaceAll("'", "\\'")}';
      }
    </style>
  `;
}

export function playerPresenceUpdateStyle(presence, index) {
  return `
    <style>
      .${styles.player}:nth-child(${index + 1})
      .${styles.name} {
        opacity: ${Presence.ACTIVE === presence ? '1' : '0.3'};
        text-decoration: ${Presence.ACTIVE === presence ? 'none' : 'line-through'};
      }
    </style>
  `;
}

export function playerRemoveUpdateStyle(index) {
  return `
    <style>
      .${styles.player}:nth-child(${index + 1}) {
        display: none !important;
      }
    </style>
  `;
}

export const sortPlayers = (game) => (l, r) => {
  if (+l[0] === game.czar) {
    return -1;
  }
  if (+r[0] === game.czar) {
    return 1;
  }
  if (
    Presence.INACTIVE === l[1].presence
    && Presence.ACTIVE === r[1].presence
  ) {
    return 1;
  }
  if (
    Presence.INACTIVE === r[1].presence
    && Presence.ACTIVE === l[1].presence
  ) {
    return -1;
  }
  return r[1].score - l[1].score;
};

export default function List() {
  const game = useGame();
  const session = useSession();
  const isHydrated = useIsHydrated();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(searchParams.has('edit-name'));
  const fetcher = useFetcher();
  useEffect(() => {
    if ('submitting' === fetcher.state) {
      setIsEditing(false);
    }
  }, [fetcher.state]);
  const players = Object.entries(game.players);
  return (
    <div className={styles['players-list']}>
      {
        players
          .sort(sortPlayers(game))
          .concat(
            isHydrated
              ? []
              : (
                Array.from({length: 9 - players.length})
                  .map((e, i) => [-10 - i, {name: '', score: ''}])
              )
          )
          .map(([id, player]) => {
            const isCzar = game.czar === +id;
            const isOwner = game.owner === +id;
            const isSelf = session.id === +id;
            return (
              <div
                key={+id}
                className={[
                  styles.player,
                  Presence.INACTIVE === player.presence && styles.blurred,
                  '' === player.name && styles.hidden,
                  isCzar && styles.czar,
                  isOwner && styles.owner,
                  isSelf && styles.self,
                ].filter(Boolean).join(' ')}
              >
                {
                  isSelf
                    ? (
                      isEditing
                        ? (
                          <fetcher.Form method="put">
                            <input
                              aria-label="Edit your name"
                              // It's fine; being dumped here should be expected.
                              autoFocus // eslint-disable-line jsx-a11y/no-autofocus
                              type="text"
                              maxLength="24"
                              name="name"
                              onBlur={() => {
                                setIsEditing(false);
                              }}
                              onKeyDown={({key}) => {
                                if ('Escape' === key) {
                                  setIsEditing(false);
                                }
                              }}
                              placeholder={player.name}
                              ref={(input) => input && input.focus()}
                            />
                            {
                              isHydrated
                              ? (
                                <button
                                  className={styles.hydrated}
                                  name="action"
                                  type="submit"
                                  value="rename"
                                >
                                  Confirm
                                </button>
                              )
                              : (
                                <>
                                  <button name="action" type="submit" value="rename">Confirm</button>
                                  <button name="cancel" type="submit">Cancel</button>
                                </>
                              )
                            }
                          </fetcher.Form>
                        )
                        : (
                          <Form
                            onSubmit={(event) => {
                              setIsEditing(true);
                              event.preventDefault();
                            }}
                          >
                            <input name="chat" type="hidden" />
                            <input name="edit-name" type="hidden" />
                            <button className={styles.name} type="submit">
                              {/* Optimism.  */}
                              {fetcher.formData?.get('name') || player.name}
                            </button>
                          </Form>
                        )
                    )
                    : (
                      <span className={styles.name}>
                        <span className={styles.rendered}>{player.name}</span>
                        <span className={styles.streaming}></span>
                      </span>
                    )
                }
                <span className={styles.score}>[{
                  <span className={styles.number}>{player.score}</span>
                }]</span>
              </div>
            );
          })
      }
    </div>
  );
}
