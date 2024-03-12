import PropTypes from 'prop-types';
import {
  useEffect,
  useState,
} from 'react';

import styles from './index.module.css';
import Number from './number';

function Timeout({timeout}) {
  const [counter, setCounter] = useState(timeout);
  useEffect(() => {
    setCounter(timeout);
  }, [timeout]);
  useEffect(() => {
    let last = Date.now();
    const ms = 77;
    const handle = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - last) / 1000;
      last = now;
      setCounter((counter) => counter - elapsed);
    }, ms);
    return () => {
      clearInterval(handle);
    };
  }, []);
  let formatted;
  if (counter > 10000) {
    formatted = '';
  }
  else if (counter <= 0) {
    formatted = '0';
  }
  else if (counter >= 10) {
    formatted = `${Math.floor(counter)}`;
  }
  else {
    formatted = counter.toFixed(2);
  }
  return (
    <div className={styles.timeout}>
      <Number value={formatted} />
    </div>
  );
}

Timeout.defaultProps = {};

Timeout.propTypes = {
  timeout: PropTypes.number.isRequired,
};

Timeout.displayName = 'Timeout';

export default Timeout;
