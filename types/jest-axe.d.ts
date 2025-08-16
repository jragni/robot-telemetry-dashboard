declare module 'jest-axe' {
  export function axe(element: Element): Promise<any>;
  export function toHaveNoViolations(): any;
}