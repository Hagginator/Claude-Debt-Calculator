// This is where all of our debts will be stored
let debts = [];

// Runs when the Add Debt button is clicked
function addDebt() {

    const lender = document.getElementById("lender").value;
    const balance = Number(document.getElementById("balance").value);
    const apr = Number(document.getElementById("apr").value);
    const minimum = Number(document.getElementById("minimum").value);

    if (!lender || balance <= 0 || apr < 0 || minimum <= 0) {
        alert("Please fill in every field correctly.");
        return;
    }

    const debt = {
        lender,
        balance,
        apr,
        minimum
    };

    debts.push(debt);

    renderDebts();
    updateSummary();

    document.getElementById("lender").value = "";
    document.getElementById("balance").value = "";
    document.getElementById("apr").value = "";
    document.getElementById("minimum").value = "";
}

// Draw every debt on the page
function renderDebts() {

    const debtContainer = document.getElementById("debts");

    debtContainer.innerHTML = "";

    debts.forEach(function (debt, index) {

        debtContainer.innerHTML += `
            <div class="debt-card">

                <h3>${debt.lender}</h3>

                <p>Balance: £${debt.balance.toFixed(2)}</p>

                <p>APR: ${debt.apr}%</p>

                <p>Minimum Payment: £${debt.minimum.toFixed(2)}</p>

                <button onclick="deleteDebt(${index})">
                    Delete
                </button>

            </div>
        `;

    });

}

function deleteDebt(index) {

    debts.splice(index, 1);

    renderDebts();

    updateSummary();

}

function updateSummary() {

    let totalDebt = 0;

    debts.forEach(function (debt) {

        totalDebt += debt.balance;

    });

    document.getElementById("totalDebt").textContent =
        "£" + totalDebt.toFixed(2);

}