document.addEventListener("DOMContentLoaded", async () => {
  const openSeekerButton = document.getElementById("openSeeker");
  const dataConnectionButton = document.getElementById("dataConnection");
  openSeekerButton.style.display = "none";

  // Check the database connection on load
  const isDatabaseAvailable = await checkDatabaseConnection();

  if (isDatabaseAvailable) {
    // If database is available, show the "Seeker Open" button and hide "Data Connection" button
    openSeekerButton.style.display = "block";
    dataConnectionButton.style.display = "none";
  } else {
    // If there's an error, show the "Data Connection" button and hide "Seeker Open" button
    openSeekerButton.style.display = "none";
    dataConnectionButton.style.display = "block";
  }

  // Event listener for "Open Seeker" button
  openSeekerButton.addEventListener("click", async () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("pages/seeker.html"),
      active: true,
    });
  });

  // Event listener for "Data Connection" button
  dataConnectionButton.addEventListener("click", () => {
    alert("Check BackEnd Server / Data File Or Contact Administrator");
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
    console.error("Database connection check failed:", error);
    return false;
  }
}

// ////////////////////////////////////////////////////////////////////////////////////////////////////
// Help
// Event Function to handle the click event
document.getElementById('helpButton').addEventListener('click', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
      window.close();
      //Display Information to close active window
      alert("Open Mind Valut - Notes Seeker, Notes Collection Screen and CLICK the Help Icon");
  });
});

