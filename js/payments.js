/* =========================================
   Debt Manager — payments.js
========================================= */

function renderPaymentsTab() {

    const container = document.getElementById("paymentsList");
    if (!container) return;

    if (debts.length === 0) {
        container.innerHTML = `<p style="color:var(--muted);">Add a debt first to start logging payments.</p>`;
        return;
    }

    container.innerHTML = debts.map((debt, index) => {

        if (debt.balance <= 0.01) {
            return `
<div class="payment-row">
    <div class="payment-row-info">
        <h4>💳 ${debt.lender}</h4>
        <span class="payment-row-balance">🎉 Paid off</span>
    </div>
    <div class="payment-row-action">
        <input
            type="number"
            min="0"
            step="1"
            class="payment-input"
            id="paymentInput-${index}"
            placeholder="Amount">
        <button class="log-charge-btn" onclick="logCharge(${index})">➕ Log Charge</button>
    </div>
</div>`;
        }

        return `
<div class="payment-row">
    <div class="payment-row-info">
        <h4>💳 ${debt.lender}</h4>
        <span class="payment-row-balance">Balance: £${debt.balance.toFixed(2)}</span>
    </div>
    <div class="payment-row-action">
        <input
            type="number"
            min="0"
            step="1"
            class="payment-input"
            id="paymentInput-${index}"
            placeholder="£${getGuaranteedPayment(debt).toFixed(2)}">
        <button class="log-payment-btn" onclick="logPayment(${index})">➖ Payment</button>
        <button class="log-charge-btn" onclick="logCharge(${index})">➕ Charge</button>
    </div>
</div>`;
    }).join("");
}

function logPayment(index) {

    const input = document.getElementById(`paymentInput-${index}`);
    const amount = Number(input.value);

    if (!amount || amount <= 0) {
        alert("Enter a payment amount greater than £0.");
        return;
    }

    const debt = debts[index];
    const wasActive = debt.balance > 0.01;
    debt.balance = Math.max(0, debt.balance - amount);
    const justPaidOff = wasActive && debt.balance <= 0.01;

    saveDebts();
    renderDebts();
    updateSummary();

    if (justPaidOff) celebrateDebtPaidOff();
}

// The other direction from logPayment — a new purchase, a missed
// payment's fee, whatever added to the balance instead of reducing it.
function logCharge(index) {

    const input = document.getElementById(`paymentInput-${index}`);
    const amount = Number(input.value);

    if (!amount || amount <= 0) {
        alert("Enter a charge amount greater than £0.");
        return;
    }

    const debt = debts[index];
    debt.balance += amount;

    saveDebts();
    renderDebts();
    updateSummary();
}
