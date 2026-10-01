---
title: Login
summary: Two-step, calm, secure login, identifier first, then password or SSO. Errors never leak whether an account exists.
status: stable
import: "import { LoginBlock } from \"@/components/vita/blocks/login\""
use_when:
  - Any sign-in screen
avoid_when:
  - Custom login layouts per product → use LoginBlock and theme it
related: [forms, text-input, notification]
---

## Flow

1. **Email** → Continue. (SSO users are routed here by domain, or via "Continue with SSO".)
2. **Password.** The email shows as a summary with "Change". "Forgot password?" sits next to the password label.
3. **Log in** → loading → redirect to where the user was going.

## Rules

1. **Layout:** a single centred column (`max-w-sm`) on `background`. A brand panel is optional on lg screens. Nothing else competes.
2. **Title:** "Log in to {Product}". Use "Log in"/"Log out", never "Sign in" mixed with "Log out" (taxonomy).
3. **Password manager friendly:** `autocomplete="username"` and `current-password`, no paste blocking, and a show/hide toggle.
4. **Errors:**
   - Generic: "The email or password is incorrect."
   - Never "No account with this email".
   - Rate limiting says when to retry.
5. **"Remember my email"** is on by default. The session length is decided by security policy, not by a checkbox label that promises more.
6. **Full-width `lg` buttons** here, and only here among product pages.
