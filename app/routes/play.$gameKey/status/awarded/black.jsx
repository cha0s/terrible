import BlackCardText from '#black-card-text';
import {useGame} from '#hooks';

function Awarded() {
  const game = useGame();
  return <BlackCardText answers={game.answers[game.winner[0]]} />;
}

Awarded.defaultProps = {};

Awarded.propTypes = {};

Awarded.displayName = 'Awarded';

export default Awarded;
