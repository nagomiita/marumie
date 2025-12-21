import type { ComponentProps } from "react";
import { Button as ShadButton } from "@/components/ui/button";

export type ButtonVariant = NonNullable<
  ComponentProps<typeof ShadButton>["variant"]
>;
export type ButtonSize = NonNullable<ComponentProps<typeof ShadButton>["size"]>;

export interface ButtonProps extends ComponentProps<typeof ShadButton> {}

export default function Button(props: ButtonProps) {
  return <ShadButton {...props} />;
}
