// Load quotes from Local Storage or set default ones
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "inspiration" },
    { text: "Life is 10% what happens to us and 90% how we react to it.", category: "life" },
    { text: "Your time is limited, don't waste it living someone else's life.", category: "motivation" }
];

// Save quotes to Local Storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Populate categories dynamically
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // Reset options

    const categories = [...new Set(quotes.map(quote => quote.category))];

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Restore last selected category filter
    const lastSelectedCategory = localStorage.getItem('selectedCategory');
    if (lastSelectedCategory) {
        categoryFilter.value = lastSelectedCategory;
    }
}

// Display quotes based on category selection
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    localStorage.setItem('selectedCategory', selectedCategory); // Save selection

    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = ''; // Clear previous quotes

    const filteredQuotes = selectedCategory === 'all'
        ? quotes
        : quotes.filter(quote => quote.category === selectedCategory);

    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available for this category.</p>';
    } else {
        filteredQuotes.forEach(quote => {
            const quoteElement = document.createElement('p');
            quoteElement.innerHTML = `"${quote.text}" <small>(${quote.category})</small>`;
            quoteDisplay.appendChild(quoteElement);
        });
    }
}

// Display a random quote
function showRandomQuote() {
    if (quotes.length === 0) {
        document.getElementById('quoteDisplay').textContent = "No quotes available. Please add a new quote!";
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    document.getElementById('quoteDisplay').innerHTML = `<p>"${quote.text}"</p><small>Category: ${quote.category}</small>`;
}

// Add a new quote
function addQuote() {
    const quoteTextInput = document.getElementById('newQuoteText');
    const quoteCategoryInput = document.getElementById('newQuoteCategory');
    const quoteText = quoteTextInput.value.trim();
    const quoteCategory = quoteCategoryInput.value.trim();

    if (quoteText === "" || quoteCategory === "") {
        alert("Please enter both a quote and a category.");
        return;
    }

    const newQuote = { text: quoteText, category: quoteCategory };
    quotes.push(newQuote);
    saveQuotes(); // Save in local storage

    alert("New quote added successfully!");

    // Clear input fields
    quoteTextInput.value = "";
    quoteCategoryInput.value = "";

    // Update categories and reapply filter
    populateCategories();
    filterQuotes();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    populateCategories(); // Populate categories
    filterQuotes(); // Restore last category filter
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
});
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Simulated API

// Function to fetch quotes from server and sync with local storage
async function syncWithServer() {
    try {
        document.getElementById('syncStatus').textContent = "Syncing...";
        
        const response = await fetch(SERVER_URL);
        const serverQuotes = await response.json();
        
        let localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
        let lastSync = localStorage.getItem('lastSync') || 0;
        let newQuotes = [];

        serverQuotes.forEach(serverQuote => {
            // Check if quote exists in local storage
            const existingQuote = localQuotes.find(q => q.text === serverQuote.body);
            if (!existingQuote) {
                newQuotes.push({ text: serverQuote.body, category: "server" }); 
            }
        });

        // Merge new quotes
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

// Function to upload new quotes to the server (simulation)
async function uploadNewQuotes() {
    let localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
    let lastSync = localStorage.getItem('lastSync') || 0;
    
    // Get quotes added after last sync
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

// Function to resolve conflicts (Server takes priority)
function resolveConflicts(serverQuotes) {
    let localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
    let resolvedQuotes = [];

    serverQuotes.forEach(serverQuote => {
        let localQuote = localQuotes.find(q => q.text === serverQuote.body);
        if (localQuote) {
            resolvedQuotes.push({ text: serverQuote.body, category: "server" });
        } else {
            resolvedQuotes.push(localQuote);
        }
    });

    localStorage.setItem('quotes', JSON.stringify(resolvedQuotes));
}

// Sync quotes every 30 seconds
setInterval(syncWithServer, 30000);

// Event listener for manual sync
document.getElementById('syncQuotes').addEventListener('click', syncWithServer);

// Run sync on page load
document.addEventListener('DOMContentLoaded', syncWithServer);
