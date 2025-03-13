import { useContext } from 'react';
import { TopBarContext, TopBarContextType } from './context';

export const useTopBar = (): TopBarContextType => {
  const context = useContext(TopBarContext);
  if (context === undefined) {
    throw new Error('useTopBar must be used within a TopBarProvider');
  }
  return context;
}; 