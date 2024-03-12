import FluidText from '#fluid-text';
import {useGame} from '#hooks';

import styles from './index.module.css';

function Finished() {
  const game = useGame();
  return (
    <div className={styles.winnerWrapper}>
      <FluidText>
        <span className={styles.winner}>{game.players[game.winner[1]].name}</span>
        {' '}
        won!
      </FluidText>
    </div>
  );
}

Finished.defaultProps = {};

Finished.propTypes = {};

Finished.displayName = 'Finished';

export default Finished;
