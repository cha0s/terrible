import PropTypes from 'prop-types';

import styles from './number.module.css';

export function numberUpdateStyle(c, m) {
  return `
    <style>
      .${styles.rendered} {display:none}
      .${styles.characteristic} .${styles.streamed}:before {
        content: '${Math.floor(c)}';
      }
      ${
        m
          ? `
            .${styles.mantissa} .${styles.streamed}:before {
              content: '.${m.slice(0, 2)}';
            }
          `
          : ''
      }
    </style>
  `;
}

export default function Number(props) {
  const {value} = props;
  const [c, m] = value.split('.');
  return (
    <div className={styles.number}>
      <span className={styles.characteristic}>
        <span className={styles.rendered}>{c}</span>
        <span className={styles.streamed}></span>
      </span>
      <span className={styles.mantissa}>
        <span className={styles.rendered}>
          {
            m && (
              <>.{m.slice(0, 2)}</>
            )
          }
        </span>
        <span className={styles.streamed}></span>
      </span>
    </div>
  );
}

Number.propTypes = {
  value: PropTypes.string.isRequired,
};
