// Global variables to track pagination state
let currentPage = 1;
const recordsPerPage = 4;

document.addEventListener("DOMContentLoaded", () => {
  // Fetch master data and populate the table
  fetchMasterData();
  // Call populateFilterFields on page load
  populateFilterFields();

  // Get filter fields and buttons
  const filterTitleDom = document.getElementById("filterTitle");
  const filterAbstractDom = document.getElementById("filterAbstract");
  const filterDateFromDom = document.getElementById("filterDateFrom");
  const filterDateToDom = document.getElementById("filterDateTo");
  const filterTagsDom = document.getElementById("filterTags");
  const filterKeywordsDom = document.getElementById("filterKeywords");
  const filterPriorityDom = document.getElementById("filterPriority");

  const applyFiltersButton = document.getElementById("applyFilters");
  const clearFiltersButton = document.getElementById("clearFilters");

  // Event listener for "Apply Filters" button
  applyFiltersButton.addEventListener("click", () => {

    // Reset pagination to the first page
    currentPage = 1;
    const filters = {
      filterTitle: filterTitleDom.value.trim(),
      filterAbstract: filterAbstractDom.value.trim(),
      filterDateFrom: filterDateFromDom.value,
      filterDateTo: filterDateToDom.value,
      filterTags: filterTagsDom.value.trim(),
      filterKeywords: filterKeywordsDom.value.trim(),
      filterPriority: filterPriorityDom.value.trim(),
    };

    // Highlight inputs with values
    const highlightFields = [
      { field: filterTitleDom, value: filters.filterTitle },
      { field: filterAbstractDom, value: filters.filterAbstract },
      { field: filterDateFromDom, value: filters.filterDateFrom },
      { field: filterDateToDom, value: filters.filterDateTo },
      { field: filterTagsDom, value: filters.filterTags },
      { field: filterKeywordsDom, value: filters.filterKeywords },
      { field: filterPriorityDom, value: filters.filterPriority },
    ];

    highlightFields.forEach(({ field, value }) => {
      if (value !== "") {
        field.classList.add("bg-warning");
      } else {
        field.classList.remove("bg-warning");
      }
    });

    // Fetch filtered master data
    fetchMasterData(filters);

  });

  // Event listener for "Clear Filters" button
  clearFiltersButton.addEventListener("click", () => {
    // Reset pagination to the first page
    currentPage = 1;

    // Clear filter fields
    filterTitleDom.value = "";
    filterAbstractDom.value = "";
    filterDateFromDom.value = "";
    filterDateToDom.value = "";
    filterTagsDom.value = "";
    filterKeywordsDom.value = "";
    filterPriorityDom.value = "";

    // Remove bg-warning class
    filterTitleDom.classList.remove("bg-warning");
    filterAbstractDom.classList.remove("bg-warning");
    filterDateFromDom.classList.remove("bg-warning");
    filterDateToDom.classList.remove("bg-warning");
    filterTagsDom.classList.remove("bg-warning");
    filterKeywordsDom.classList.remove("bg-warning");
    filterPriorityDom.classList.remove("bg-warning");

    // Fetch all master data
    fetchMasterData();

  });
});

// Event listener for the "helpContent" icon
document.getElementById('helpContent').addEventListener('click', function () {
  // Fetch content from help-content.html
  fetch('help-content.html')
    .then(response => response.text())
    .then(data => {
      // Load content into the modal
      const helpModalContent = document.getElementById('helpModalContent');
      helpModalContent.innerHTML = data;

      // Show the modal
      const helpModal = new bootstrap.Modal(document.getElementById('helpModal'));
      helpModal.show();
    })
    .catch(error => {
      console.error('Error loading help content:', error);
      document.getElementById('helpModalContent').innerHTML = `<p class="text-danger text-center">Failed to load help content. Please try again later.</p>`;
    });
});

