/**
 * orb-gl, Sofia's liquid on the GPU, at full device resolution.
 *
 * The desktop look comes from an SVG filter chain over crisp drops: blur → threshold → blur → threshold (the goo),
 * a specular light on a softened copy, and a wide pastel glow behind. On phones that chain re-rasterises on the CPU
 * every frame. Here ONE fragment shader evaluates the same chain analytically per pixel:
 *
 *   · each drop's blurred disk is a closed form (a Gaussian-blurred disk ≈ its peak × a normal CDF of the distance
 *     to its rim); blurring is linear, so separate drops simply ADD, that sum is what grows the gooey bridges
 *   · the goo is that field thresholded at the same level as the filter chain, antialiased to ~1.5 device pixels
 *   · the light: the same field at the soft blur's radius is the height map; its slope is the normal; a point light
 *     top-left gives the specular rim (exponent 26, like feSpecularLighting)
 *   · the glow: the field at the glow's radius, washed 60% toward white, a third as strong, behind
 *   · the water (docs/decisions/sofia-is-water.md): the same soft field is the body's thickness, so colour follows
 *     depth (shallow turquoise at the edge, lagoon blue at the heart), a patch of sun drifts over it and three
 *     wave families gather into caustic nets on the floor, as light does through real water
 *
 * Cost: one quad, ~100 drops looped per pixel with early-outs, a fraction of a millisecond on a phone GPU.
 * Returns null where WebGL2 (or enough uniforms) isn't available; callers fall back to the CPU field.
 */
export const MAX_DROPS = 128

const VERT = `#version 300 es
in vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }`

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;           // canvas size, device px
uniform vec4 uP[${MAX_DROPS}]; // drops: x, y, radius (device px), unused
uniform int uN;
uniform float uS1, uSs, uSg; // blur radii (σ, device px): goo · light · glow
uniform vec3 uWater[4];      // the water by depth: foam · shallow · water · deep
uniform int uTone;           // 0 own colour · 1 water, an orb (the sun circles its heart) · 2 water, a bar (the sun drifts along it)
uniform vec2 uDepth;         // the field read as the water's edge (x) and its deepest point (y)
uniform int uThin;           // 1: a thin line (small orbs), whose soft field never fills: depth reads the goo field instead
uniform float uCaustic;      // wavelength of the light nets on the floor, device px (0 = none)
uniform vec3 uOwn;
uniform float uRot;          // liquid time
uniform int uLit;
uniform vec3 uLight;         // point light, device px
uniform float uSurface;      // height of the lit surface, device px
out vec4 o;

