import BlackCardText from '#black-card-text';
import {useGame, useSelection} from '#hooks';

function Awarding() {
  const [selection] = useSelection();
  const game = useGame();
  return <BlackCardText answers={game.answers[selection[0]]} />;
}

Awarding.defaultProps = {};

Awarding.propTypes = {};

Awarding.displayName = 'Awarding';

export default Awarding;
