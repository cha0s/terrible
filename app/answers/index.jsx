import {useFetcher} from '@remix-run/react';
import PropTypes from 'prop-types';

import FluidText from '#fluid-text';
import {useIsHydrated, useSelection} from '#hooks';

import styles from './index.module.css';

function Answers({
  choices,
  className,
  count,
  disabled,
}) {
  const fetcher = useFetcher({key: 'answers'});
  const isHydrated = useIsHydrated();
  const [selection, setSelection] = useSelection();
  return (
    <fetcher.Form
      method={count === selection.length ? 'post' : 'get'}
      className={styles.answers}
    >
      <input name="action" value="answer" type="hidden" />
      {selection.length > 0 && (
        selection.map((answer) => (
          <input key={answer} name="selection" type="hidden" value={answer} />
        ))
      )}
      <div className={styles.buttons}>
        {
          count === selection.length
            ? (
              <div className={styles.submit}>
                <button name="confirm" type="submit">
                  <div className={styles.inside}>
                    <FluidText>
                      Send it
                    </FluidText>
                  </div>
                </button>
                <button
                  name="cancel"
                  onClick={() => {
                    setSelection([]);
                  }}
                  type="submit"
                >
                  <div className={styles.inside}>
                    <FluidText>
                      Nevermind
                    </FluidText>
                  </div>
                </button>
              </div>
            )
            : (
              choices.map((choice, i) => (
                <button
                  className={[
                    className,
                    styles.answer,
                    selection.includes(i) && styles.selected,
                  ].filter(Boolean).join(' ')}
                  disabled={disabled || (!isHydrated && selection.includes(i))}
                  key={i}
                  name="selection"
                  value={i}
                  onClick={(event) => {
                    if (selection.includes(i)) {
                      selection.splice(selection.indexOf(i), 1);
                      setSelection([...selection]);
                    }
                    else {
                      setSelection([...selection, i]);
                    }
                    event.preventDefault();
                  }}
                  type="submit"
                >
                  <div className={styles.top} />
                  <div className={styles.left} />
                  <div className={styles.text}>
                    <FluidText>
                      <div className={styles.choice}>
                        {choice}
                      </div>
                    </FluidText>
                  </div>
                </button>
              ))
            )
        }
      </div>
    </fetcher.Form>
  );
}

Answers.defaultProps = {
  choices: [],
  className: '',
  disabled: false,
};

Answers.propTypes = {
  choices: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ])),
  count: PropTypes.number.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

Answers.displayName = 'Answers';

export default Answers;
