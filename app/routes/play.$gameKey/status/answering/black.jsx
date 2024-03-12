import BlackCardText from '#black-card-text';

import {useSelection} from '#hooks';
import {useGame, useSession} from '#hooks';

function Answering() {
  const [selection] = useSelection();
  const game = useGame();
  const session = useSession();
  return <BlackCardText answers={selection.map((answer) => game.players[session.id].cards[answer])} />;
}

Answering.defaultProps = {};

Answering.propTypes = {};

Answering.displayName = 'Answering';

export default Answering;
