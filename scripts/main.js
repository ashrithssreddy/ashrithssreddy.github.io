function loadSection(sectionName) {
    // Update the URL using history.pushState() without reloading the page
    history.pushState(null, null, `#${sectionName}`);

    // Fetch the section content dynamically
    // Check if sectionName is a real anchor (e.g. ecomm-search) instead of a full section
    if (document.getElementById(sectionName)) {
        // It's just an anchor — don't fetch, just scroll
        document.getElementById(sectionName).scrollIntoView({ behavior: 'smooth' });
    } else {
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
    const collapsibleSections = ['professional_experience','creative_persuits', 'ash_bookshelf'];
    // do not collapse: ,'education'

    if (collapsibleSections.includes(sectionName)) {
        const collapsibleButtons = document.querySelectorAll('.collapsible');
        collapsibleButtons.forEach(button => {
            const content = button.nextElementSibling;
            content.style.display = "none"; // Set initial state of collapsible content to 'none'

            // Add click event listener to toggle collapse
            button.addEventListener('click', function () {
                this.classList.toggle('active-collapsible');
                content.style.display = (content.style.display === "none" || content.style.display === "") ? "block" : "none";
            });
        });
    } else {
        const collapsibleButtons = document.querySelectorAll('.collapsible');
        collapsibleButtons.forEach(button => {
            const content = button.nextElementSibling;

            // Add click event listener to toggle collapse
            button.addEventListener('click', function () {
                this.classList.toggle('active-collapsible');
                content.style.display = (content.style.display === "none" || content.style.display === "") ? "block" : "none";
            });
        });
    }
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