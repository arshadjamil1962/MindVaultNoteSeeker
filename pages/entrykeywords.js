export function initKeywordsField(noteKeywords, pageKeywordsOptions) {
    // Initialize Keywords
    const keywordsList = document.getElementById("noteKeywordsList");
    const keywordsInput = document.getElementById("noteKeywordsInput");
    const KeywordsDatalist = document.getElementById("pageKeywordsOptions");

    // Load available keywords in the dropdown
    (pageKeywordsOptions || []).forEach((keyword) => {
        const option = document.createElement("option");
        option.value = keyword;
        KeywordsDatalist.appendChild(option);
    });

    // Prefill selected keywords
    (noteKeywords || []).forEach((keyword) => addKeywordToList(keyword, keywordsList));

    // Function to convert a string to title case
    function toTitleCase(str) {
        return str
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    // Function to refresh KeywordsDatalist options
    function refreshKeywordOptions(list, allKeywords) {
        // Get the existing keywords in the list
        const existingKeywords = Array.from(list.children).map((child) =>
            child.textContent.replace(" ×", "").trim()
        );

        // Clear current KeywordsDatalist options
        KeywordsDatalist.innerHTML = "";

        // Add only the keywords that are not in the existing selection
        allKeywords
            .filter((keyword) => !existingKeywords.includes(keyword))
            .forEach((keyword) => {
                const option = document.createElement("option");
                option.value = keyword;
                KeywordsDatalist.appendChild(option);
            });
    }

    // Function to add a keyword to the list
    function addKeywordToList(keyword, list) {
        const existingKeywords = Array.from(list.children).map(
            (child) => child.textContent.replace(" ×", "").trim()
        );

        if (!existingKeywords.includes(keyword)) {
            const listItem = document.createElement("li");

            listItem.textContent = keyword;

            const removeButton = document.createElement("span");
            removeButton.textContent = " ×";
            removeButton.className = "remove-keyword";
            removeButton.addEventListener("click", () => {
                list.removeChild(listItem);
                refreshKeywordOptions(list, pageKeywordsOptions); // Refresh KeywordsDatalist when a keyword is removed
            });

            listItem.appendChild(removeButton);
            list.appendChild(listItem);

            refreshKeywordOptions(list, pageKeywordsOptions); // Refresh KeywordsDatalist after adding a keyword
        }
    }

    // Add a keyword on selection from input
    keywordsInput.addEventListener("change", () => {
        const newKeyword = keywordsInput.value.trim();
        // const newKeywordTitleCase = toTitleCase(newKeyword);
        if (newKeyword) {
            // Add the new keyword to the keyword list
            addKeywordToList(newKeyword, keywordsList);

            // Add the new keyword to the options list if not already there
            if (!pageKeywordsOptions.includes(newKeyword)) {
                pageKeywordsOptions.push(newKeyword);
            }

            keywordsInput.value = ""; // Clear input after adding the keyword
        }
    });
};