import * as React from "react"
import { ArrowRight } from "@/registry/icons"
import { Button } from "@/registry/ui/button"
import { TextInput, PasswordInput } from "@/registry/ui/text-input"
import { Checkbox } from "@/registry/ui/checkbox"
import { Link } from "@/registry/ui/link"
import { InlineNotification } from "@/registry/ui/notification"
import { Separator } from "@/registry/ui/separator"

/**
 * LoginBlock, two-step login (identifier first, then password), calm and focused.
 * Step 1 asks only for the email so SSO users can be routed before seeing a password field.
 * Errors never reveal whether the account exists.
 */
export function LoginBlock({ productName, onSubmit, onSso, forgotHref = "#", signupHref }: {
  productName: string
  onSubmit: (email: string, password: string, remember: boolean) => Promise<void> | void
  /** If provided, a "Continue with SSO" path is offered. */
  onSso?: (email: string) => void
  forgotHref?: string
  signupHref?: string
}) {
  const [step, setStep] = React.useState<"id" | "password">("id")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [remember, setRemember] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const emailInvalid = error === "email"

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-title-1">Log in to {productName}</h1>
        {signupHref && (
          <p className="text-body text-muted-foreground">
            Don't have an account? <Link inline href={signupHref}>Create one</Link>
          </p>
        )}
      </div>
      {error && error !== "email" && <InlineNotification kind="error" title="Couldn't log in" subtitle={error} />}
      <form
        noValidate
        className="flex flex-col gap-3"
        onSubmit={async (e) => {
          e.preventDefault()
          setError(null)
          if (step === "id") {
            if (!/^\S+@\S+\.\S+$/.test(email)) return setError("email")
            return setStep("password")
          }
          setLoading(true)
          try {
            await onSubmit(email, password, remember)
          } catch {
            setError("The email or password is incorrect. Check them and try again.")
          } finally {
            setLoading(false)
          }
        }}
      >
        {step === "id" ? (
          <TextInput label="Email" type="email" autoComplete="username" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} invalid={emailInvalid} invalidText="Enter an email address like name@company.com" />
        ) : (
          <>
            <div className="flex items-center justify-between rounded-md bg-layer-1 px-3 py-2 text-body">
              <span className="truncate">{email}</span>
              <button type="button" onClick={() => setStep("id")} className="rounded-sm text-footnote text-link underline decoration-transparent hover:decoration-current focus-ring">Change</button>
            </div>
            <PasswordInput label="Password" autoComplete="current-password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} labelAddon={<Link size="sm" href={forgotHref} className="ml-auto">Forgot password?</Link>} />
          </>
        )}
        <Button type="submit" size="lg" fullWidth icon={ArrowRight} loading={loading}>
          {step === "id" ? "Continue" : "Log in"}
        </Button>
        {step === "id" && <Checkbox label="Remember my email" checked={remember} onCheckedChange={(c) => setRemember(c === true)} />}
      </form>
      {onSso && step === "id" && (
        <>
          <div className="flex items-center gap-3 text-caption text-helper"><Separator className="flex-1" />or<Separator className="flex-1" /></div>
          <Button variant="tertiary" size="lg" fullWidth onClick={() => onSso(email)}>Continue with SSO</Button>
        </>
      )}
    </div>
  )
}
