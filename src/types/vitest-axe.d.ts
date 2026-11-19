import "vitest";
import type { AxeResults } from "axe-core";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}

declare module "vitest-axe/matchers" {
  export const toHaveNoViolations: (results: AxeResults) => {
    pass: boolean;
    message: () => string;
  };
}
