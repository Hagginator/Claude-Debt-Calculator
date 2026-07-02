window.onload = function () {
    loadDebts();

    // Restore the saved strategy before the first render, so the
    // "Pay First" priority tag reflects it immediately instead of
    // briefly showing the avalanche default.
    const savedSettings = loadBudgetSettings();
    if (savedSettings) {
        if (savedSettings.budget) document.getElementById("monthlyBudget").value = savedSettings.budget;
        if (savedSettings.strategy) document.getElementById("strategy").value = savedSettings.strategy;
    }

    renderDebts();
    updateSummary();

    document.getElementById("monthlyBudget").addEventListener("input", persistBudgetSettings);
    document.getElementById("strategy").addEventListener("change", persistBudgetSettings);
    document.getElementById("strategy").addEventListener("change", renderDebts);
};

function persistBudgetSettings() {
    const budget = document.getElementById("monthlyBudget").value;
    const strategy = document.getElementById("strategy").value;
    saveBudgetSettings(budget, strategy);
}