// Function to populate tags and keywords filter fields
async function populateFilterFields() {
  try {
    // Fetch options from the background script
    const { pageTagsOptions, pageKeywordsOptions } = await chrome.runtime.sendMessage({ action: "fetchOptions" });
    const pagePriorityOptions = ['Low', 'Medium', 'High'];

    // Populate Tags Filter
    const tagsDatalist = document.getElementById("pageTagsOptions");
    tagsDatalist.innerHTML = ""; // Clear existing options
    pageTagsOptions.forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag;
      tagsDatalist.appendChild(option);
    });

    // Populate Keywords Filter
    const keywordsDatalist = document.getElementById("pageKeywordsOptions");
    keywordsDatalist.innerHTML = ""; // Clear existing options
    pageKeywordsOptions.forEach((keyword) => {
      const option = document.createElement("option");
      option.value = keyword;
      keywordsDatalist.appendChild(option);
    });

    // Populate Priority Filter
    const priorityDatalist = document.getElementById("pagePriorityOptions");
    priorityDatalist.innerHTML = ""; // Clear existing options
    pagePriorityOptions.forEach((priority) => {
      const option = document.createElement("option");
      option.value = priority;
      priorityDatalist.appendChild(option);
    });

    // console.log("Filter fields populated successfully.");
  } catch (error) {
    console.error("Error populating filter fields:", error);
  }
}

// Function to fetch filtered or all master data
async function fetchMasterData(filters = {}) {
  try {
    // Define the API endpoint URL
    const apiUrl = "http://localhost:3009/api/getFilteredMasterData";

    // Add pagination parameters to filters
    filters.offset = (currentPage - 1) * recordsPerPage;
    filters.limit = recordsPerPage;

    // Construct query parameters based on filters
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams ? `${apiUrl}?${queryParams}` : apiUrl;

    // Make a GET request to fetch the data
    const response = await fetch(url);

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    // Parse the JSON response
    const { data, totalRecords } = await response.json();

    // Ensure the data is an array
    if (!Array.isArray(data)) {
      throw new Error("Invalid data format received from the server.");
    }

    // Populate the master table with the fetched data
    populateMasterTable(data, totalRecords, filters);
  } catch (error) {
    console.error("Error fetching master data:", error);
  }
}


// Function to populate the master table
function populateMasterTable(data, totalRecords, filters) {
  // Get the master records container
  const masterRecordsContainer = document.getElementById("masterRecordsContainer");

  // Clear any existing records
  masterRecordsContainer.innerHTML = "";

  if (totalRecords === 0) {
    masterRecordsContainer.style.marginTop = "50px";
    // Display the "No Records" image if there are no records
    const noRecordsImage = document.createElement("img");
    noRecordsImage.src = "/icons/norecords.png";
    noRecordsImage.alt = "No Records Found";
    noRecordsImage.style.display = "block";
    noRecordsImage.style.margin = "auto";
    noRecordsImage.style.maxWidth = "100%";
    noRecordsImage.style.height = "auto";
    
    masterRecordsContainer.appendChild(noRecordsImage);

    // Clear existing controls
    const paginationContainer = document.getElementById("paginationControls");
    paginationContainer.innerHTML = "";
  
    return; // Stop further processing since there are no records
  }

  // masterRecordsContainer.style.height = "400px";
  // Loop through the data and create record divs
  data.forEach((note, index) => {
    const recordDiv = document.createElement("div");
    recordDiv.className = "record border rounded p-2 mb-2";
    // recordDiv.style.cursor = "pointer";

    const formattedDate = formatDate(note.note_DateTime);

    // Populate the record structure
    recordDiv.innerHTML = `
      <div id="note-title-date" class="d-flex justify-content-between mb-1">
        <span class="fw-bold">
          <i class="bi bi-file-earmark-x" id="delete-icon" style="cursor: pointer; color:red; font-size:x-large" title="Delete Note"></i>
          ${note.note_Title}
        </span>
        <span class="text-muted">${formattedDate}</span>
      </div>
      <div id="source-abstract" style="cursor: pointer;">
        <div class="d-flex justify-content-between mb-1">
          <span class="text-truncate">${note.note_Source || "N/A"}</span>
          <span class="badge ${note.note_Priority === 'High' ? 'bg-danger' : note.note_Priority === 'Medium' ? 'bg-warning' : 'bg-success'}">
            ${note.note_Priority || "N/A"}
          </span>
        </div>
        <div class="text-truncate">${note.note_Abstract || "No abstract provided"}</div>
      </div>
    `;

    // Add event listener for source-abstract div
    const sourceAbstractDiv = recordDiv.querySelector("#source-abstract");
    sourceAbstractDiv.addEventListener("click", () => {
      populateDetailSection(note); // Trigger detail view
    });

    // Add event listener for delete icon
    const deleteIcon = recordDiv.querySelector("#delete-icon");
    deleteIcon.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent triggering the recordDiv click event
      deleteDetailSection(note, filters); // Trigger delete action
    });

    // Append the record to the container
    masterRecordsContainer.appendChild(recordDiv);

  });

  // Update pagination controls
  updatePaginationControls(totalRecords, filters);
}

