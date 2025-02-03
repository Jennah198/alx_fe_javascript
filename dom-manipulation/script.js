const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Simulated API

// Load quotes on page load
document.addEventListener("DOMContentLoaded", () => {
    loadQuotes();
    populateCategories();
    syncWithServer();
});

// Add a new quote
function addQuote() {
    let quoteInput = document.getElementById("quoteInput").value.trim();
    let categoryInput = document.getElementById("categoryInput").value.trim();

    if (quoteInput === "" || categoryInput === "") {
        alert("Both quote and category are required!");
        return;
    }

    let quotes = JSON.parse(localStorage.getItem("quotes")) || [];
    quotes.push({ text: quoteInput, category: categoryInput, dateAdded: new Date().toISOString() });
    localStorage.setItem("quotes", JSON.stringify(quotes));

    document.getElementById("quoteInput").value = "";
    document.getElementById("categoryInput").value = "";

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

// Load quotes from storage and apply filter
function loadQuotes() {
    let quotes = JSON.parse(localStorage.getItem("quotes")) || [];
    let lastCategory = localStorage.getItem("lastSelectedCategory") || "all";
    document.getElementById("categoryFilter").value = lastCategory;
    filterQuotes();
}

// Sync quotes with server
async function syncWithServer() {
    try {
        document.getElementById('syncStatus').textContent = "Syncing...";
        
        const response = await fetch(SERVER_URL);
        const serverQuotes = await response.json();
        
        let localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
        let newQuotes = [];

        serverQuotes.forEach(serverQuote => {
            const exists = localQuotes.some(q => q.text === serverQuote.body);
            if (!exists) {
                newQuotes.push({ text: serverQuote.body, category: "server", dateAdded: new Date().toISOString() });
            }
        });

        localQuotes = [...localQuotes, ...newQuotes];
        localStorage.setItem('quotes', JSON.stringify(localQuotes));
        localStorage.setItem('lastSync', Date.now());

        document.getElementById('syncStatus').textContent = "Sync complete!";
        populateCategories();
        filterQuotes();
    } catch (error) {
        console.error("Sync failed:", error);
        document.getElementById('syncStatus').textContent = "Sync failed!";
    }
}

// Upload new quotes to server
async function uploadNewQuotes() {
    let localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
    let lastSync = localStorage.getItem('lastSync') || 0;
    
    let newQuotes = localQuotes.filter(q => new Date(q.dateAdded || 0) > new Date(lastSync));

    if (newQuotes.length === 0) {
        console.log("No new quotes to upload.");
        return;
    }

    for (let quote of newQuotes) {
        try {
            await fetch(SERVER_URL, {
                method: "POST",
                body: JSON.stringify({ body: quote.text, userId: 1 }),
                headers: { "Content-type": "application/json; charset=UTF-8" }
            });
        } catch (error) {
            console.error("Failed to upload quote:", quote.text);
        }
    }
}

// Periodic sync every 30 seconds
setInterval(syncWithServer, 30000);

// Sync on button click
document.getElementById('syncQuotes').addEventListener('click', syncWithServer);
