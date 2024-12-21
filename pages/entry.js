import { initTagsField } from './entrytags.js';
import { initKeywordsField } from './entrykeywords.js';
import { initCrossReferencesField } from './entryreferences.js';

document.addEventListener("DOMContentLoaded", async () => {

  // Retrieve the note data from local storage
  chrome.storage.local.get("noteData", (data) => {
    if (chrome.runtime.lastError) {
      console.error("Error retrieving note data:", chrome.runtime.lastError);
      return;
    }

    if (data.noteData) {
      chrome.storage.local.get("noteData", (data) => {
        const {
          noteDate,
          noteSource,
          noteAbstract,
          notePriority,
          noteTags,
          noteKeywords,
          noteCrossReferences,
          pageTagsOptions,
          pageKeywordsOptions,
          pageCrossReferencesOptions,
          pageVersion } = data.noteData;

        // Pre-fill the form fields
        document.getElementById("noteDateTime").value = noteDate || "N/A";
        document.getElementById("noteSource").value = noteSource || "N/A";
        document.getElementById("noteAbstract").value = noteAbstract || "";
        document.getElementById("notePriorityLow").checked = notePriority === "Low";
        document.getElementById("notePriorityMedium").checked = notePriority === "Medium";
        document.getElementById("notePriorityHigh").checked = notePriority === "High";

        document.querySelector(`#notePriority${notePriority}`).checked = true;

        initTagsField(noteTags || [], pageTagsOptions || []); // Initialize tags field
        initKeywordsField(noteKeywords || [], pageKeywordsOptions || []); // Initialize keywords field
        initCrossReferencesField(noteCrossReferences || [], pageCrossReferencesOptions || []); // Initialize reference field

      });

    } else {
      console.warn("No note data found in storage.");
    }

    // Save note action
    const saveNoteButton = document.getElementById("saveNoteButton");
    saveNoteButton.addEventListener("click", () => {
      const noteTitle = document.getElementById("noteTitle").value.trim();
      const noteTagsList = Array.from(document.querySelectorAll("#noteTagsList li"));
      const noteKeywordsList = Array.from(document.querySelectorAll("#noteKeywordsList li"));

      // Validation for required fields
      let isValid = true;

      // Validate Note Title
      if (!noteTitle) {
        const noteTitleError = document.getElementById("noteTitleError");
        noteTitleError.classList.remove("d-none");
        isValid = false;
      } else {
        document.getElementById("noteTitleError").classList.add("d-none");
      }

      // Validate Note Tags
      if (noteTagsList.length === 0) {
        const noteTagsError = document.getElementById("noteTagsError");
        noteTagsError.classList.remove("d-none");
        isValid = false;
      } else {
        document.getElementById("noteTagsError").classList.add("d-none");
      }

      // Validate Note Keywords
      if (noteKeywordsList.length === 0) {
        const noteKeywordsError = document.getElementById("noteKeywordsError");
        noteKeywordsError.classList.remove("d-none");
        isValid = false;
      } else {
        document.getElementById("noteKeywordsError").classList.add("d-none");
      }

      if (!isValid) {
        return; // Stop saving if validation fails
      }

      // If valid, gather all data and save
      const noteSource = document.getElementById("noteSource").value.trim();
      const noteDateTime = document.getElementById("noteDateTime").value.trim();
      const noteAbstract = document.getElementById("noteAbstract").value.trim();
      const notePriority = document.querySelector("input[name='notePriority']:checked")?.value || "Low";

      const noteTags = noteTagsList.map((li) => li.textContent.replace(" ×", "").trim());
      const noteKeywords = noteKeywordsList.map((li) => li.textContent.replace(" ×", "").trim());
      // const noteCrossReferences = Array.from(document.querySelectorAll("#noteCrossReferencesList li")).map((li) =>
      //   li.textContent.replace(" ×", "").trim()
      // );
      const noteCrossReferences = Array.from(
        document.querySelectorAll("#noteCrossReferencesList li")
      ).map((li) => li.dataset.id);

      chrome.runtime.sendMessage(
        {
          action: "saveNote",
          noteData: {
            noteSource,
            noteDateTime,
            noteAbstract,
            noteTitle,
            notePriority,
            noteTags,
            noteKeywords,
            noteCrossReferences,
          },
        },
        (response) => {
          if (response?.status === "success") {
            alert(
              `Current Note Information is Stored against Note ID: ${response.note_Id}\n\nThis TAB will now close for the next addition.`
            );
            window.close(); // Close the tab
          } else {
            alert("Failed to save note. Please try again.");
          }
        }
      );
    });

    // Cancel button action
    const cancelButton = document.getElementById("cancelButton");
    cancelButton.addEventListener("click", () => {
      const confirmClose = confirm("Are you sure you want to close this tab? Unsaved changes will be lost.");
      if (confirmClose) {
        window.close();
      }
    });

  });
});

// Event listener for the "helpCapture" icon
document.getElementById('helpCapture').addEventListener('click', function () {
  // Fetch content from help-content.html
  fetch('help-capture.html')
    .then(response => response.text())
    .then(data => {
      // Load content into the modal
      const helpModalContent = document.getElementById('helpCaptureModalContent');
      helpModalContent.innerHTML = data;

      // Show the modal
      const helpModal = new bootstrap.Modal(document.getElementById('helpCaptureModal'));
      helpModal.show();
    })
    .catch(error => {
      console.error('Error loading help content:', error);
      document.getElementById('helpCaptureModalContent').innerHTML = `<p class="text-danger text-center">Failed to load help content. Please try again later.</p>`;
    });
});

