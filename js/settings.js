/* =========================================
   Debt Manager — settings.js
========================================= */

function openSettingsModal() {
    document.getElementById("settingsModal").classList.remove("hidden");
}

function closeSettingsModal() {
    document.getElementById("settingsModal").classList.add("hidden");
}

// Downloads everything stored in this browser (debts + budget/strategy
// settings) as a single JSON file, so it can be restored later or on
// another device.
function exportData() {

    const payload = {
        exportedAt: new Date().toISOString(),
        debts,
        budgetSettings: loadBudgetSettings()
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `debt-manager-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();

    URL.revokeObjectURL(url);
}

// Reads a previously exported backup file and, after confirming with
// the user, replaces whatever's currently stored.
function importData(event) {

    const file = event.target.files[0];
    event.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {

        let parsed;
        try {
            parsed = JSON.parse(reader.result);
        } catch (e) {
            alert("That file isn't valid JSON — couldn't read it as a backup.");
            return;
        }

        if (!Array.isArray(parsed.debts)) {
            alert("That doesn't look like a Debt Manager backup file.");
            return;
        }

        const confirmed = confirm(
            `This will replace your current ${debts.length} debt(s) with ${parsed.debts.length} debt(s) from the backup. Continue?`
        );
        if (!confirmed) return;

        debts = parsed.debts;
        saveDebts();

        if (parsed.budgetSettings) {
            saveBudgetSettings(parsed.budgetSettings.budget, parsed.budgetSettings.strategy);
            if (parsed.budgetSettings.budget) document.getElementById("monthlyBudget").value = parsed.budgetSettings.budget;
            if (parsed.budgetSettings.strategy) document.getElementById("strategy").value = parsed.budgetSettings.strategy;
        }

        renderDebts();
        updateSummary();
        closeSettingsModal();
        alert("Backup restored.");
    };

    reader.readAsText(file);
}

function resetAllData() {

    const confirmed = confirm(
        `This will permanently delete all ${debts.length} debt(s) and your saved settings from this browser. This can't be undone. Continue?`
    );
    if (!confirmed) return;

    debts = [];
    localStorage.clear();

    document.getElementById("monthlyBudget").value = "";
    document.getElementById("strategy").value = "avalanche";
    document.getElementById("repaymentPlan").innerHTML = "";

    renderDebts();
    updateSummary();
    closeSettingsModal();
}
