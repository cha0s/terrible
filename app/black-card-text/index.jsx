import PropTypes from 'prop-types';

import FluidText from '#fluid-text';
import {useGame} from '#hooks';

import styles from './index.module.css';

const capitalize = (string) => string.slice(0, 1).toUpperCase() + string.slice(1);

function BlackCardText(props) {
  const {answers} = props;
  const game = useGame();
  const parts = game.blackCard.split('_');
  const blanksCount = parts.length - 1;
  const decoratedText = parts.reduce((r, part, i) => (
    <>
      {r}
      {
        0 === i
          ? ''
          : (
            <span
              className={[
                styles.answer,
                !answers[i - 1] && styles.blank,
              ].filter(Boolean).join(' ')}
            >
              {
                // Capitalize the first letter if the blank is the first letter.
                (
                  (
                    (
                      1 === i
                      && '_'.charCodeAt(0) === game.blackCard.charCodeAt(0)
                    )
                    || '. ' === parts[i - 1]
                  )
                    ? capitalize
                    : (_) => _
                )(answers[i - 1] || '_____')
              }
            </span>
          )
      }
      {part}
    </>
  ), '');
  return (
    <div className={styles['black-card-text']}>
      <FluidText>
        {
          0 === blanksCount
            ? (
              <>
                {game.blackCard}
                <div className="footer">
                  <span
                    className={[
                      styles.answer,
                      !answers[0] && styles.blank,
                    ].filter(Boolean).join(' ')}
                  >
                    {answers[0] ? `${capitalize(answers[0])}` : '_____'}
                  </span>
                  .
                </div>
              </>
            )
            : decoratedText
        }
      </FluidText>
    </div>
  );
}

BlackCardText.defaultProps = {
  answers: [],
  style: {},
};

BlackCardText.propTypes = {
  answers: PropTypes.arrayOf(PropTypes.string),
  style: PropTypes.shape({}),
};

export default BlackCardText;
