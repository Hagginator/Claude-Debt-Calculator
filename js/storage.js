function saveDebts() {
    localStorage.setItem("debts", JSON.stringify(debts));
}

function loadDebts() {
    const savedDebts = localStorage.getItem("debts");
    if (savedDebts) debts = JSON.parse(savedDebts);

    // Migrate loans saved under the old model (balance = principal, no
    // originalTotal) to total-repayable tracking. Best-effort: total is
    // estimated as monthly × term, and any principal already paid is
    // mapped proportionally onto the new total. Approximate on purpose —
    // the user should edit the loan once to enter the exact figures off
    // their agreement, which is the whole point of the new model.
    let migrated = false;
    debts.forEach(d => {
        if (d.type === "loan" && d.originalTotal === undefined) {
            const principal = Number(d.originalPrincipal) || Number(d.balance) || 0;
            const monthly = Number(d.minimum) || 0;
            const term = Number(d.termMonths) || 0;
            const totalRepayable = (monthly * term) || principal;
            const fracPaid = principal > 0 ? (principal - Number(d.balance)) / principal : 0;
            d.principal = principal;
            d.originalTotal = totalRepayable;
            d.balance = Math.max(0, totalRepayable * (1 - Math.min(Math.max(fracPaid, 0), 1)));
            migrated = true;
        }
    });
    if (migrated) saveDebts();
}

function saveBudgetSettings(budget, strategy) {
    localStorage.setItem("budgetSettings", JSON.stringify({ budget, strategy }));
}

function loadBudgetSettings() {
    const saved = localStorage.getItem("budgetSettings");
    return saved ? JSON.parse(saved) : null;
}
