export function initCrossReferencesField(noteCrossReferences, pageCrossReferencesOptions) {

    // Initialize references
    const referencesList = document.getElementById("noteCrossReferencesList");
    const referencesInput = document.getElementById("noteCrossReferencesInput");
    const ReferencesDatalist = document.getElementById("pageCrossReferencesOptions");

    // Load available references in the dropdown
    ReferencesDatalist.innerHTML = ""; // Clear existing options

    (pageCrossReferencesOptions || []).forEach((ref) => {
        const option = document.createElement("option");
        option.value = ref.note_Title; // Display title to the user
        option.setAttribute("data-id", ref.note_Id); // Store note_Id
        ReferencesDatalist.appendChild(option);
    });

    // Prefill selected references
    (noteCrossReferences || []).forEach((reference) => addReferenceToList(reference, referencesList));

    // Function to convert a string to title case
    function toTitleCase(str) {
        return str
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    // Function to refresh ReferencesDatalist options
    function refreshReferenceOptions(list, allReferences) {
        // Get the existing references in the list based on note_Id
        const existingReferences = Array.from(list.children).map((child) => child.dataset.id);

        // Clear current ReferencesDatalist options
        ReferencesDatalist.innerHTML = "";

        // Add only the references that are not in the existing selection
        allReferences
            .filter((reference) => !existingReferences.includes(reference.note_Id.toString()))
            .forEach((reference) => {
                const option = document.createElement("option");
                option.value = reference.note_Title; // Display the note title
                option.setAttribute("data-id", reference.note_Id.toString()); // Store the note ID
                ReferencesDatalist.appendChild(option);
            });
    }

    // Function to add a reference to the list
    function addReferenceToList(reference, list) {

        const noteId = reference.getAttribute("data-id");
        const inputValue = reference.getAttribute("value");

        // Check for duplicates
        const existingReferences = [...list.children].some((li) => li.dataset.id === noteId);
        if (!existingReferences) {
            const listItem = document.createElement("li");
            listItem.textContent = inputValue; // Show title
            listItem.dataset.id = noteId; // Store note_Id

            //   listItem.innerHTML += ' <button class="btn btn-danger btn-sm ms-2">×</button>';
            const removeButton = document.createElement("span");
            removeButton.textContent = " ×";
            removeButton.className = "remove-reference";
            removeButton.addEventListener("click", () => {
                list.removeChild(listItem);
                refreshReferenceOptions(list, pageCrossReferencesOptions); // Refresh tagsDatalist when a tag is removed
            });

            listItem.appendChild(removeButton);

            list.appendChild(listItem);

            refreshReferenceOptions(list, pageCrossReferencesOptions); // Refresh ReferenceDatalist after adding a reference
        }
    }

    // Add a reference on selection from input
    referencesInput.addEventListener("change", (event) => {
        const inputValue = event.target.value.trim();
        const newReference = [...document.querySelectorAll("#pageCrossReferencesOptions option")].find(
            (opt) => opt.value === inputValue
        );

        if (newReference) {
            // Add the new reference to the reference list
            addReferenceToList(newReference, referencesList);

            referencesInput.value = ""; // Clear input after adding the reference
        }
    });
};