let accounts = [];
let transactionDataTable;
let accountsDataTable;

function initializeTransactionTable() {
    transactionDataTable = $("#transactionTable").DataTable();
}

function initializeAccountsTable() {
    accountsDataTable = $("#accountTable").DataTable();
}

function clearActiveLinks() {
    document.querySelectorAll(".nav-link").forEach((link) => link.classList.remove("active"));
}

function showSection(section) {
    clearActiveLinks();
    hideAllSections();
    switch (section) {
        case "main":
            document.getElementById("mainContent").classList.remove("d-none");
            break;
        case "accounts":
            document.getElementById("accountsListSection").classList.remove("d-none");
            document.getElementById("addAccountSection").classList.remove("d-none");
            getAccountsTable();
            break;
        case "transfer":
            document.getElementById("transferFundsSection").classList.remove("d-none");
            populateAccountSelects();
            break;
        case "transactions":
            document.getElementById("transactionHistorySection").classList.remove("d-none");
            populateTransactionsAccountSelect();
            getTransactions(document.getElementById("transactionsAccountSelect").value);
            break;
    }
    document.querySelector(`.nav-link[href='#'][onclick*='${section}']`).classList.add("active");
}

function hideAllSections() {
    ["mainContent", "accountsListSection", "addAccountSection", "transferFundsSection", "transactionHistorySection"].forEach((id) => {
        document.getElementById(id).classList.add("d-none");
    });
}

function getAccounts() {
    return fetch("/api/v1/accounts")
        .then((response) => response.json())
        .then((data) => {
            accounts = data;
        })
        .catch((error) => console.error("Error:", error));
}

function getAccountsTable() {
    getAccounts().then(() => {
        accountsDataTable.clear();
        accountsDataTable.rows.add(
            accounts.map((account) => [
                account.id,
                account.name,
                currencyFormat(account.balance),
            ])
        );
        accountsDataTable.draw();
    });
}

function currencyFormat(amount) {
    return new Intl.NumberFormat("en-NZ", {
        style: "currency",
        currency: "NZD",
    }).format(amount);
}

function getAccountsSelectOptions() {
    getAccounts();
    return accounts
        .map(
            (account) =>
                `<option value="${account.id}">${account.id} - ${account.name}</option>`
        )
        .join("");
}

function populateAccountSelects() {
    const selectElements = [document.getElementById("fromAccountSelect"), document.getElementById("toAccountSelect")];
    selectElements.forEach((select) => {
        select.innerHTML = accounts.map((account) => `<option value="${account.id}">${account.id} - ${account.name}</option>`).join("");
    });
}

function populateTransactionsAccountSelect() {
    const selectElements = [document.getElementById("transactionsAccountSelect")];
    const defaultAllOption = `<option value="">All</option>`;
    selectElements.forEach((select) => {
        select.innerHTML = defaultAllOption + getAccountsSelectOptions();
    });
}

function addAccount() {
    const account = {
        name: document.getElementById("accountNameInput").value,
        balance: parseFloat(document.getElementById("initialBalanceInput").value),
    };

    fetch("/api/v1/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account),
    })
        .then((response) => {
            if (!response.ok) {
                return response.text().then((errorText) => Promise.reject(new Error(errorText)));
            }

            return response.json();
        })
        .then(() => {
            getAccountsTable();
            resetForms();
            showFeedbackModal("Account added successfully!", true);
        })
        .catch((error) => {
            console.error("Error:", error);
            showFeedbackModal("An error occurred while adding the account", false);
        });
}

function transferFunds() {
    const transferData = {
        fromAccountId: document.getElementById("fromAccountSelect").value,
        toAccountId: document.getElementById("toAccountSelect").value,
        amount: parseFloat(document.getElementById("transferAmountInput").value),
    };

    fetch("/api/v1/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transferData),
    })
        .then((response) => {
            if (!response.ok) {
                return response.text().then((errorText) => Promise.reject(new Error(errorText)));
            }

            const contentType = response.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                return response.json();
            } else {
                return response.text();
            }
        })
        .then((data) => {
            resetForms();
            showFeedbackModal(typeof data === "string" ? data : "Transfer completed successfully!", true);
        })
        .catch((error) => {
            console.error("Error:", error);
            showFeedbackModal("An error occurred during the transfer", false);
        });

    getAccountsTable();
    getTransactions();
}

function showFeedbackModal(message, isSuccess) {
    const modalTitle = isSuccess ? "Success" : "Error";
    const modalElement = $("#feedbackModal");

    document.getElementById("feedbackModalLabel").textContent = modalTitle;
    document.getElementById("feedbackMessage").textContent = message;

    modalElement.modal("show");
}

function getTransactions(account = null) {
    const fetchUrl = account ? "/api/v1/transactions?account=" + account : "/api/v1/transactions";
    fetch(fetchUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((transactions) => {
            if (!Array.isArray(transactions)) {
                throw new Error("Expected transactions to be an array");
            }

            transactionDataTable.clear();
            transactionDataTable.rows.add(transactions.map((transaction) => [
                transaction.id,
                transaction.fromAccountName,
                transaction.toAccountName,
                currencyFormat(transaction.amount),
                new Date(transaction.date).toLocaleString(),
            ]));
            transactionDataTable.draw();
        })
        .catch((error) => console.error("Error:", error));
}

function resetForms() {
    document.getElementById("accountNameInput").value = "";
    document.getElementById("initialBalanceInput").value = "";
    document.getElementById("transferAmountInput").value = "";
}

populateTransactionsAccountSelect();
document.getElementById("transactionsAccountSelect").addEventListener("change", function () {
    getTransactions(document.getElementById("transactionsAccountSelect").value);
});

$(document).ready(function () {
    initializeTransactionTable();
    initializeAccountsTable();
});