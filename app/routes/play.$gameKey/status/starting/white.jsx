import {Link, useParams} from '@remix-run/react';

import FluidText from '#fluid-text';
import styles from './white.module.css';

function Starting() {
  const {gameKey} = useParams();
  return (
    <div className={styles.info}>
      <div className={styles.description}>Share the code</div>
      <Link
        className={styles.destination}
        to={`/play/${gameKey}`}
      >
        <span className={styles['game-key']}>{gameKey}</span>
      </Link>
    </div>
  );
}

Starting.defaultProps = {};

Starting.propTypes = {};

Starting.displayName = 'Starting';

export default Starting;
