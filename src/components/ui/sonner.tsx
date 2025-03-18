import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import "./sonner.css"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        closeButton: true,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:pr-10",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "group-[.toast]:absolute group-[.toast]:right-2 group-[.toast]:top-2 group-[.toast]:p-1.5 group-[.toast]:rounded-md group-[.toast]:text-foreground/50 group-[.toast]:opacity-100 group-[.toast]:transition-opacity group-[.toast]:hover:text-foreground group-[.toast]:focus:outline-none group-[.toast]:focus:ring-2 group-[.toast]:focus:ring-ring",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
