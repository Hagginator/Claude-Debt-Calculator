let debts = [];

function addDebt() {

const lender = document.getElementById("lender").value;
const balance = Number(document.getElementById("balance").value);
const apr = Number(document.getElementById("apr").value);
const limit = Number(document.getElementById("limit").value);
const minimum = Number(document.getElementById("minimum").value);

    if (!lender || balance <= 0 || apr < 0 || limit <= 0 || minimum <= 0) {

        alert("Please complete every field.");

        return;

    }

    debts.push({

    lender,

    balance,

    apr,

    limit,

    minimum

});

    saveDebts();
    
    renderDebts();

    updateSummary();

    clearForm();

}

function deleteDebt(index) {

    debts.splice(index, 1);

    renderDebts();

    updateSummary();

    saveDebts();

}