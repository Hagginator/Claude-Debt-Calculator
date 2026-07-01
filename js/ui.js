function renderDebts() {

    const container = document.getElementById("debts");

    container.innerHTML = "";

    debts.forEach((debt, index) => {

        container.innerHTML += `

        <div class="debt-card">

            <h3>${debt.lender}</h3>

            <p>Balance £${debt.balance.toFixed(2)}</p>

            <p>APR ${debt.apr}%</p>

            <p>Minimum £${debt.minimum.toFixed(2)}</p>

            <button onclick="deleteDebt(${index})">
                Delete
            </button>

        </div>

        `;

    });

}

function clearForm() {

    document.getElementById("lender").value = "";
    document.getElementById("balance").value = "";
    document.getElementById("apr").value = "";
    document.getElementById("limit").value = "";
    document.getElementById("minimum").value = "";

}