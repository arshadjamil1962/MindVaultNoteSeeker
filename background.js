chrome.action.onClicked.addListener(() => {
  // Open the seeker screen
  chrome.tabs.create({
    url: chrome.runtime.getURL("pages/seeker.html"),
    active: true
  });
});

// Listener for extension installation or update
chrome.runtime.onInstalled.addListener(async () => {
  // Remove existing menu items to avoid duplicates
  chrome.contextMenus.removeAll(() => {
    // Create the context menu item
    chrome.contextMenus.create({
      id: "mindVaultNote",
      title: "Mind Vault Note Addition",
      contexts: ["selection"],
    });
  });
});

// Function to simulate database connection check
async function checkDatabaseConnection() {
  try {
    const response = await fetch("http://localhost:3009/api/health"); // API endpoint for health check
    if (!response.ok) throw new Error("Database not reachable");
    const result = await response.json();
    return result.status === "healthy"; // Example: { status: "healthy" }
  } catch (error) {
    // console.error("Database connection check failed:", error);
    return false;
  }
}

function showNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: chrome.runtime.getURL("icons/icon128.png"), // Adjust the path if needed
    title: title,
    message: message,
    priority: 2,
  });
}

// Fetch tags, keywords, and cross-references using the API
async function fetchOptionsFromAPI() {
  try {
    const response = await fetch("http://localhost:3009/api/getData");
    const data = await response.json();

    return {
      pageTagsOptions: data.tags || [],
      pageKeywordsOptions: data.keywords || [],
      pageCrossReferencesOptions: data.crossReferences || [], // Note: Returns {note_Id, note_Title}
    };
  } catch (error) {
    console.error("Error fetching data from API:", error);
    return { pageTagsOptions: [], pageKeywordsOptions: [], pageCrossReferencesOptions: [] };
  }
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "mindVaultNote") {
    // Check for database connection or file existence
    const isDatabaseAvailable = await checkDatabaseConnection();
    if (!isDatabaseAvailable) {
      showNotification("Error", "Missing Database Connection/File! Contact Administrator");
      return;
    }
    //List to be populated from Database Master Tables
    // const pageTagsOptions = ["SEO", "Web Development", "Marketing", "WordPress", "Full Stack"]; // Available tags
    // const pageKeywordsOptions = ["optimization", "content quality", "user engagement"]; // Available Keywords

    // Fetch data using the API
    const { pageTagsOptions, pageKeywordsOptions, pageCrossReferencesOptions } = await fetchOptionsFromAPI();
    const pageVersion = "ver 1.00";

    const noteDate = new Date().toLocaleString('en-GB', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'
    });  // Format the current date and time
    const noteSource = tab.url;  // Get the URL of the page where the note was created
    const selectedText = info.selectionText || "";
    const noteAbstract = selectedText; //selectedText.slice(0, 500);  // Limit summary to 500 characters
    const notePriority = "Low";  // Set default priority to Low
    const noteTags = []; // Default tag
    const noteKeywords = []; // Default Keywords
    const noteCrossReferences = []; // CrossReferences

    // Open the entry screen and pass pre-filled data through local storage
    chrome.storage.local.set({
      noteData: {
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
        pageVersion
      }
    });

    chrome.tabs.create({
      url: chrome.runtime.getURL("pages/entry.html"),
      active: true
    });
  }
});


// Listen for save request from entry.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "saveNote") {
    (async () => {
      try {
        console.log("Saving note data:", message.noteData);

        // Call the API to save the note
        const response = await fetch("http://localhost:3009/api/saveNote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message.noteData),
        });

        const result = await response.json();

        if (response.ok) {
          console.log("Note saved successfully with note_Id:", result.note_Id);
          sendResponse({ status: "success", note_Id: result.note_Id });
        } else {
          console.error("Error saving note:", result);
          sendResponse({ status: "error", message: "Failed to save note." });
        }
      } catch (error) {
        console.error("Error saving note:", error);
        sendResponse({ status: "error", message: "An error occurred while saving the note." });
      }
    })();

    // Return true to indicate asynchronous processing
    return true;
  }

  if (message.action === "fetchOptions") {
    (async () => {

      try {
        const { pageTagsOptions, pageKeywordsOptions } = await fetchOptionsFromAPI();
        sendResponse({ pageTagsOptions, pageKeywordsOptions });
      } catch (error) {
        console.error("Error fetching options:", error);
        sendResponse({ pageTagsOptions: [], pageKeywordsOptions: [] });
      }
    })();

    // Return true to indicate asynchronous processing
    return true;
  }

});

