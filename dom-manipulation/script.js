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

// Populate categories dynamically
function populateCategories() {
    let quotes = JSON.parse(localStorage.getItem("quotes")) || [];
    let categories = new Set(quotes.map(q => q.category));
    let categoryFilter = document.getElementById("categoryFilter");

    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(category => {
        let option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Filter quotes by category
function filterQuotes() {
    let selectedCategory = document.getElementById("categoryFilter").value;
    localStorage.setItem("lastSelectedCategory", selectedCategory);

    let quotes = JSON.parse(localStorage.getItem("quotes")) || [];
    let filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);

    displayQuotes(filteredQuotes);
}

// Display quotes in the UI
function displayQuotes(quotes) {
    let quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = "";

    quotes.forEach(quote => {
        let quoteElement = document.createElement("p");
        quoteElement.textContent = `"${quote.text}" - Category: ${quote.category}`;
        quoteDisplay.appendChild(quoteElement);
    });
}

// Load stored quotes
function loadQuotes() {
    let lastCategory = localStorage.getItem("lastSelectedCategory") || "all";
    document.getElementById("categoryFilter").value = lastCategory;
    filterQuotes();
}

// Fetch quotes from server (mock API)
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
        console.error("Error fetching quotes:", error);
        return [];
    }
}

// Upload new quote to server
async function uploadNewQuote(quote) {
    try {
        await fetch(SERVER_URL, {
            method: "POST",
            body: JSON.stringify({ body: quote.text, userId: 1 }),
            headers: { "Content-type": "application/json; charset=UTF-8" }
        });
    } catch (error) {
        console.error("Error uploading quote:", error);
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

        displayNotification("Quotes updated from server!");
        populateCategories();
        filterQuotes();
        document.getElementById("syncStatus").textContent = "Sync complete!";
    } catch (error) {
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
function displayNotification(message) {
    let notification = document.getElementById("notification");
    notification.textContent = message;
    notification.style.display = "block";

    setTimeout(() => {
        notification.style.display = "none";
    }, 3000);
}

// Periodic sync every 30 seconds
setInterval(syncQuotes, 30000);

// Sync on button click
document.getElementById("syncQuotes").addEventListener("click", syncQuotes);
