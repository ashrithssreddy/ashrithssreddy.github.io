
function loadSection(sectionName) {
    // Update the URL using history.pushState() without reloading the page
    history.pushState(null, null, `#${sectionName}`);

    // Check if sectionName is a real anchor (e.g. ecomm-search) instead of a full section
    const anchor = document.getElementById(sectionName);
    if (anchor) {
        // It's just an anchor — scroll and expand if collapsible
        anchor.scrollIntoView({ behavior: 'smooth' });

        const button = anchor.querySelector('.collapsible');
        const content = anchor.querySelector('.collapsible-content');

        if (button && content && content.style.display !== 'block') {
            button.classList.add('active-collapsible');
            content.style.display = 'block';
        }
        return;
    }

    // Else fetch section dynamically
    fetch(`sections/${sectionName}.html`)
        .then(response => response.text())
        .then(data => {
            document.getElementById('content-container').innerHTML = data;
            updateActiveTab(sectionName);
            attachCollapsibleEventListeners(sectionName);
        })
        .catch(error => console.error('Error loading section:', error));
}

function updateActiveTab(sectionName) {
    let tabs = document.getElementsByClassName('tab');
    for (let tab of tabs) {
        tab.classList.remove('active');
        if (tab.getAttribute('onclick').includes(sectionName)) {
            tab.classList.add('active');
        }
    }
}

function attachCollapsibleEventListeners(sectionName) {
    // Define an array of sections that should have their collapsibles collapsed by default
    const collapsibleSections = ['professional_experience', 'creative_persuits', 'ash_bookshelf'];

    const collapsibleButtons = document.querySelectorAll('.collapsible');
    collapsibleButtons.forEach(button => {
        const content = button.nextElementSibling;

        if (collapsibleSections.includes(sectionName)) {
            content.style.display = "none"; // Set initial state to 'none'
        }

        // Add click event listener to toggle collapse
        button.addEventListener('click', function () {
            this.classList.toggle('active-collapsible');
            content.style.display = (content.style.display === "none" || content.style.display === "") ? "block" : "none";
        });
    });
}

// Handle back and forward browser buttons
window.addEventListener('popstate', function() {
    const sectionName = location.hash ? location.hash.substring(1) : 'professional_summary';
    loadSection(sectionName);
});

// Initial load based on the URL hash
document.addEventListener('DOMContentLoaded', () => {
    const sectionName = location.hash ? location.hash.substring(1) : 'professional_summary';
    loadSection(sectionName);
});
