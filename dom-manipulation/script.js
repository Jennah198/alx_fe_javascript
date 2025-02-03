const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Simulated API

// Load data on startup
document.addEventListener("DOMContentLoaded", () => {
    loadQuotes();
    populateCategories();
    syncQuotes();
});

// Add new quote
function addQuote() {
    let quoteInput = document.getElementById("quoteInput").value.trim();
    let categoryInput = document.getElementById("categoryInput").value.trim();

    if (quoteInput === "" || categoryInput === "") {
        alert("Both quote and category are required!");
        return;
    }

    let quotes = JSON.parse(localStorage.getItem("quotes")) || [];
    let newQuote = { text: quoteInput, category: categoryInput, dateAdded: new Date().toISOString() };

    quotes.push(newQuote);
    localStorage.setItem("quotes", JSON.stringify(quotes));

    document.getElementById("quoteInput").value = "";
    document.getElementById("categoryInput").value = "";

    uploadNewQuote(newQuote);
    populateCategories();
    filterQuotes();
}

// Upload new quote to server
async function uploadNewQuote(quote) {
    try {
        await fetch(SERVER_URL, {
            method: "POST",
            body: JSON.stringify({ body: quote.text, category: quote.category, userId: 1 }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        displayNotification("Quote successfully uploaded to server!");
    } catch (error) {
        displayNotification("Error uploading quote!", true);
        console.error("Error uploading quote:", error);
    }
}

// Fetch quotes from server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(SERVER_URL);
        const serverQuotes = await response.json();
        return serverQuotes.map(q => ({
            text: q.body,
            category: "server",
            dateAdded: new Date().toISOString()
        }));
    } catch (error) {
        displayNotification("Error fetching quotes from server!", true);
        console.error("Error fetching quotes:", error);
        return [];
    }
}

// Sync local data with server
async function syncQuotes() {
    try {
        document.getElementById("syncStatus").textContent = "Syncing...";
        const serverQuotes = await fetchQuotesFromServer();
        let localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];

        let mergedQuotes = mergeQuotes(localQuotes, serverQuotes);
        localStorage.setItem("quotes", JSON.stringify(mergedQuotes));
        localStorage.setItem("lastSync", Date.now());

        displayNotification("Quotes synced with server!");
        populateCategories();
        filterQuotes();
        document.getElementById("syncStatus").textContent = "Sync complete!";
    } catch (error) {
        displayNotification("Sync failed!", true);
        console.error("Sync failed:", error);
        document.getElementById("syncStatus").textContent = "Sync failed!";
    }
}

// Merge server and local quotes
function mergeQuotes(local, server) {
    let merged = [...local];

    server.forEach(sq => {
        if (!local.some(lq => lq.text === sq.text)) {
            merged.push(sq);
        }
    });

    return merged;
}

// Show notification to user
function displayNotification(message, isError = false) {
    let notification = document.getElementById("notification");
    notification.textContent = message;
    notification.style.backgroundColor = isError ? "red" : "green";
    notification.style.display = "block";

    setTimeout(() => {
        notification.style.display = "none";
    }, 3000);
}

// Periodic sync every 30 seconds
setInterval(syncQuotes, 30000);

// Sync on button click
document.getElementById("syncQuotes").addEventListener("click", syncQuotes);
