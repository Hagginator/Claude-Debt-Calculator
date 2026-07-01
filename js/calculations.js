function updateSummary() {

    let totalDebt = 0;

    debts.forEach(debt => {

        totalDebt += debt.balance;

    });

    document.getElementById("totalDebt").textContent =

        "£" + totalDebt.toFixed(2);

}