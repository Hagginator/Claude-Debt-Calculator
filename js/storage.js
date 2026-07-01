function saveDebts() {

    localStorage.setItem(
        "debts",
        JSON.stringify(debts)
    );

}

function loadDebts() {

    const savedDebts = localStorage.getItem("debts");

    if (savedDebts) {

        debts = JSON.parse(savedDebts);

    }

}