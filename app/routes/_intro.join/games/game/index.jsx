import {Link} from '@remix-run/react';
import PropTypes from 'prop-types';

import {State} from '#state/globals';

import styles from './index.module.css';

export default function Game(props) {
  const {game} = props;
  return (
    <Link
      className={styles.game}
      to={`/play/${game.key}`}
    >
      <h2>{game.key}</h2>
      <div className={styles.stats}>
        <span className={styles['player-count']}>
          <span className={styles.number}>{game.playerCount}</span>
          {' '}
          {(() => {
            switch (game.state) {
              case State.STARTING: return 'just starting';
              case State.ANSWERING:
              case State.AWARDING:
              case State.AWARDED:
                return 'playing';
              case State.FINISHED: return 'finished';
              case State.PAUSED: return 'paused';
              default: return '';
            }
          })()}
        </span>
        <span className={styles.spacer}>{' - '}</span>
        <span className={styles.completed}>
          progress: <span className={styles.number}>{game.completed * 100}</span>%
        </span>
      </div>
    </Link>
  );
}

Game.propTypes = {
  game: PropTypes.shape({
    completed: PropTypes.number,
    key: PropTypes.string,
    playerCount: PropTypes.number,
    state: PropTypes.number,
  }).isRequired,
};
