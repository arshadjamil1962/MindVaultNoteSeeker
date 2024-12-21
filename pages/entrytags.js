export function initTagsField(noteTags, pageTagsOptions) {
    // Initialize Tags
    const tagsList = document.getElementById("noteTagsList");
    const tagInput = document.getElementById("noteTagsInput");
    const tagsDatalist = document.getElementById("pageTagsOptions");

    // Load available tags in the dropdown
    (pageTagsOptions || []).forEach((tag) => {
        const option = document.createElement("option");
        option.value = tag;
        tagsDatalist.appendChild(option);
    });

    // Prefill selected tags
    (noteTags || []).forEach((tag) => addTagToList(tag, tagsList));

    // Function to convert a string to title case
    function toTitleCase(str) {
        return str
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    // Function to refresh tagsDatalist options
    function refreshTagOptions(list, allTags) {
        // Get the existing tags in the list
        const existingTags = Array.from(list.children).map((child) =>
            child.textContent.replace(" ×", "").trim()
        );

        // Clear current tagsDatalist options
        tagsDatalist.innerHTML = "";

        // Add only the tags that are not in the existing selection
        allTags
            .filter((tag) => !existingTags.includes(tag))
            .forEach((tag) => {
                const option = document.createElement("option");
                option.value = tag;
                tagsDatalist.appendChild(option);
            });
    }

    // Function to add a tag to the list
    function addTagToList(tag, list) {
        const existingTags = Array.from(list.children).map(
            (child) => child.textContent.replace(" ×", "").trim()
        );

        if (!existingTags.includes(tag)) {
            const listItem = document.createElement("li");

            listItem.textContent = tag;

            const removeButton = document.createElement("span");
            removeButton.textContent = " ×";
            removeButton.className = "remove-tag";
            removeButton.addEventListener("click", () => {
                list.removeChild(listItem);
                refreshTagOptions(list, pageTagsOptions); // Refresh tagsDatalist when a tag is removed
            });

            listItem.appendChild(removeButton);
            list.appendChild(listItem);

            refreshTagOptions(list, pageTagsOptions); // Refresh tagsDatalist after adding a tag
        }
    }

    // Add a tag on selection from input
    tagInput.addEventListener("change", () => {
        const newTag = tagInput.value.trim();
        // const newTagTitleCase = toTitleCase(newTag);
        if (newTag) {
            // Add the new tag to the tag list
            addTagToList(newTag, tagsList);

            // Add the new tag to the options list if not already there
            if (!pageTagsOptions.includes(newTag)) {
                pageTagsOptions.push(newTag);
            }

            tagInput.value = ""; // Clear input after adding the tag
        }
    });
};