// Array of quote objects
let quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "inspiration" },
    { text: "Life is 10% what happens to us and 90% how we react to it.", category: "life" },
    { text: "Your time is limited, don't waste it living someone else's life.", category: "motivation" }
];

// Function to display a random quote
function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    if (quotes.length === 0) {
        quoteDisplay.textContent = "No quotes available. Please add a new quote!";
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>Category: ${quote.category}</small>`;
}

// Function to create the add-quote form dynamically
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

// Function to add a new quote based on user input
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
    
    alert("New quote added successfully!");
    
    quoteTextInput.value = "";
    quoteCategoryInput.value = "";
    
    // Optionally, display a new random quote after adding
    showRandomQuote();
}

// Initialize the application once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Display a random quote
    showRandomQuote();
    
    // Event listener for the "Show New Quote" button
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    
    // Create the form for adding new quotes
    createAddQuoteForm();
});
