import FluidText from '#fluid-text';

import styles from './index.module.css';

function Paused() {
  return (
    <div className={styles.message}>
      <FluidText>There are not enough active players to continue the game!</FluidText>
    </div>
  );
}

Paused.defaultProps = {};

Paused.propTypes = {};

Paused.displayName = 'Paused';

export default Paused;
