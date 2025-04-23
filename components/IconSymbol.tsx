import React from 'react';
import { Feather } from '@expo/vector-icons';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface IconSymbolProps {
  name: FeatherIconName;
  size: number;
  color: string;
}

const IconSymbol: React.FC<IconSymbolProps> = ({ name, size, color }) => {
  return <Feather name={name} size={size} color={color} />;
};

export default IconSymbol; 