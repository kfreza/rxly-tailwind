// Dotted Earth behind the FAQ dome — a code copy of the Figma video fill, drawn on a <canvas>.
// The land map, tilt, spin and dot size were measured from the original video (see docs/BRIEF.md).
// Usage: <canvas data-dot-globe></canvas>; the globe fills the canvas (square). Plays only while on
// screen; with reduced motion it shows the first frame, still.

// ── Settings ────────────────────────────────────────────────
const SETTINGS = {
  speed: 21.67, // degrees per second (the video: one turn every 16.6 s, left → right)
  tilt: 12.5, // degrees the north pole leans toward the viewer
  dot: 0.011, // dot radius as a share of the globe radius
  color: '#424242',
  start: 0, // starting spin (0 = the video's first frame, Asia in front)
};
// ────────────────────────────────────────────────────────────

// Land cells on a 2.65° latitude × 3.333° longitude grid (108 columns), one hex row per
// latitude from 71.5°N (row 27) down to 53.0°S (row -20); bit = land.
const MAP = {
  dLat: 2.65,
  cols: 108,
  phase: 3.25,
  top: 27,
  rows: [
    '00000000001cfe0000000000000',
    '0000000003fbff8000000000000',
    '0000000000e7ff800000000e030',
    '000000000a07ff80000000310de',
    'f80000000501ff80000078277ff',
    'fe00000020f8ff000000fe1f7ff',
    'fe000000721cff000001fc7ffff',
    'fe0007fffa5cfe000003fffffff',
    'd8000ffffff8f0800007fffffff',
    '30000ffffe0060800011dfffff8',
    '60000ffffc14000000397fffff4',
    '4000060fff1c0000005bffffff8',
    '0000040fffd60000000fffffff8',
    '00000007ffff0000001fffffff0',
    '00000003fff80000000f7fffff0',
    '00000001fffe0000003dbfffff0',
    '00000001fff800000038afffff0',
    '00000001fff0000000300fffffc',
    '00000001ffe00000000003ffff8',
    '00000000ffc00000001c07ffff0',
    '00000000ffc00000003f03cfff0',
    '0000000058400000003ff3e7ff0',
    '0000000058600000007ff9f9ff0',
    '000000001800000000fffdf8f60',
    '000000000f70000000fffef0e60',
    '000000000718000000ffffe0c00',
    '000000000180000000ffff80c00',
    '000000000088000000ffffc0400',
    '0000000000ff0000007fffc0000',
    '00000000003f8000001fffc0020',
    '00000000003fc0000003ff80010',
    '00000000003fe0000001ff00018',
    '00000000003ffc000001fe0000c',
    '00000000003ffc000000fe00006',
    '00000000001ffc000000fe00000',
    '00000000000ff8000001fe40004',
    '000000000007f8000001fe40004',
    '800000000007f8000000fc4000b',
    'c00000000007e0000000f800005',
    'c00000000007c0000000f800009',
    'c00000000007c00000003800007',
    '00000000000f800000000000005',
    '00000000000f000000000000000',
    '000000000007000000000000000',
    '00000000001e000000000000000',
    '000000000018000000000000000',
    '000000000010000000000000000',
    '000000000008000000000000000',
  ],
};

function landPoints() {
  const pts = [];
  const dLon = 360 / MAP.cols;
  MAP.rows.forEach((hex, r) => {
    const lat = ((MAP.top - r) * MAP.dLat * Math.PI) / 180;
    for (let c = 0; c < MAP.cols; c++) {
      const nib = parseInt(hex[c >> 2], 16);
      if (nib & (8 >> (c & 3))) pts.push([Math.sin(lat), Math.cos(lat), ((MAP.phase + c * dLon) * Math.PI) / 180]);
    }
  });
  return pts;
}

export function initDotGlobes() {
  const canvases = [...document.querySelectorAll('canvas[data-dot-globe]')];
  if (!canvases.length) return;
  const pts = landPoints();
  const tilt = (SETTINGS.tilt * Math.PI) / 180;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  canvases.forEach((cv) => {
    const g = cv.getContext('2d');
    let size = 0;
    let visible = false;
    let raf = 0;
    let t0 = 0;
    let elapsed = 0; // seconds of spin shown so far (kept across pauses)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = cv.clientWidth;
      cv.width = Math.round(size * dpr);
      cv.height = Math.round(size * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (spinDeg) => {
      const R = size / 2;
      const r = SETTINGS.dot * R;
      const spin = (spinDeg * Math.PI) / 180;
      g.clearRect(0, 0, size, size);
      g.fillStyle = SETTINGS.color;
      g.beginPath();
      for (const [sinLat, cosLat, lon0] of pts) {
        const lon = lon0 + spin;
        const x = cosLat * Math.sin(lon);
        const z0 = cosLat * Math.cos(lon);
        const y = sinLat * ct - z0 * st; // up
        const z = sinLat * st + z0 * ct; // toward the viewer
        if (z <= 0) continue; // far side
        const px = R + R * x;
        const py = R - R * y;
        // a flat dot on the surface: squashed toward the edge (minor axis along the radius)
        const ang = Math.atan2(-y, x);
        g.moveTo(px + r * z * Math.cos(ang), py + r * z * Math.sin(ang));
        g.ellipse(px, py, r * z, r, ang, 0, Math.PI * 2);
      }
      g.fill();
    };

    const frame = (now) => {
      if (!t0) t0 = now - elapsed * 1000;
      elapsed = (now - t0) / 1000;
      draw(SETTINGS.start + SETTINGS.speed * elapsed);
      raf = requestAnimationFrame(frame);
    };
    const update = () => {
      cancelAnimationFrame(raf);
      t0 = 0;
      if (visible && !reduced.matches) raf = requestAnimationFrame(frame);
      else draw(SETTINGS.start + SETTINGS.speed * elapsed);
    };

    resize();
    draw(SETTINGS.start);
    new ResizeObserver(() => {
      resize();
      draw(SETTINGS.start + SETTINGS.speed * elapsed);
    }).observe(cv);
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      update();
    }).observe(cv);
    reduced.addEventListener?.('change', update);
  });
}
