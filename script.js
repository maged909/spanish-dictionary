const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("resultsAccordion");
const filePath = './JSON-data.json';

// // Variable to keep track of the currently expanded collapse element
// let currentlyExpanded = null;

// // Function to handle the show.bs.collapse event
// function handleCollapseShow(event) {
//     const targetCollapse = event.target;
//     if (currentlyExpanded && currentlyExpanded !== targetCollapse) {
//         // Collapse the previously expanded element (if any)
//         const bsCollapse = new bootstrap.Collapse(currentlyExpanded);
//         bsCollapse.hide();
//         // Remove the 'expanded' class from the previously expanded element
//         currentlyExpanded.parentElement.classList.remove('expanded');
//     }
    
//     // Add the 'expanded' class to the currently expanded element
//     targetCollapse.parentElement.classList.add('expanded');
    
//     // Update the currently expanded element
//     currentlyExpanded = targetCollapse;
// }

// Function to handle the change event of the dropdown
function handleDropdownChange() {
    // Reset the search input
    searchInput.value = "";
    // Reset the dropdown to default (contains)
    changeSearchOption('contains');
}

// Function to reset the form and clear the results
function resetForm() {
    // Reset the search input
    searchInput.value = "";
    // Clear the results
    resultsDiv.innerHTML = "";
}


// Function to display search results
function displayResults(searchResults) {
    const accordionDiv = document.getElementById("resultsAccordion");
    accordionDiv.innerHTML = ""; // Clear previous results

    if (searchResults.length === 0) {
        accordionDiv.innerHTML = "<p>No results found.</p>";
    } else {
        searchResults.forEach(entry => {
            const subEntry = entry.S.find(sub_entry => sub_entry.H.toLowerCase().includes(searchInput.value.trim().toLowerCase()));
            const headword = subEntry.H;
            // Skip entries with headwords starting with a number and a period
            if (/^[0-9]+\./.test(headword)) {
                return;
            }

            const definitions = subEntry ? (subEntry.D ? subEntry.D.join("<br>") : "No definitions available.") : "No definitions available.";
            const I = subEntry ? (subEntry.I ? subEntry.I.join("<br>") : '') : "";

            // Generate unique IDs for collapse components
            const collapseId = `collapse_${Math.random().toString(36).substr(2, 23)}`;

            // Create the accordion item
            const accordionItem = document.createElement("div");
            accordionItem.classList.add("accordion-item");

            // Create the accordion header (button)
            const accordionHeader = document.createElement("h2");
            accordionHeader.classList.add("accordion-header");
            accordionHeader.innerHTML = `
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
                    <h5>${headword}</h5>
                </button>
            `;

            // Create the accordion body (collapse content)
            const accordionBody = document.createElement("div");
            accordionBody.classList.add("accordion-collapse", "collapse");
            accordionBody.setAttribute("id", collapseId);
            accordionBody.setAttribute("data-bs-parent", "#resultsAccordion");
            accordionBody.innerHTML = `
                <div class="accordion-body">
                    <span>${I}</span>
                    <p>${definitions}</p>
                </div>
            `;

            // Append header and body to the item
            accordionItem.appendChild(accordionHeader);
            accordionItem.appendChild(accordionBody);

            // Append the item to the accordion
            accordionDiv.appendChild(accordionItem);
        });
    }
}




// Variable to store the current search option (exact match by default)
let currentSearchOption = 'contains';

// Function to change the search option
function changeSearchOption(option) {
    currentSearchOption = option;
    const dropdownButton = document.getElementById('searchOptionDropdown');
    dropdownButton.textContent = option === 'exact' ? 'Exact Match' : 'Contains';
    
    // Reset the form and clear the results
    resetForm();
}

// Function to search the dictionary
function searchDictionary() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm === "") {
        resultsDiv.innerHTML = "<p>Please enter a search term.</p>";
        return;
    }

    fetch(filePath)
        .then(response => response.json())
        .then(dictionary => {
            let searchResults;
            const processedHeadwords = new Set(); // Set to store processed headwords

            if (currentSearchOption === 'exact') {
                searchResults = dictionary.filter(entry =>
                    entry.S.some(sub_entry => {
                        const headword = sub_entry.H.toLowerCase();
                        if (!processedHeadwords.has(headword) && headword === searchTerm) {
                            processedHeadwords.add(headword);
                            return true;
                        }
                        return false;
                    })
                );
            } else if (currentSearchOption === 'contains') {
                searchResults = dictionary.filter(entry =>
                    entry.S.some(sub_entry => {
                        const headword = sub_entry.H.toLowerCase();
                        if (!processedHeadwords.has(headword) && headword.includes(searchTerm)) {
                            processedHeadwords.add(headword);
                            return true;
                        }
                        return false;
                    })
                );
            } else {
                // Invalid search option
                console.error("Invalid search option:", currentSearchOption);
                resultsDiv.innerHTML = "<p>Oops! An error occurred during the search.</p>";
                return;
            }
            displayResults(searchResults);
        })
        .catch(error => {
            console.error("Error loading the dictionary:", error);
            resultsDiv.innerHTML = "<p>Oops! An error occurred while loading the dictionary.</p>";
        });
}

