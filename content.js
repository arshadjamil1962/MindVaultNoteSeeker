// Listen for messages from popup.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // console.log('Content.js');
    if (request.action === 'showHelpModal') {
        // Inject the modal into the webpage
        showSummaryModal(request.text2Modl);
    }
});

function showSummaryModal(htmlContent) {
    // Check if modal already exists to avoid duplicating it
    let existingModal = document.getElementById('contract-summary-modal');
    if (!existingModal) {
        // Create the modal element
        const modal = document.createElement('div');
        modal.id = 'contract-summary-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
        modal.style.display = 'none';
        modal.style.zIndex = '1000';
        modal.style.overflow = 'hidden'; // Hide overflow for the modal itself

        // Add CSS styles for padding
        const style = document.createElement('style');
        style.innerHTML = `
          #contract-summary-modal h2,
          #contract-summary-modal h3,
          #contract-summary-modal h4,
          #contract-summary-modal p,
          #contract-summary-modal li {
              padding-top: 0px !important;
              margin: 0px 0px!important; 
          }
      `;
        document.head.appendChild(style);

        const modalContent = document.createElement('div');
        modalContent.style.backgroundColor = '#fff';
        modalContent.style.margin = '5% auto';
        modalContent.style.padding = '10px';
        modalContent.style.border = '1px solid #888';
        modalContent.style.width = '80%';
        // modalContent.style.height = '80%';
        modalContent.style.maxHeight = '-webkit-fill-available';
        modalContent.style.overflowY = 'auto';

        const closeButton = document.createElement('span');
        closeButton.textContent = '×';
        closeButton.style.color = 'rgb(217 16 16)';
        closeButton.style.float = 'right';
        closeButton.style.margin = '-10px 5px';
        closeButton.style.fontSize = '28px';
        closeButton.style.fontWeight = 'bold';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = () => {
            document.body.removeChild(modal);
        };

        const summaryContent = document.createElement('div');
        summaryContent.id = 'modal-summary-content';
        summaryContent.style.padding = '15px';
        summaryContent.style.backgroundColor = '#f1f1f1';
        summaryContent.innerHTML = `
        <div>${htmlContent}</div>
        <button id="close-summary-modal" 
        style="border: none;
        color: white;
        padding: 10px 30px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        float: inline-end;
        font-size: 16px;
        margin: 0px -20px;
        cursor: pointer;
        background-color: #fb2303;
        border-radius: 20px;
        box-shadow: 5px 5px 4px #888888;">Close</button>
        `;

        modalContent.appendChild(closeButton);
        modalContent.appendChild(summaryContent);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        // Show the modal when the backend processing starts
        modal.style.display = 'block';

        // Close button logic
        document.getElementById('close-summary-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });


    } else {
        existingModal.style.display = 'block';
    }
}
