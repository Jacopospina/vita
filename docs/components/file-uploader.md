---
title: File uploader
summary: Attach files by browsing or dropping, with per-file status and errors that explain the fix.
status: stable
import: "import { FileUploader } from \"@/components/corpus/file-uploader\""
use_when:
  - dropzone — uploading is the main task of the view (import, document collection)
  - button — attaching as one field among others in a form
avoid_when:
  - Importing structured data with mapping → a dedicated import flow (pattern), with FileUploader as step 1
related: [form, progress-bar, inline-loading]
---

## Corpus opinions

1. **State limits up front:** accepted types and max size, under the label, before the user tries.
2. **Validate per file,** immediately on add. Show the reason and fix inline on the failing file ("HEIC isn't supported. Export as JPG or PDF and try again."). Other files continue.
3. **Per-file status:** uploading (spinner) → complete (✓) → or error (⚠ + message). Large files show a `ProgressBar`.
4. **Removal** is always possible except mid-upload (cancel instead).
5. **Drop zone copy:** "Browse files or drag and drop here". The browse part is the link-styled word.
6. **Don't auto-submit** the form after upload. Uploading and submitting are separate decisions.
