/* =========================================
   Debt Manager — layout.js
   Switches between whole visual layouts
   (typography, shape, density, motion) via
   a data-layout attribute on <html>, kept
   separate from the background-colour theme
   in theme.js.
========================================= */

const DEFAULT_LAYOUT = "classic";

function applyLayout(name) {
    document.documentElement.dataset.layout = name;
}

function selectLayout(name) {
    applyLayout(name);
    localStorage.setItem("layoutTheme", name);
    syncLayoutButtons(name);

    // Switching layout can move the tabs from a horizontal bar to a
    // vertical sidebar (or back) — the sliding indicator needs to
    // snap to the button's new position immediately rather than
    // waiting for the next tab click or window resize.
    if (typeof moveTabIndicator === "function") {
        moveTabIndicator(document.querySelector(".tab-btn.active"), true);
    }
}

function syncLayoutButtons(name) {
    document.querySelectorAll(".layout-option").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.layout === name);
    });
}

function loadLayout() {
    const saved = localStorage.getItem("layoutTheme") || DEFAULT_LAYOUT;
    applyLayout(saved);
    syncLayoutButtons(saved);
}

function resetLayout() {
    localStorage.removeItem("layoutTheme");
    applyLayout(DEFAULT_LAYOUT);
    syncLayoutButtons(DEFAULT_LAYOUT);
}

// Applied immediately (not on window.onload) so a saved layout shows
// straight away instead of flashing the classic one first.
loadLayout();
