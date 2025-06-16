/**
 * Type definitions for @testing-library/jest-dom
 * Blame Shon Little
 * 2025-06-16
 */

declare namespace jest {
  interface Matchers<R> {
    toBeInTheDocument(): R;
    toBeVisible(): R;
    toBeEmpty(): R;
    toBeDisabled(): R;
    toBeEnabled(): R;
    toBeInvalid(): R;
    toBeRequired(): R;
    toBeValid(): R;
    toContainElement(element: HTMLElement | null): R;
    toContainHTML(htmlText: string): R;
    toHaveAttribute(attr: string, value?: string): R;
    toHaveClass(...classNames: string[]): R;
    toHaveFocus(): R;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toHaveFormValues(expectedValues: Record<string, any>): R;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toHaveStyle(css: string | Record<string, any>): R;
    toHaveTextContent(
      text: string | RegExp,
      options?: { normalizeWhitespace: boolean }
    ): R;
    toHaveValue(value?: string | string[] | number): R;
    toBeChecked(): R;
    toBePartiallyChecked(): R;
    toHaveDescription(text?: string | RegExp): R;
    toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R;
    toHaveErrorMessage(text?: string | RegExp): R;
  }
}

declare module "@testing-library/jest-dom";
