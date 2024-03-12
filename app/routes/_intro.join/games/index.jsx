import PropTypes from 'prop-types';

import Game from './game';
import styles from './index.module.css';

export default function Games({games}) {
  return (
    <div className={styles.games}>
      {games.map((game) => <Game key={game.key} game={game} />)}
    </div>
  );
}

Games.propTypes = {
  games: PropTypes.arrayOf(Game.propTypes.game),
};
