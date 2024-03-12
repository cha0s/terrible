import PropTypes from 'prop-types';

import {useState} from 'react';

import styles from './pack-choice.module.css';

export default function PackChoice(props) {
  const {pack} = props;
  const [checked, setChecked] = useState(pack.default);
  const id = `pack-choice-${pack.id}`;
  return (
    <span className={[styles.pack, styles.checkbox].join(' ')}>
      <input
        aria-label={pack.label}
        checked={checked}
        id={id}
        name="packs"
        onChange={(event) => setChecked(event.target.checked)}
        title={pack.label}
        type="checkbox"
        value={pack.id}
      />
      <label htmlFor={id} title={pack.label}>
        <div className={styles.labelText}>{pack.label}</div>
      </label>
    </span>
  );
}

PackChoice.propTypes = {
  pack: PropTypes.shape({
    default: PropTypes.bool,
    id: PropTypes.number,
    label: PropTypes.string,
  }).isRequired,
};
