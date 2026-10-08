"use client";
import NextLink from "next/link";
import { usePathname, useRouter as useNextRouter } from "next/navigation";
import type { ComponentProps } from "react";
export default function Link(props: ComponentProps<typeof NextLink>) {
  const path = usePathname();
  const href =
    typeof props.href === "string" &&
    props.href.startsWith("/") &&
    path.startsWith("/demo")
      ? `/demo${props.href}`
      : props.href;
  return <NextLink {...props} href={href} />;
}
export function useRouter() {
  const router = useNextRouter();
  const path = usePathname();
  const target = (href: string) =>
    path.startsWith("/demo") && href.startsWith("/") ? `/demo${href}` : href;
  return {
    ...router,
    push: (href: string, options?: { scroll?: boolean }) =>
      router.push(target(href), options),
    replace: (href: string, options?: { scroll?: boolean }) =>
      router.replace(target(href), options),
  };
}
