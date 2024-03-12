import PropTypes from 'prop-types';
import {useEffect, useRef} from 'react';

import styles from './index.module.css';

function FluidText({children}) {
  const ref = useRef();
  useEffect(() => {
    const {current} = ref;
    if (!current) {
      return;
    }
    function resize() {
      const started = Date.now();
      current.style.opacity = 0;
      const {parentNode} = current;
      const doesContain = () => (
        current.clientWidth <= parentNode.clientWidth
        && current.clientHeight <= parentNode.clientHeight
      );
      let fontSizeInPx = 1;
      const setFontSize = () => {
        current.style.fontSize = `${fontSizeInPx}px`;
      };
      setFontSize();
      while (doesContain() && (Date.now() - started) < 500) {
        fontSizeInPx += 16;
        setFontSize();
      }
      fontSizeInPx -= 16;
      setFontSize();
      while (doesContain() && (Date.now() - started) < 500) {
        fontSizeInPx += 1;
        setFontSize();
      }
      fontSizeInPx -= 1;
      setFontSize();
      current.style.opacity = 1;
    }
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
}, [children, ref])
  return (
    <div className={styles.fluidText}>
      <div className={styles.resize} ref={ref}>
        {children}
      </div>
    </div>
  )
}

FluidText.propTypes = {
  children: PropTypes.node,
};

export default FluidText;

