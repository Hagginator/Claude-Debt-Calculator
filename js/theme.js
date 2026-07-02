/* =========================================
   Debt Manager — theme.js
   Lets the user pick an accent colour and
   re-derives --primary/--border from it so
   the whole UI stays cohesive automatically.
========================================= */

const DEFAULT_THEME_COLOUR = "#C4F000";

function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    const bigint = parseInt(clean, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function rgbToHex(r, g, b) {
    return "#" + [r, g, b]
        .map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0"))
        .join("");
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            default: h = (r - g) / d + 4;
        }
        h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return { r: r * 255, g: g * 255, b: b * 255 };
}

// Applies a chosen accent colour across the app: the accent itself,
// a darker/desaturated shade of the same hue for --primary (so
// buttons/backgrounds stay readable and cohesive), and a translucent
// tint of the accent for --border/glow effects. Structural surface
// colours and semantic status colours (success/warning/danger) are
// deliberately left alone.
function applyThemeColor(hex) {

    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return;

    const { r, g, b } = hexToRgb(hex);
    let hsl = rgbToHsl(r, g, b);

    // Keep the accent bright/saturated enough to stay legible as
    // text-on-accent (buttons always pair it with the dark --bg text),
    // regardless of how dark or grey a colour the user actually picks.
    const clampedS = Math.max(hsl.s, 45);
    const clampedL = Math.max(hsl.l, 45);
    const accentRgb = hslToRgb(hsl.h, clampedS, clampedL);
    const accentHex = rgbToHex(accentRgb.r, accentRgb.g, accentRgb.b);

    const primaryRgb = hslToRgb(hsl.h, Math.max(35, clampedS * 0.75), 20);
    const primaryHoverRgb = hslToRgb(hsl.h, Math.max(35, clampedS * 0.75), 27);

    const root = document.documentElement;
    root.style.setProperty("--accent", accentHex);
    root.style.setProperty("--primary", rgbToHex(primaryRgb.r, primaryRgb.g, primaryRgb.b));
    root.style.setProperty("--primary-hover", rgbToHex(primaryHoverRgb.r, primaryHoverRgb.g, primaryHoverRgb.b));
    root.style.setProperty("--border", `rgba(${accentRgb.r | 0}, ${accentRgb.g | 0}, ${accentRgb.b | 0}, .12)`);

    return accentHex;
}

function syncThemeInputs(hex) {
    const picker = document.getElementById("themeColorPicker");
    const text = document.getElementById("themeColorText");
    if (picker) picker.value = hex;
    if (text) text.value = hex.toUpperCase();
}

function handleThemeColorInput(hex) {
    const applied = applyThemeColor(hex);
    if (!applied) return;
    syncThemeInputs(applied);
    localStorage.setItem("themeAccent", applied);
}

function handleThemeHexInput(value) {
    const hex = value.startsWith("#") ? value : `#${value}`;
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return; // ignore incomplete typing
    handleThemeColorInput(hex);
}

function selectThemePreset(hex) {
    handleThemeColorInput(hex);
}

function resetTheme() {
    localStorage.removeItem("themeAccent");
    const root = document.documentElement;
    root.style.removeProperty("--accent");
    root.style.removeProperty("--primary");
    root.style.removeProperty("--primary-hover");
    root.style.removeProperty("--border");
    syncThemeInputs(DEFAULT_THEME_COLOUR);
}

function loadTheme() {
    const saved = localStorage.getItem("themeAccent");
    const hex = saved || DEFAULT_THEME_COLOUR;
    if (saved) applyThemeColor(saved);
    syncThemeInputs(hex);
}

// Applied as soon as this script runs (rather than waiting for
// window.onload) so a saved custom colour shows immediately instead
// of flashing the default lime accent first.
loadTheme();
