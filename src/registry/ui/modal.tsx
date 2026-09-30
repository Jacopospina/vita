import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { Close } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Button, ActionBar } from "@/registry/ui/button"
import { Icon } from "@/registry/ui/icon"

/**
 * Modal — interrupts the user for a FOCUSED task or a decision that must be made before continuing.
 * RULE: a modal never has a Cancel/Dismiss button. The × , Escape and (non-danger) click-outside close it.
 * Modality is a last resort. Prefer inline editing, a Popover, or a Side panel when the user benefits from seeing the page.
 *
 * Sizes: xs (confirmations) · sm (short forms/alerts) · md (default forms) · lg (complex content, tables)
 */
export const Modal = DialogPrimitive.Root
export const ModalTrigger = DialogPrimitive.Trigger
export const ModalClose = DialogPrimitive.Close

const sizes = { xs: "max-w-sm", sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" } as const

export interface ModalContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  size?: keyof typeof sizes
  /** Danger modals ignore click-outside and open with focus on × , so a stray Enter never destroys anything. */
  danger?: boolean
}

export function ModalContent({ size = "md", danger, className, children, ...props }: ModalContentProps) {
  const closeRef = React.useRef<HTMLButtonElement>(null)
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay data-[state=open]:animate-enter-fade data-[state=closed]:animate-exit-fade" />
      <DialogPrimitive.Content
        onPointerDownOutside={danger ? (e) => e.preventDefault() : undefined}
        onOpenAutoFocus={danger ? (e) => { e.preventDefault(); closeRef.current?.focus() } : undefined}
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-4rem)] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col",
          "overflow-hidden scope-xl border border-border-subtle bg-raised text-foreground shadow-overlay outline-none",
          "data-[state=open]:animate-enter-dialog data-[state=closed]:animate-exit-dialog",
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close asChild>
          <Button ref={closeRef} variant="ghost" size="md" aria-label="Close" aria-keyshortcuts="Escape" className="absolute top-3 right-3 size-control-md rounded-inner-3 px-0">
            <Icon as={Close} size="md" />
          </Button>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function ModalHeader({ label, title, description, className }: { label?: React.ReactNode; title: React.ReactNode; description?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1 px-6 pt-6 pr-16 pb-4", className)}>
      {label && <p className="text-footnote text-muted-foreground">{label}</p>}
      <DialogPrimitive.Title className="text-title-3 text-foreground">{title}</DialogPrimitive.Title>
      {description ? (
        <DialogPrimitive.Description className="text-body text-muted-foreground">{description}</DialogPrimitive.Description>
      ) : (
        <DialogPrimitive.Description className="sr-only">{typeof title === "string" ? title : "Dialog"}</DialogPrimitive.Description>
      )}
    </div>
  )
}

export function ModalBody({ className, scroll = false, ...props }: React.HTMLAttributes<HTMLDivElement> & { scroll?: boolean }) {
  return <div className={cn("min-h-0 flex-1 px-6 pb-6 text-body", scroll && "overflow-y-auto border-y border-border-subtle pt-4", className)} {...props} />
}

/** ModalFooter — a full-bleed ActionBar. The primary action only (optionally one secondary alternative). Never Cancel. */
export function ModalFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  return <ActionBar {...props} />
}

/**
 * ConfirmModal — the canonical confirmation. Title asks the question, the ONE button repeats the verb.
 *   title="Delete 3 agents?"  confirmLabel="Delete agents"  (never "OK"/"Yes"; no Cancel — × closes)
 */
export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  danger,
  loading,
  children,
}: {
  open?: boolean
  onOpenChange?: (o: boolean) => void
  title: string
  description?: React.ReactNode
  confirmLabel: string
  onConfirm: () => void
  danger?: boolean
  loading?: boolean
  children?: React.ReactNode
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="sm" danger={danger} role="alertdialog">
        <ModalHeader title={title} description={description} />
        {children && <ModalBody>{children}</ModalBody>}
        <ModalFooter>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
