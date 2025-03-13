import { createContext } from 'react';
import { TopBarItem } from './types';

export interface TopBarContextType {
  items: TopBarItem[];
  currentItem: TopBarItem;
  setCurrentItem: (item: TopBarItem) => void;
}

export const TopBarContext = createContext<TopBarContextType | undefined>(undefined); 