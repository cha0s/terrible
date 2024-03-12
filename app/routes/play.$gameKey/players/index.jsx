import PropTypes from 'prop-types';

import PlayersChatSpace from './chat';
import List from './list';
import styles from './index.module.css';

function PlayersSpace({isOpen}) {
  return (
    <div
      className={[
        styles['players-space-container'],
        isOpen && styles.opened,
      ].filter(Boolean).join(' ')}
    >
      <div className={styles['players-space']}>
        <div className={styles['players-list']}>
          <List />
        </div>
        <PlayersChatSpace />
      </div>
    </div>
  );
}

PlayersSpace.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

export default PlayersSpace;