const float TAU = 6.28318530718;
// Normal CDF (fast tanh approximation).
// Clamped: GPUs compute tanh through exponentials, which overflow to NaN far from a drop.
float Phi(float x) { x = clamp(x, -6.0, 6.0); return 0.5 * (1.0 + tanh(0.7978845608 * (x + 0.044715 * x * x * x))); }
// Coverage of a disk of radius r, blurred by σ, at distance d from its centre.
float cov(float d, float r, float s) {
  float peak = 1.0 - exp(-r * r / (2.0 * s * s));
  return peak * Phi((r - d) / s) / max(Phi(r / s), 0.5);
}
// Its slope along the distance (exact, so the light reads as a smooth line, never per-pixel speckle).
float covSlope(float d, float r, float s) {
  float x = clamp((r - d) / s, -6.0, 6.0);
  float peak = 1.0 - exp(-r * r / (2.0 * s * s));
  return -peak * 0.3989422804 * exp(-0.5 * x * x) / s / max(Phi(r / s), 0.5);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float U = 0.0, Us = 0.0, Ug = 0.0;
  vec2 gS = vec2(0.0); // slope of the soft surface
  float reach = 3.2 * uSg;
  for (int i = 0; i < ${MAX_DROPS}; i++) {
    if (i >= uN) break;
    vec4 d = uP[i];
    float dist = distance(p, d.xy);
    if (dist - d.z > reach) continue;
    U += cov(dist, d.z, uS1);
    if (uLit == 1 || uTone > 0) {
      Us += cov(dist, d.z, uSs);
      gS += covSlope(dist, d.z, uSs) * (p - d.xy) / max(dist, 1e-3);
    }
    if (uLit == 1) Ug += cov(dist, d.z, uSg);
  }
  // A soft union: sparse drops still add up (the gooey bridges), dense ones saturate like overlapping paint instead
  // of piling up, so a tightly packed outline stays as slim as the filter chain draws it.
  U = 1.0 - exp(-U); Us = 1.0 - exp(-Us); Ug = 1.0 - exp(-Ug);

  // Colour: water, or the text colour.
  vec3 c = uOwn;
  if (uTone > 0) {
    // Depth. The soft field is the body's thickness: thin at its edge, full at its heart. Water takes the light
    // fast, so it turns from the shallows' turquoise to the deep's blue a little below the surface.
    float d = clamp(((uThin == 1 ? U : Us) - uDepth.x) / (uDepth.y - uDepth.x), 0.0, 1.0);
    d = 1.0 - pow(1.0 - d, 1.6);
    // The shallows are a thin band at the very edge (a quarter of the depth); the body is turquoise turning blue.
    c = d < 0.25 ? mix(uWater[1], uWater[2], d * 4.0) : mix(uWater[2], uWater[3], (d - 0.25) / 0.75);
    // The sun: a patch of light drifting over the body, lifting the water toward the shallows where it passes.
    vec2 sun = uTone == 1 ? uRes * 0.5 + vec2(cos(uRot * 0.37), sin(uRot * 0.29)) * uRes.x * 0.28 : vec2(fract(uRot * 0.05) * uRes.x, uRes.y * 0.35);
    float sr = uTone == 1 ? uRes.x * 0.42 : uRes.y * 3.0;
    float s = exp(-dot(p - sun, p - sun) / (sr * sr));
    c = mix(c, uWater[1], 0.4 * s);
    // Caustics: light refracted through the moving surface gathers into bright, wandering nets on the floor.
    // Three wave families, each a thin line where it crosses zero, bent by the others so the net never repeats.
    if (uCaustic > 0.0) {
      vec2 q = p * (TAU / uCaustic);
      float n1 = sin(q.x + 0.9 * sin(q.y * 0.8 + uRot * 0.7) + uRot * 0.5);
      float n2 = sin(q.y * 0.9 + 0.8 * sin(q.x * 0.7 - uRot * 0.6) - uRot * 0.4);
      float n3 = sin((q.x + q.y) * 0.6 + 0.7 * sin(q.x * 0.5 - q.y * 0.4 + uRot * 0.5) + uRot * 0.3);
      float net = pow(1.0 - abs(n1), 6.0) + pow(1.0 - abs(n2), 6.0) + pow(1.0 - abs(n3), 6.0);
      // Nets read where there is a floor under water to light: not at the very edge, strongest in the middle depth.
      c = mix(c, uWater[0], 0.42 * clamp(net, 0.0, 1.0) * d * (1.0 - 0.35 * d));
    }
  }

  // The goo: threshold where the filter chain does (≈ 0.43), with an edge no wider than ~1.5 device px.
  float w = max(fwidth(U) * 1.5, 0.004);
  // 0.5: the second melt of the chain erodes the first threshold a little, lines as slim as on desktop.
  float A = smoothstep(0.45 - w, 0.45 + w, U);

  vec3 rgb = c;
  float alpha = A;
  if (uLit == 1) {
    // Specular rim from the top left, on the softened surface.
    // Specular on the RIM only: where the soft surface slopes (its edge), facing the light top-left. The flat body
    // stays its colour, the highlight is a glint on the edge of the drop, as on desktop.
    // Specular from a point light top-left on the soft surface (height = soft field × surface scale), like
    // feSpecularLighting: the rim facing the light shines as a smooth line, the body keeps its colour.
    // The chain lights the melted SHAPE (flat on top, sloped only at its rim), not the raw drops: squash the soft
    // field into a plateau first, so only the edge has a slope.
    float k = clamp((Us - 0.2) / 0.5, 0.0, 1.0);
    float h = k * k * (3.0 - 2.0 * k) * uSurface;
    vec2 grad = gS * (6.0 * k * (1.0 - k) / 0.5) * uSurface;
    vec3 n = normalize(vec3(-grad, 1.0));
    // A low light from the top left (30° above the surface): flat tops stay their colour, only rims tilted toward
    // the light catch it, the glint along the edge that the desktop chain shows.
    vec3 l = normalize(vec3(-0.5, -0.5, 0.71));
    vec3 hv = normalize(l + vec3(0.0, 0.0, 1.0));
    // The desktop chain's broad sheen (a soft highlight across the body) plus the bright rim.
    // Volume: a soft, broad sheen from the point light on the unflattened surface (the body's gentle curve, top
    // left), a third as strong as the chain's so it never washes the colour out.
    vec3 n2 = normalize(vec3(-gS * uSurface * 0.6, 1.0));
    vec3 hp = normalize(normalize(uLight - vec3(p, 0.0)) + vec3(0.0, 0.0, 1.0));
    float sheen = 0.38 * pow(max(dot(n2, hp), 0.0), 18.0);
    float spec = (1.1 * pow(max(dot(n, hv), 0.0), 26.0) + sheen) * A;
    rgb = min(vec3(1.0), rgb + 0.65 * spec);
    alpha = min(1.0, A + 0.65 * spec * A);
    // Glow behind: wide, pastel, a third as strong.
    float ga = 0.32 * Ug;
    vec3 gc = c * 0.4 + 0.6;
    // "over": the liquid on top of its glow (premultiplied).
    vec3 prem = rgb * alpha + gc * ga * (1.0 - alpha);
    float outA = alpha + ga * (1.0 - alpha);
    o = vec4(prem, outA);
    return;
  }
  o = vec4(rgb * alpha, alpha);
}`

export interface OrbGL {
  /** `water`: false draws the text colour (`own`); true the water as an orb (the sun circles its heart); "bar" the water along a track. */
  draw(drops: Float32Array, count: number, opts: { t: number; rot: number; water: boolean | "bar"; own: [number, number, number] }): void
  dispose(): void
}

export function createOrbGL(
  canvas: HTMLCanvasElement,
  cfg: {
    size: number
    /** A rectangle instead of a square (bars). */
    width?: number
    height?: number
    dpr: number
    s1: number
    ss: number
    sg: number
    lit: boolean
    /** The water by depth, sRGB bytes: foam · shallow · water · deep (the --vita-ai-* tokens). */
    water: [number, number, number][]
    /** The field read as the water's edge and its deepest point. */
    depth: [number, number]
    /** A thin line (small orbs): its soft field never fills, so depth reads the goo field itself and the line stays turquoise. */
    thin?: boolean
    /** Wavelength of the caustic nets, CSS px; 0 for none (small orbs: nothing that fine survives). */
    caustic: number
    surface: number
    light: [number, number, number]
  },
): OrbGL | null {
  const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, antialias: false, alpha: true, powerPreference: "low-power" })
  if (!gl) return null
  if ((gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) as number) < MAX_DROPS + 24) return null
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
  }
  const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return null
  const prog = gl.createProgram()!
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  gl.useProgram(prog)
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, "a")
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const u = (n: string) => gl.getUniformLocation(prog, n)
  const W = Math.round((cfg.width ?? cfg.size) * cfg.dpr)
  const H = Math.round((cfg.height ?? cfg.size) * cfg.dpr)
  canvas.width = W
  canvas.height = H
  gl.viewport(0, 0, W, H)
  gl.uniform2f(u("uRes"), W, H)
  gl.uniform1f(u("uS1"), cfg.s1 * cfg.dpr)
  gl.uniform1f(u("uSs"), cfg.ss * cfg.dpr)
  gl.uniform1f(u("uSg"), cfg.sg * cfg.dpr)
  gl.uniform1i(u("uLit"), cfg.lit ? 1 : 0)
  gl.uniform3f(u("uLight"), cfg.light[0] * cfg.dpr, cfg.light[1] * cfg.dpr, cfg.light[2] * cfg.dpr)
  gl.uniform1f(u("uSurface"), cfg.surface * cfg.dpr)
  gl.uniform3fv(u("uWater"), new Float32Array(cfg.water.slice(0, 4).flatMap(([r, g, b]) => [r / 255, g / 255, b / 255])))
  gl.uniform2f(u("uDepth"), cfg.depth[0], cfg.depth[1])
  gl.uniform1i(u("uThin"), cfg.thin ? 1 : 0)
  gl.uniform1f(u("uCaustic"), cfg.caustic * cfg.dpr)
  const uP = u("uP"), uN = u("uN"), uRot = u("uRot"), uTone = u("uTone"), uOwn = u("uOwn")
  gl.clearColor(0, 0, 0, 0)
  return {
    draw(drops, count, { rot, water, own }) {
      gl.uniform4fv(uP, drops)
      gl.uniform1i(uN, count)
      gl.uniform1f(uRot, rot)
      gl.uniform1i(uTone, water === "bar" ? 2 : water ? 1 : 0)
      gl.uniform3f(uOwn, own[0] / 255, own[1] / 255, own[2] / 255)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    },
    dispose() {
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    },
  }
}
