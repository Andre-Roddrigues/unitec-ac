"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center p-1 text-muted-foreground group-data-horizontal/tabs:h-10 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col group-data-vertical/tabs:rounded-2xl data-[variant=line]:rounded-none data-[variant=line]:p-0 data-[variant=line]:border-b data-[variant=line]:border-border",
  {
    variants: {
      variant: {
        default: "bg-muted rounded-full",
        line: "gap-6 bg-transparent border-b border-border w-full justify-start",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-all hover:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        "group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:border-b-2 group-data-[variant=line]/tabs-list:border-transparent group-data-[variant=line]/tabs-list:-mb-px",
        "group-data-[variant=line]/tabs-list:data-selected:border-primary group-data-[variant=line]/tabs-list:data-selected:text-primary group-data-[variant=line]/tabs-list:data-selected:font-semibold",
        "group-data-[variant=line]/tabs-list:data-active:border-primary group-data-[variant=line]/tabs-list:data-active:text-primary group-data-[variant=line]/tabs-list:data-active:font-semibold",
        "group-data-[variant=default]/tabs-list:rounded-full group-data-[variant=default]/tabs-list:data-selected:bg-background group-data-[variant=default]/tabs-list:data-selected:text-foreground group-data-[variant=default]/tabs-list:data-selected:shadow-sm",
        // O Base UI 1.6 marca a tab escolhida com `data-active`, nunca com
        // `data-selected` — sem isto a variante default não mostrava qual
        // estava activa (a `line` já tinha o par acima).
        "group-data-[variant=default]/tabs-list:data-active:bg-background group-data-[variant=default]/tabs-list:data-active:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none pt-4", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
