import { Microphone as MicIcon, MicrophoneOff } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import type { Microphone } from "@/registry/hooks/use-microphone"
import { Dropdown } from "@/registry/ui/dropdown"
import { IconButton, Button } from "@/registry/ui/button"
import { LiveWaveform } from "@/registry/ui/live-waveform"

/**
 * MicSelector: choose which microphone to talk through, hear that it works, and mute it. The device list, a live
 * level preview of the chosen input, and a mute toggle, all driven by one `useMicrophone()`.
 *
 *   const mic = useMicrophone()
 *   <MicSelector mic={mic} />
 *
 * Before permission there are no device names: the selector offers to allow the microphone instead of listing
 * blanks. Choosing a device while live switches to it at once.
 * Not for: choosing any other value → Dropdown; the whole voice call → ConversationBar (which can hold this).
 */
export interface MicSelectorProps {
  mic: Microphone
  /** Hide the live preview (e.g. when a waveform is already visible nearby). */
  hidePreview?: boolean
  size?: "sm" | "md"
  className?: string
}

export function MicSelector({ mic, hidePreview, size = "md", className }: MicSelectorProps) {
  const named = mic.devices.filter((d) => d.label)
  const items = named.length
    ? named.map((d, i) => ({ value: d.deviceId, label: d.label.replace(/\s*\([0-9a-f]{4}:[0-9a-f]{4}\)$/i, ""), meta: i === 0 ? "Default" : undefined }))
    : [{ value: "default", label: "Default microphone" }]
  const helper =
    mic.status === "denied" ? "Microphone access is blocked. Allow it in your browser's site settings."
    : mic.status === "unavailable" ? "No microphone found."
    : mic.muted ? "Muted. Nobody can hear you."
    : mic.status === "live" ? undefined
    : "Allow the microphone to see your devices and test it."
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-start gap-2">
        <Dropdown
          className="min-w-0 flex-1"
          size={size}
          label="Microphone"
          items={items}
          value={named.length ? mic.deviceId ?? named[0].deviceId : "default"}
          onValueChange={(v) => v !== "default" && mic.setDeviceId(v)}
          helperText={mic.status === "denied" ? undefined : helper}
          warn={mic.status === "denied"}
          warnText={mic.status === "denied" ? helper : undefined}
        />
        {mic.status === "live" ? (
          <IconButton
            icon={mic.muted ? MicrophoneOff : MicIcon}
            label={mic.muted ? "Unmute microphone" : "Mute microphone"}
            pressed={mic.muted}
            size={size}
            variant="secondary"
            className={cn("aspect-square w-auto", size === "sm" ? "h-field-sm" : "h-field-md")}
            onClick={() => mic.setMuted(!mic.muted)}
          />
        ) : (
          <Button size={size} variant="secondary" icon={MicIcon} className={cn("shrink-0", size === "sm" ? "h-field-sm" : "h-field-md")} disabled={mic.status === "requesting" || mic.status === "unavailable"} onClick={() => void mic.start()}>
            {mic.status === "requesting" ? "Asking…" : "Allow"}
          </Button>
        )}
      </div>
      {!hidePreview && (
        <LiveWaveform
          size="sm"
          tone={mic.muted ? "current" : "brand"}
          active={mic.status === "live" && !mic.muted}
          getBands={mic.status === "live" ? mic.bands : undefined}
          getLevel={mic.status === "live" ? mic.level : () => 0}
          label="Microphone level"
          className={cn("rounded-inner-2 bg-layer-2 transition-opacity", mic.status !== "live" && "opacity-60")}
        />
      )}
    </div>
  )
}
