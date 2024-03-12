import PropTypes from 'prop-types';
import {useGame} from '#hooks';

import Controls from './controls';
import styles from './index.module.css';
import Timeout from './timeout';

export function unreadUpdateStyle(unread) {
  return `
    <style>
      .${styles.unread}.${styles.hidden} {display: inline !important}
      .${styles.unread} .${styles.rendered} {display: none}
      .${styles.streaming}:before {content: '${unread}'}
      .${styles.chat} svg {
        animation: ${styles['chat-wiggle']} 7s infinite;
      }
      .${styles.chat} svg .${styles.lines} {
        animation: ${styles.fluoresce} 7s infinite;
      }
    </style>
  `;
}

function Bar(props) {
  const game = useGame();
  return (
    <div className={styles['bar-wrapper']}>
      <div
        className={[
          styles.bar,
          props.chatOpenTuple[0] && styles.floating,
        ].filter(Boolean).join(' ')}
      >
        <Timeout timeout={game.timeout} />
        <Controls {...props} />
      </div>
    </div>
  );
}

Bar.propTypes = {
  chatOpenTuple: PropTypes.array,
};

Bar.displayName = 'Bar';

export default Bar;
