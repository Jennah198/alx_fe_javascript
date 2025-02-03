// Global quotes array with some initial quotes
let quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "inspiration" },
    { text: "Life is 10% what happens to us and 90% how we react to it.", category: "life" },
    { text: "Your time is limited, don't waste it living someone else's life.", category: "motivation" }
];

// Save quotes to Local Storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Load quotes from Local Storage
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// Optional: Save last viewed quote to Session Storage
function saveLastViewedQuote(quote) {
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

function loadLastViewedQuote() {
    const lastQuote = sessionStorage.getItem('lastViewedQuote');
    return lastQuote ? JSON.parse(lastQuote) : null;
}

// Display a random quote on the page
function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    if (quotes.length === 0) {
        quoteDisplay.textContent = "No quotes available. Please add a new quote!";
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    // Display the quote text and category
    quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>Category: ${quote.category}</small>`;
    // Optionally, store the last viewed quote in session storage
    saveLastViewedQuote(quote);
}

// Dynamically create the add-quote form
function createAddQuoteForm() {
    const formContainer = document.getElementById('addQuoteFormContainer');
    const formHTML = `
        <h2>Add a New Quote</h2>
        <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
        <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
        <button id="addQuoteBtn">Add Quote</button>
    `;
    formContainer.innerHTML = formHTML;
    document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
}

// Add a new quote from user input
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
    saveQuotes();  // Update local storage
    alert("New quote added successfully!");
    
    // Clear the input fields
    quoteTextInput.value = "";
    quoteCategoryInput.value = "";
    
    // Display a new random quote
    showRandomQuote();
}

// Export quotes to a JSON file
function exportToJson() {
    const dataStr = JSON.stringify(quotes, null, 2); // formatted JSON
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create and trigger a temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quotes.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Import quotes from a JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            if (Array.isArray(importedQuotes)) {
                // Merge imported quotes with existing ones
                quotes.push(...importedQuotes);
                saveQuotes();  // Update local storage
                alert('Quotes imported successfully!');
                showRandomQuote();
            } else {
                alert('Invalid file format.');
            }
        } catch (error) {
            alert('Error importing quotes: ' + error.message);
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// Initialize the application once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Load quotes from Local Storage
    loadQuotes();
    
    // Display a random quote
    showRandomQuote();
    
    // Set up event listener for the "Show New Quote" button
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    
    // Set up event listener for the "Export Quotes" button
    document.getElementById('exportJson').addEventListener('click', exportToJson);
    
    // Create the add-quote form dynamically
    createAddQuoteForm();
});