// Function to populate the detail section
function populateDetailSection(note) {
  // Populate the detail fields with data from the selected note
  document.getElementById("detailTitle").textContent = note.note_Title + " - " + note.note_Id || "N/A";
  document.getElementById("detailDate").textContent = formatDate(note.note_DateTime);
  document.getElementById("detailPriority").textContent = note.note_Priority || "N/A";
  const detailSource = document.getElementById("detailSource");
  detailSource.textContent = note.note_Source || "N/A";
  detailSource.href = note.note_Source || "#";
  document.getElementById("detailAbstract").textContent = note.note_Abstract || "N/A";

  // Populate tags
  const detailTags = document.getElementById("detailTags");
  detailTags.innerHTML = ""; // Clear existing tags
  (note.note_Tags || "").split(",").forEach((tag) => {
    if (tag.trim()) {
      const tagButton = document.createElement("button");
      tagButton.textContent = tag.trim();
      tagButton.className = "btn btn-sm btn-outline-primary me-1 mb-1";
      detailTags.appendChild(tagButton);
    }
  });

  // Populate keywords
  const detailPriority = document.getElementById("detailKeywords");
  detailKeywords.innerHTML = ""; // Clear existing keywords
  (note.note_Keywords || "").split(",").forEach((keyword) => {
    if (keyword.trim()) {
      const keywordButton = document.createElement("button");
      keywordButton.textContent = keyword.trim();
      keywordButton.className = "btn btn-sm btn-outline-success me-1 mb-1";
      detailKeywords.appendChild(keywordButton);
    }
  });

  // Populate cross-references
  populateDetailCrossReferences(note.note_CrossReference || "");

  // Show the modal
  const detailModal = new bootstrap.Modal(document.getElementById("detailModal"));
  detailModal.show();
}

function updatePaginationControls(totalRecords, filters) {
  const paginationContainer = document.getElementById("paginationControls");

  // Clear existing controls
  paginationContainer.innerHTML = "";

  // Calculate total pages
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const pageRecordStart = ((currentPage - 1) * recordsPerPage) + 1;
  const pageRecordEnds = ((currentPage * recordsPerPage) > totalRecords) ? totalRecords : (currentPage * recordsPerPage);

  // Create "Top" button
  const topButton = document.createElement("button");
  topButton.textContent = "1   <<";
  topButton.className = "btn btn-info me-2";
  topButton.disabled = currentPage === 1;
  topButton.addEventListener("click", () => {
    currentPage = 1; // 1st page number
    fetchMasterData(filters); // Fetch data for the new page
  });

  // Create "Previous" button
  const prevButton = document.createElement("button");
  prevButton.textContent = `< Previous ${pageRecordStart}`;
  prevButton.className = "btn btn-dark me-2";
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener("click", () => {
    currentPage--; // Decrement page number
    fetchMasterData(filters); // Fetch data for the new page
  });

  // Create "Next" button
  const nextButton = document.createElement("button");
  nextButton.textContent = `${pageRecordEnds} Next >`;
  nextButton.className = "btn btn-dark";
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener("click", () => {
    currentPage++; // Increment page number
    fetchMasterData(filters); // Fetch data for the new page
  });

  // Create "Last" button
  const lastButton = document.createElement("button");
  lastButton.textContent = `>>  ${totalRecords}`;
  lastButton.className = "btn btn-info me-2";
  lastButton.disabled = currentPage === totalPages;
  lastButton.addEventListener("click", () => {
    currentPage = totalPages; // Last page number
    fetchMasterData(filters); // Fetch data for the new page
  });

  // Add page info
  const pageInfo = document.createElement("span");
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  pageInfo.className = "mx-3 align-self-center";

  // Append buttons to the pagination container
  paginationContainer.appendChild(topButton);
  paginationContainer.appendChild(prevButton);
  paginationContainer.appendChild(pageInfo);
  paginationContainer.appendChild(nextButton);
  paginationContainer.appendChild(lastButton);

}

