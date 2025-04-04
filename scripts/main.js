function loadSection(sectionName) {
    // Update the URL using history.pushState() without reloading the page
    history.pushState(null, null, `#${sectionName}`);

    // Check if sectionName is a real anchor (e.g. ecomm-search) instead of a full section
    const target = document.getElementById(sectionName);
    if (target) {
        // Scroll to anchor
        target.scrollIntoView({ behavior: 'smooth' });

        // Auto-expand the collapsible card
        const button = target.querySelector('.collapsible');
        const content = target.querySelector('.collapsible-content');
        if (button && content && content.style.display !== 'block') {
            button.classList.add('active-collapsible');
            content.style.display = 'block';
        }

        return; // Don't fetch anything
    }

    // It's an actual section to fetch
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
    // Define sections with collapsibles collapsed by default
    const collapsibleSections = ['professional_experience','creative_persuits', 'ash_bookshelf'];

    const collapsibleButtons = document.querySelectorAll('.collapsible');
    collapsibleButtons.forEach(button => {
        const content = button.nextElementSibling;

        // Collapse by default only for defined sections
        if (collapsibleSections.includes(sectionName)) {
            if (!content.classList.contains('force-open')) {
                content.style.display = "none";
            }
        }

        // Toggle on click
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

    const target = document.getElementById(sectionName);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });

        const button = target.querySelector('.collapsible');
        const content = target.querySelector('.collapsible-content');
        if (button && content && content.style.display !== 'block') {
            button.classList.add('active-collapsible');
            content.style.display = 'block';
            content.classList.add('force-open');
        }
    } else {
        loadSection(sectionName);
    }
});
