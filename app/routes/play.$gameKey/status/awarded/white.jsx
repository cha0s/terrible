import {useGame} from '#hooks';

import FluidText from '#fluid-text';

import styles from './index.module.css';

function Awarded() {
  const game = useGame();
  return (
    <div className={styles.awarded}>
      <FluidText>
        <span className={styles.winner}>{game.players[game.winner[1]].name}</span>
        {' '}
        won!
      </FluidText>
    </div>
  );
}

Awarded.defaultProps = {};

Awarded.propTypes = {};

Awarded.displayName = 'Awarded';

export default Awarded;
