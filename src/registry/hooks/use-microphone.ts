import * as React from "react"

/**
 * useMicrophone: the person's microphone, ready for voice UI. One hook for the device list, permission, mute and
 * the live sound (a smoothed level and frequency bands) that LiveWaveform, MicSelector and Sofia read every frame.
 *
 *   const mic = useMicrophone()
 *   <Button onClick={mic.start}>Start</Button>
 *   <LiveWaveform active={mic.status === "live"} getBands={mic.bands} />
 *
 * Nothing is requested until `start()`: the browser asks for permission only when the person chooses to talk.
 * Reading is pull-based (`level()`, `bands(n)`) so drawing stays in each component's own animation frame.
 */
export type MicStatus = "idle" | "requesting" | "live" | "denied" | "unavailable"

export interface Microphone {
  status: MicStatus
  devices: MediaDeviceInfo[]
  deviceId: string | undefined
  setDeviceId: (id: string) => void
  muted: boolean
  setMuted: (m: boolean) => void
  start: () => Promise<void>
  stop: () => void
  /** Loudness now, 0 to 1 (smoothed; 0 while muted). */
  level: () => number
  /** `n` frequency bands now, each 0 to 1, low to high (zeros while muted). */
  bands: (n: number) => Float32Array
}

export function useMicrophone(): Microphone {
  const [status, setStatus] = React.useState<MicStatus>("idle")
  const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([])
  const [deviceId, setDeviceIdState] = React.useState<string>()
  const [muted, setMutedState] = React.useState(false)
  const graph = React.useRef<{ stream: MediaStream; ctx: AudioContext; analyser: AnalyserNode; time: Float32Array<ArrayBuffer>; freq: Uint8Array<ArrayBuffer> } | null>(null)
  const smooth = React.useRef(0)
  const mutedRef = React.useRef(false)

  const refreshDevices = React.useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return
    const all = await navigator.mediaDevices.enumerateDevices()
    setDevices(all.filter((d) => d.kind === "audioinput" && d.deviceId))
  }, [])

  React.useEffect(() => {
    const md = navigator.mediaDevices
    if (!md?.enumerateDevices) return
    const load = () => md.enumerateDevices().then((all) => setDevices(all.filter((d) => d.kind === "audioinput" && d.deviceId)))
    void load()
    md.addEventListener?.("devicechange", load)
    return () => md.removeEventListener?.("devicechange", load)
  }, [])

  const stop = React.useCallback(() => {
    const g = graph.current
    graph.current = null
    g?.stream.getTracks().forEach((t) => t.stop())
    void g?.ctx.close()
    smooth.current = 0
    setStatus((s) => (s === "live" || s === "requesting" ? "idle" : s))
  }, [])

  const open = React.useCallback(async (id: string | undefined) => {
    if (!navigator.mediaDevices?.getUserMedia) return setStatus("unavailable")
    setStatus("requesting")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: id ? { deviceId: { exact: id } } : true })
      graph.current?.stream.getTracks().forEach((t) => t.stop())
      void graph.current?.ctx.close()
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.6
      ctx.createMediaStreamSource(stream).connect(analyser)
      graph.current = { stream, ctx, analyser, time: new Float32Array(analyser.fftSize), freq: new Uint8Array(analyser.frequencyBinCount) }
      stream.getAudioTracks().forEach((t) => (t.enabled = !mutedRef.current))
      setStatus("live")
      setDeviceIdState(stream.getAudioTracks()[0]?.getSettings().deviceId ?? id)
      void refreshDevices() // labels appear once permission is granted
    } catch (e) {
      setStatus((e as DOMException)?.name === "NotAllowedError" ? "denied" : "unavailable")
    }
  }, [refreshDevices])

  React.useEffect(() => stop, [stop])

  const setDeviceId = React.useCallback((id: string) => {
    setDeviceIdState(id)
    if (graph.current) void open(id) // switching device while live re-opens on the new one
  }, [open])

  const setMuted = React.useCallback((m: boolean) => {
    mutedRef.current = m
    setMutedState(m)
    graph.current?.stream.getAudioTracks().forEach((t) => (t.enabled = !m))
  }, [])

  const level = React.useCallback(() => {
    const g = graph.current
    if (!g || mutedRef.current) return (smooth.current *= 0.85)
    g.analyser.getFloatTimeDomainData(g.time)
    let sum = 0
    for (let i = 0; i < g.time.length; i++) sum += g.time[i] * g.time[i]
    // Speech RMS sits around 0.02 to 0.2: map it to 0 to 1 on a soft curve, then ease toward it.
    const target = Math.min(1, Math.sqrt(Math.sqrt(sum / g.time.length)) * 1.6)
    smooth.current += (target - smooth.current) * (target > smooth.current ? 0.5 : 0.15)
    return smooth.current
  }, [])

  const bands = React.useCallback((n: number) => {
    const out = new Float32Array(n)
    const g = graph.current
    if (!g || mutedRef.current) return out
    g.analyser.getByteFrequencyData(g.freq)
    // Voice lives roughly between 80 Hz and 4 kHz: spread the bands over that range on a log scale.
    const nyquist = g.ctx.sampleRate / 2
    const bins = g.freq.length
    for (let i = 0; i < n; i++) {
      const f0 = 80 * Math.pow(4000 / 80, i / n), f1 = 80 * Math.pow(4000 / 80, (i + 1) / n)
      const b0 = Math.floor((f0 / nyquist) * bins), b1 = Math.max(b0 + 1, Math.floor((f1 / nyquist) * bins))
      let m = 0
      for (let b = b0; b < b1 && b < bins; b++) m = Math.max(m, g.freq[b])
      out[i] = Math.min(1, Math.pow(m / 255, 1.4) * 1.2)
    }
    return out
  }, [])

  return { status, devices, deviceId, setDeviceId, muted, setMuted, start: () => open(deviceId), stop, level, bands }
}

/**
 * A believable voice when there is no microphone (demos, previews, an agent's voice without an audio stream):
 * syllables of 120 to 300 ms grouped into phrases with short pauses, as a level from 0 to 1 at time `t` (seconds).
 */
export function simulatedVoice(t: number, seed = 0): number {
  const phrase = Math.sin(t * 0.9 + seed) * 0.5 + 0.5 // phrases swell and fade
  const pause = Math.max(0, Math.sin(t * 0.55 + seed * 2.3)) > 0.08 ? 1 : 0.15
  const syl = Math.abs(Math.sin(t * 7.3 + seed)) * 0.6 + Math.abs(Math.sin(t * 11.1 + seed * 1.7)) * 0.4
  return Math.min(1, (0.25 + 0.75 * phrase) * syl * pause)
}

/** Simulated voice as frequency bands: the level shaped like a voice spectrum (strong lows, falling highs). */
export function simulatedBands(t: number, n: number, seed = 0): Float32Array {
  const out = new Float32Array(n)
  const lvl = simulatedVoice(t, seed)
  for (let i = 0; i < n; i++) {
    const x = i / Math.max(1, n - 1)
    const shape = Math.exp(-((x - 0.28) ** 2) / 0.09) * 0.9 + 0.25 * Math.exp(-((x - 0.7) ** 2) / 0.05)
    const jitter = 0.75 + 0.25 * Math.sin(t * (9 + i * 1.3) + i * 2.1)
    out[i] = Math.min(1, lvl * shape * jitter * 1.3)
  }
  return out
}
