import {Link, useFetcher} from '@remix-run/react';

import FluidText from '#fluid-text';
import {useGame, useIsHydrated, useSession} from '#hooks';

import styles from './index.module.css';

function Finished() {
  const fetcher = useFetcher({key: 'finished'});
  const game = useGame();
  const isHydrated = useIsHydrated();
  const session = useSession();
  return game.owner === session.id
    ? (
      <fetcher.Form
        className={styles.form}
        method="put"
      >
        {!isHydrated && (
          <input name="redirect" type="hidden" />
        )}
        <button
          aria-label="Restart the game"
          className={styles.start}
          name="action"
          type="submit"
          value="start"
        >
          {/* hi */}
          <FluidText><span className={styles.text}>Restart</span></FluidText>
        </button>
      </fetcher.Form>
    )
    : (
      <div className={styles.message}>
        <div className={styles.first}>
          <FluidText>
            Harass
            {' '}
            <span className={styles.owner}>{game.players[game.owner].name}</span>
            {' '}
            to restart the game
          </FluidText>
        </div>
        <span className={styles.or}>or</span>
        <div className={styles.second}>
          <FluidText>
            <Link className={styles['create-your-own']} to="/create">create a game</Link>
          </FluidText>
        </div>
      </div>
    );
}

Finished.defaultProps = {};

Finished.propTypes = {};

Finished.displayName = 'Finished';

export default Finished;
