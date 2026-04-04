export interface HeaderProps {
  readonly onToggleDrawer?: () => void;
  readonly onToggleTheme: () => void;
  readonly showHamburger?: boolean;
  readonly theme: 'dark' | 'light';
}
