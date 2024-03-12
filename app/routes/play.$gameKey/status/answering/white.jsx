import Answers from '#answers';
import FluidText from '#fluid-text';
import {useGame, useSession} from '#hooks';

import styles from './index.module.css';

function Answering() {
  const game = useGame();
  const session = useSession();
  if (game.czar === session.id) {
    return (
      <div className={styles.info}>
        <div className={styles.padded}>
          <div className={styles.answers}>
            <FluidText>
              <span className={styles.name}>You</span>
              {' '}
              <span className={styles.normal}>are the</span>
              {' '}
              terrible
            </FluidText>
          </div>
        </div>
        <div className={styles.title}><FluidText>After the others submit, you will choose the victor.</FluidText></div>
      </div>
    );
  }
  if (game.players[session.id].answer) {
    return (
      <div className={styles.info}>
        <div className={[styles.title, styles.bigger].join(' ')}><FluidText>After the others submit, a victor will be chosen.</FluidText></div>
      </div>
    );
  }
  const count = Math.max(1, game.blackCard.split('_').length - 1);
  return (
    <div className={styles.info}>
      <div className={styles.answers}>
        <Answers
          choices={game.players[session.id].cards}
          count={count}
        />
      </div>
      <div className={styles.title}>
        <FluidText>
          <div>
            <span className={styles.name}>{game.players[game.czar].name}</span>
            {' '}
            <span className={styles.normal}>will decide your fate</span>
          </div>
        </FluidText>
      </div>
    </div>
  );
}

Answering.displayName = 'Answering';

export default Answering;
