import {useContext} from 'react';

import {SelectionContext} from './context';

export default function useSelection() {
  return useContext(SelectionContext);
}
