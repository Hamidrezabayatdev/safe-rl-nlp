declare module "react-katex" {
  import type { ComponentType, ReactNode } from "react";

  interface KatexProps {
    math?: string;
    children?: string;
    errorColor?: string;
    renderError?: (error: Error) => ReactNode;
    settings?: Record<string, unknown>;
    as?: string;
  }

  export const InlineMath: ComponentType<KatexProps>;
  export const BlockMath: ComponentType<KatexProps>;
}
