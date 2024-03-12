import Answers from '#answers';
import FluidText from '#fluid-text';
import {useGame, useSession} from '#hooks';

import styles from './index.module.css';

function Awarding() {
  const game = useGame();
  const session = useSession();
  const czarName = game.players[game.czar].name;
  const isCzar = game.czar === session.id;
  let key = 0;
  const choices = game.answers
    .map((answer) => (
      <>
        {answer.reduce(
          (r, text) => [
            ...r,
            ...(r.length > 0 ? [<span className={styles.separator} key={key++}> / </span>] : []),
            <span key={key++}>{text}</span>,
          ],
          [],
        )}
      </>
    ));
  return (
    <>
      <div className={styles.answers}>
        <Answers
          choices={choices}
          count={1}
          className={isCzar ? '' : styles.noselect}
          disabled={!isCzar}
        />
      </div>
      <div className={styles.title}>
        <FluidText>
          {
            isCzar
              ? (
                <div>
                  Choose
                  {' '}
                  <span className={styles.normal}>the</span>
                  {' '}
                  <span className={styles.name}>victor</span>
                </div>
              )
              : (
                <div>
                  <span className={styles.name}>{czarName}</span>
                  {' '}
                  <span className={styles.normal}>is choosing the</span>
                  {' '}
                  victor
                </div>
              )
          }
        </FluidText>
      </div>
    </>
  );
}

Awarding.displayName = 'Awarding';

export default Awarding;
