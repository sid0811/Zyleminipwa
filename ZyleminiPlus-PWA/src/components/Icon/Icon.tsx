// Web-adapted Icon component using react-icons
import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import * as AntDesignIcons from 'react-icons/ai';
import * as MaterialIcons from 'react-icons/md';
// Note: Material Community Icons are not available as a separate package in react-icons
// We'll use Material Icons (md) as fallback for MaterialCommunityIcons
import * as Ionicons from 'react-icons/io5';
import * as FontAwesome from 'react-icons/fa';
// FontAwesome 5 icons are in 'react-icons/fa', not 'react-icons/fa5'
// FontAwesome 6 icons are in 'react-icons/fa6' if needed
import * as FontAwesome6 from 'react-icons/fa6';
import * as FeatherIcons from 'react-icons/fi';
// Entypo icons are not available in react-icons v5 - using Material Icons as fallback
// EvilIcons are not available in react-icons v5 - using Material Icons as fallback
// Foundation icons use the same 'fi' path as Feather, but with different prefix
import * as OcticonsIcons from 'react-icons/go';
import * as SimpleLineIcons from 'react-icons/sl';

export type Family =
  | 'AntDesign'
  | 'EvilIcons'
  | 'Feather'
  | 'FontAwesome'
  | 'FontAwesome5'
  | 'FontAwesome6'
  | 'Foundation'
  | 'MaterialCommunityIcons'
  | 'MaterialIcons'
  | 'Octicons'
  | 'SimpleLineIcons'
  | 'Ionicons'
  | 'Entypo';

interface IconProps {
  name: string;
  family: Family;
  color?: string;
  size?: number;
  sx?: SxProps<Theme>;
}

const Icon: React.FC<IconProps> = ({ name, family, color = '#000000', size = 20, sx }) => {
  const getIconComponent = () => {
    // Convert icon name to PascalCase for react-icons
    const iconName = name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    let IconComponent: any = null;

    try {
      switch (family) {
        case 'AntDesign':
          IconComponent = (AntDesignIcons as any)[`Ai${iconName}`];
          break;
        case 'MaterialIcons':
          IconComponent = (MaterialIcons as any)[`Md${iconName}`];
          break;
        case 'MaterialCommunityIcons':
          // Material Community Icons not available in react-icons
          // Fallback to Material Icons with 'Md' prefix
          IconComponent = (MaterialIcons as any)[`Md${iconName}`];
          break;
        case 'Ionicons':
          IconComponent = (Ionicons as any)[`Io${iconName}`];
          break;
        case 'FontAwesome':
          IconComponent = (FontAwesome as any)[`Fa${iconName}`];
          break;
        case 'FontAwesome5':
          // FontAwesome 5 icons are in 'react-icons/fa'
          IconComponent = (FontAwesome as any)[`Fa${iconName}`];
          break;
        case 'FontAwesome6':
          // FontAwesome 6 icons are in 'react-icons/fa6'
          IconComponent = (FontAwesome6 as any)[`Fa${iconName}`];
          break;
        case 'Feather':
          IconComponent = (FeatherIcons as any)[`Fi${iconName}`];
          break;
        case 'Entypo':
          // Entypo icons are not available in react-icons v5
          // Fallback to Material Icons
          IconComponent = (MaterialIcons as any)[`Md${iconName}`];
          break;
        case 'EvilIcons':
          // EvilIcons are not available in react-icons v5
          // Fallback to Material Icons
          IconComponent = (MaterialIcons as any)[`Md${iconName}`];
          break;
        case 'Foundation':
          // Foundation icons are not available in react-icons v5
          // Fallback to Material Icons
          IconComponent = (MaterialIcons as any)[`Md${iconName}`];
          break;
        case 'Octicons':
          IconComponent = (OcticonsIcons as any)[`Go${iconName}`];
          break;
        case 'SimpleLineIcons':
          IconComponent = (SimpleLineIcons as any)[`Sl${iconName}`];
          break;
        default:
          IconComponent = (MaterialIcons as any)[`Md${iconName}`];
      }

      if (IconComponent) {
        return <IconComponent color={color} size={size} />;
      }
    } catch (error) {
      console.warn(`Icon not found: ${family}/${name}`, error);
    }

    // Fallback to a default icon
    return <MaterialIcons.MdHelpOutline color={color} size={size} />;
  };

  const iconElement = <span style={{ display: 'inline-flex', alignItems: 'center' }}>{getIconComponent()}</span>;
  
  if (sx) {
    return <Box sx={sx}>{iconElement}</Box>;
  }
  
  return iconElement;
};

export default Icon;

