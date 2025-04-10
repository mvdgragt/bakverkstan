// types/index.ts
export interface MenuItem {
  name: string;
  href: string;
}

export interface NavigationProps {
  menuItems: MenuItem[];
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
}
