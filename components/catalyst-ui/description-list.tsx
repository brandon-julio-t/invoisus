import clsx from "clsx";

export function DescriptionList({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"dl">) {
  return (
    <dl
      {...props}
      className={clsx(
        className,
        "grid grid-cols-1 text-sm/6 sm:grid-cols-[min(50%,--spacing(80))_auto]",
      )}
    />
  );
}

export function DescriptionTerm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"dt">) {
  return (
    <dt
      {...props}
      className={clsx(
        className,
        "border-border text-muted-foreground col-start-1 border-t pt-3 first:border-none sm:border-t sm:py-3",
      )}
    />
  );
}

export function DescriptionDetails({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"dd">) {
  return (
    <dd
      {...props}
      className={clsx(
        className,
        "text-foreground pt-1 pb-3 sm:border-t sm:py-3 sm:nth-2:border-none",
      )}
    />
  );
}
