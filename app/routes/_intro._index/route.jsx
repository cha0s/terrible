import {Link} from 'react-router-dom';

import styles from './landing.module.css';

export const meta = () => {
  return [{title: 'Welcome | Do Terrible'}];
};

export default function Landing() {
  return (
    <div className={styles.landing}>
      <div className={styles.title}>
        <div className={styles.doSide}>Do</div>
        <div className={styles.terribleSide}>Terrible</div>
      </div>
      <div className={styles.buttons}>
        <Link
          className={styles.createButton}
          to="/create"
        >
          <div>Create a game</div>
        </Link>
        <Link
          className={styles.joinButton}
          to="/join"
        >
          <div>Join a game</div>
        </Link>
      </div>
    </div>
  );
}