// Helper function to format the date
function formatDate(dateString) {
  const options = { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" };
  return new Date(dateString).toLocaleString("en-US", options).replace(",", "");
}

// Example usage when populating detail section
async function populateDetailCrossReferences(note_CrossReference) {
  // Extract the note_CrossReference (comma-separated list of note_Id)
  const crossReferenceIds = note_CrossReference
    ? note_CrossReference.split(",").map((id) => id.trim())
    : [];

  if (crossReferenceIds.length === 0) {
    // If no cross-references exist, clear and exit
    document.getElementById("detailCrossReferences").innerHTML = "None";
    return;
  }

  // Fetch cross-referenced notes
  const crossReferencedNotes = await fetchDetailedCrossReferencedNotes(crossReferenceIds);

  // Render cross-references as clickable links
  const crossReferenceContainer = document.getElementById("detailCrossReferences");
  crossReferenceContainer.innerHTML = ""; // Clear existing content

  crossReferencedNotes.forEach((reference, index) => {
    // Create unique ID for each accordion item based on index
    const referenceId = `referenceAccordion${index}`;
    const referenceCollapseId = `collapseReference${index}`;

    // Create the accordion structure for each reference
    const referenceItem = document.createElement("div");
    referenceItem.classList.add("accordion-item");

    // Format the date as "Thu 5, Dec 2024 13:00:00"
    const formattedDate = new Date(reference.note_DateTime).toLocaleString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    referenceItem.innerHTML = `
    <h2 class="accordion-header" id="${referenceId}">
      <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#${referenceCollapseId}" aria-expanded="false" aria-controls="${referenceCollapseId}">
        ${reference.note_Title} | ${formattedDate}
      </button>
    </h2>
    <div id="${referenceCollapseId}" class="accordion-collapse collapse" aria-labelledby="${referenceId}" data-bs-parent="#detailCrossReferences">
      <div class="accordion-body">
        <p><strong>Source:</strong> <a href="${reference.note_Source}" target="_blank">${reference.note_Source}</a></p>
        <p><strong>Abstract:</strong> ${reference.note_Abstract}</p>
      </div>
    </div>
  `;

    // Append the accordion item to the references container
    crossReferenceContainer.appendChild(referenceItem);
  });
}

// Function to fetch cross-referenced notes
async function fetchDetailedCrossReferencedNotes(noteIds) {
  try {
    const response = await fetch("http://localhost:3009/api/getDetailedCrossReferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ noteIds }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch cross-referenced notes");
    }

    const crossReferences = await response.json();
    return crossReferences;
  } catch (error) {
    console.error("Error fetching cross-referenced notes:", error);
    return [];
  }
}

function deleteDetailSection(note, filters) {
  // Create a modal element
  const modal = document.createElement("div");
  modal.classList.add("modal", "fade");
  modal.id = "deleteConfirmationModal";
  modal.tabIndex = -1;
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Confirm Deletion</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p><strong>Title:</strong> ${note.note_Title}</p>
          <p><strong>Date:</strong> ${formatDate(note.note_DateTime)}</p>
          <p><strong>Source:</strong> ${note.note_Source || "N/A"}</p>
          <p><strong>Abstract:</strong> ${note.note_Abstract || "No abstract provided"}</p>
        </div>
      <div class="modal-footer d-flex justify-content-between align-items-center">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <p class="mb-0">Sure you want to delete this note?</p>
        <button id="confirmDelete" type="button" class="btn btn-danger">Confirm Delete</button>
      </div>
      </div>
    </div>
  `;

  // Append the modal to the body
  document.body.appendChild(modal);

  // Show the modal
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();

  // Add event listener for the "Confirm Delete" button
  const confirmDeleteBtn = modal.querySelector("#confirmDelete");
  confirmDeleteBtn.addEventListener("click", async () => {
    try {
      // Make API call to delete the note
      const response = await fetch("http://localhost:3009/api/deleteNote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note_Id: note.note_Id }),
      });

      if (response.ok) {
        alert("Note deleted successfully!");

        bootstrapModal.hide();
        modal.remove(); // Remove the modal from the DOM
        // Add logic here to refresh the list or remove the deleted note from the UI
        // Fetch filtered master data
        currentPage = 1; // 1st page number
        fetchMasterData(filters);
      } else {
        const error = await response.json();
        alert(`Error deleting note: ${error.message}`);
      }
    } catch (err) {
      console.error("Error deleting note:", err);
      alert("An error occurred while deleting the note.");
    }
  });

  // Add event listener to clean up the modal when dismissed
  modal.addEventListener("hidden.bs.modal", () => {
    modal.remove();
  });
}
