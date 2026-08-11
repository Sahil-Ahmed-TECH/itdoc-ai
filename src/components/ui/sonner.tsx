import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:!bg-card group-[.toaster]:!text-card-foreground group-[.toaster]:!border-border group-[.toaster]:shadow-lg",
          title: "group-[.toast]:!text-card-foreground",
          description: "group-[.toast]:!text-muted-foreground",
          success:
            "group-[.toast]:!bg-card group-[.toast]:!text-card-foreground group-[.toast]:!border-success/30",
          error:
            "group-[.toast]:!bg-card group-[.toast]:!text-card-foreground group-[.toast]:!border-destructive/30",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
