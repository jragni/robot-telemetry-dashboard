export interface HeaderProps {
  readonly onToggleDrawer?: () => void;
  readonly showHamburger?: boolean;
  readonly theme: 'dark' | 'light';
  readonly onToggleTheme: () => void;
}
