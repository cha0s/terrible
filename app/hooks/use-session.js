import {useContext} from 'react';

import {SessionContext} from './context';

export default function useSession() {
  return useContext(SessionContext);
}
