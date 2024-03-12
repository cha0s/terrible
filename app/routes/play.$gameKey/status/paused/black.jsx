import {useFetcher} from '@remix-run/react';
import FluidText from '#fluid-text';
import {useGame, useSession} from '#hooks';

import styles from './index.module.css';

function Paused() {
  const fetcher = useFetcher({key: 'bots'});
  const game = useGame();
  const session = useSession();
  return (
    <div className={styles.paused}>
      <div
        className={
          [styles.message, game.owner === session.id && styles.half]
            .filter(Boolean).join(' ')
        }
      >
        <FluidText>
          Paused!
        </FluidText>
      </div>
      {game.owner === session.id && (
        <div className={[styles.message, styles.half].join(' ')}>
          <div className={styles.label}>
            <FluidText>
              You may add some bots to keep the game going!
            </FluidText>
          </div>
          <div className={styles.form}>
            <fetcher.Form method="put">
              <button
                name="action"
                type="submit"
                value="bots"
              >
                add some bots
              </button>
            </fetcher.Form>
          </div>
        </div>

      )}
    </div>
  );
}

Paused.defaultProps = {};

Paused.propTypes = {};

Paused.displayName = 'Paused';

export default Paused;
