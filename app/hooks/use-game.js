import {useContext} from 'react';

import {GameContext} from './context';

export default function useGame() {
  return useContext(GameContext);
}
