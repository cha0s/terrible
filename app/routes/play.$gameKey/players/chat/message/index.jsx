import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';

import styles from './index.module.css';

export default function PlayersChatMessageSpace(props) {
  const {message: {text, timestamp}, isShort, name} = props;
  const dtf = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
  const date = new Date(timestamp);
  return (
    <div
      className={[styles.message, isShort && styles.short].filter(Boolean).join(' ')}
    >
      {
        !isShort && (
          <header>
            <div className={styles.owner}>{name}</div>
            <div className={styles.time}>{dtf.format(date)}</div>
          </header>
        )
      }
      <div className={styles.text}>
        <div className={styles.markdown}>
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
        {isShort && <div className={styles.time}>{dtf.format(date)}</div>}
      </div>
    </div>
  );
}

PlayersChatMessageSpace.propTypes = {
  isShort: PropTypes.bool.isRequired,
  message: PropTypes.shape({
    text: PropTypes.string,
    timestamp: PropTypes.number,
    owner: PropTypes.number,
  }).isRequired,
  name: PropTypes.string,
};
