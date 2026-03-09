import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { simpleStore } from '../../store/store-simple';

interface ReduxProviderProps {
  children: ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={simpleStore}>
      {children}
    </Provider>
  );
}