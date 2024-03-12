import {Outlet} from 'react-router-dom';

import '../../fonts/index.css';
import styles from './intro.module.css';

export default function Intro() {
  return (
    <div className={styles.introWrapper}>
      <div className={styles.intro}>
        <Outlet />
      </div>
    </div>
  );
}
