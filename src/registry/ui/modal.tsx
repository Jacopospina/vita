import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { Close } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Button, ButtonSet } from "@/registry/ui/button"
import { Icon } from "@/registry/ui/icon"

/**
 * Modal — interrupts the user for a FOCUSED task or a decision that must be made before continuing.
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
  /** Danger modals cannot be dismissed by clicking the scrim — the user must choose explicitly. */
  danger?: boolean
  /** Hide the × button (only for modals with an explicit Cancel). */
  hideClose?: boolean
}

export function ModalContent({ size = "md", danger, hideClose, className, children, ...props }: ModalContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay data-[state=open]:animate-enter-fade data-[state=closed]:animate-exit-fade" />
      <DialogPrimitive.Content
        onPointerDownOutside={danger ? (e) => e.preventDefault() : undefined}
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-4rem)] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col",
          "overflow-hidden rounded-xl border border-border-subtle bg-raised text-foreground shadow-overlay outline-none",
          "data-[state=open]:animate-enter-scale data-[state=closed]:animate-exit-scale",
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" size="md" aria-label="Close" className="absolute top-3 right-3 size-control-md px-0">
              <Icon as={Close} size="md" />
            </Button>
          </DialogPrimitive.Close>
        )}
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

/** ModalFooter — Cancel (secondary) left of the primary. Max 2 buttons, 3 only for "Back · Cancel · Next". */
export function ModalFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <ButtonSet className={cn("border-t border-border-subtle bg-layer-1 px-6 py-4", className)} {...props} />
}

/**
 * ConfirmModal — the canonical transactional/danger confirmation. Title asks the question, primary button repeats the verb.
 *   title="Delete 3 projects?"  confirmLabel="Delete projects"  (never "OK"/"Yes")
 */
export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
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
  cancelLabel?: string
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
          <ModalClose asChild>
            <Button variant="secondary">{cancelLabel}</Button>
          </ModalClose>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} loading={loading} autoFocus={!danger}>
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
