document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("openSeeker").addEventListener("click", async () => {
    // Check for database connection or file existence
    const isDatabaseAvailable = await checkDatabaseConnection();
    if (!isDatabaseAvailable) {
      alert("Missing Database Connection/File! Contact to Administrator");
      return;
    }
    // Open the seeker screen
    chrome.tabs.create({
      url: chrome.runtime.getURL("pages/seeker.html"),
      active: true,
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

