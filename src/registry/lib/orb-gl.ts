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
uniform vec3 uSpec[7];
uniform int uSpectrum;       // 0 own colour · 1 conic round the centre (orbs) · 2 along x (bars)
uniform vec3 uOwn;
uniform float uRot;
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
    if (uLit == 1) {
      Us += cov(dist, d.z, uSs);
      gS += covSlope(dist, d.z, uSs) * (p - d.xy) / max(dist, 1e-3);
      Ug += cov(dist, d.z, uSg);
    }
  }
  // A soft union: sparse drops still add up (the gooey bridges), dense ones saturate like overlapping paint instead
  // of piling up, so a tightly packed outline stays as slim as the filter chain draws it.
  U = 1.0 - exp(-U); Us = 1.0 - exp(-Us); Ug = 1.0 - exp(-Ug);

  // Colour: the conic spectrum turning with time, or the text colour.
  vec3 c = uOwn;
  if (uSpectrum > 0) {
    vec2 v = p - uRes * 0.5;
    float u = (uSpectrum == 1 ? fract((atan(v.y, v.x) - uRot) / TAU) : fract(p.x / uRes.x * 0.7 - uRot / TAU)) * 7.0;
    int i0 = int(floor(u));
    float f = u - float(i0);
    vec3 c0 = uSpec[0], c1 = uSpec[1];
    for (int k = 0; k < 7; k++) { if (k == i0) { c0 = uSpec[k]; c1 = uSpec[(k + 1) % 7]; } }
    c = mix(c0, c1, f);
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
  draw(drops: Float32Array, count: number, opts: { t: number; rot: number; spectrum: boolean | "linear"; own: [number, number, number] }): void
  dispose(): void
}

export function createOrbGL(
  canvas: HTMLCanvasElement,
  cfg: { size: number; /** A rectangle instead of a square (bars). */ width?: number; height?: number; dpr: number; s1: number; ss: number; sg: number; lit: boolean; spectrum: [number, number, number][]; surface: number; light: [number, number, number] },
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
  gl.uniform3fv(u("uSpec"), new Float32Array(cfg.spectrum.flatMap(([r, g, b]) => [r / 255, g / 255, b / 255])))
  const uP = u("uP"), uN = u("uN"), uRot = u("uRot"), uSpectrum = u("uSpectrum"), uOwn = u("uOwn")
  gl.clearColor(0, 0, 0, 0)
  return {
    draw(drops, count, { rot, spectrum, own }) {
      gl.uniform4fv(uP, drops)
      gl.uniform1i(uN, count)
      gl.uniform1f(uRot, rot)
      gl.uniform1i(uSpectrum, spectrum === "linear" ? 2 : spectrum ? 1 : 0)
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
