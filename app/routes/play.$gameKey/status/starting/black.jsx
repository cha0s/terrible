import {useFetcher, useParams} from '@remix-run/react';

import FluidText from '#fluid-text';
import {Presence} from '#state/globals';
import {useGame, useIsHydrated, useSession} from '#hooks';

import styles from './black.module.css';

function Starting() {
  const {gameKey} = useParams();
  const fetcher = useFetcher({key: 'starting'});
  const game = useGame();
  const isHydrated = useIsHydrated();
  const session = useSession();
  const enoughPlayersToStart = 2 < Object.entries(game.players)
    .filter(([, {presence}]) => Presence.INACTIVE !== presence)
    .length;
  const isOwner = session.id === game.owner;
  const ownerName = game.players[game.owner].name;
  return (
    <div className={styles.starting}>
      {
        enoughPlayersToStart
        ? (
          isOwner
            ? (
              <div className={styles['lets-go']}>
                <div className={styles.excuse}>LET&apos;S GO</div>
                <fetcher.Form
                  className={styles.start}
                  method="put"
                >
                  {!isHydrated && (
                    <input name="redirect" type="hidden" />
                  )}
                  <input name="game" type="hidden" value={gameKey} />
                  <button
                    aria-label="Start the game"
                    name="action"
                    type="submit"
                    value="start"
                  >
                    <div className={styles.text}>Start</div>
                  </button>
                </fetcher.Form>
              </div>
            )
            : (
              <FluidText className={styles.waiting}>
                <div>
                  Waiting for
                  {' '}
                  <span className={styles.owner}>{ownerName}</span>
                  {' '}
                  to start!
                </div>
              </FluidText>
            )
        )
        : (
          <div className={styles.excuse}>Go get more players</div>
        )
      }
    </div>
  );
}

Starting.defaultProps = {};

Starting.propTypes = {};

Starting.displayName = 'Starting';

export default Starting;
