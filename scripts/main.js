function loadSection(sectionName) {
    fetch(`sections/${sectionName}.html`)
        .then(response => response.text())
        .then(data => {
            document.getElementById('content-container').innerHTML = data;
            updateActiveTab(sectionName);
            attachCollapsibleEventListeners(sectionName); // Pass the section name
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
    const collapsibleSections = ['certifications', 'education', 'experience','ashrith_bookshelf']; // Add or remove section names as needed

    // Possible section names based on the tabs in your website:
    // 'professional_summary', 'experience', 'skills', 'creative_persuits', 'education',
    // 'ashrith_bookshelf', 'certifications', 'personal', 'contact'

    // Check if the current section is in the collapsibleSections array
    if (collapsibleSections.includes(sectionName)) {
        const collapsibleButtons = document.querySelectorAll('.collapsible');
        collapsibleButtons.forEach(button => {
            // Set initial state of collapsible content to 'none' (collapsed)
            const content = button.nextElementSibling;
            content.style.display = "none";
            
            // Add click event listener to toggle collapse
            button.addEventListener('click', function() {
                this.classList.toggle('active-collapsible');
                
                // Toggle content visibility
                if (content.style.display === "none" || content.style.display === "") {
                    content.style.display = "block";
                } else {
                    content.style.display = "none";
                }
            });
        });
    } else {
        // For sections not in collapsibleSections, still attach the event listeners for their collapsibles
        const collapsibleButtons = document.querySelectorAll('.collapsible');
        collapsibleButtons.forEach(button => {
            const content = button.nextElementSibling;
            
            // Add click event listener to toggle collapse
            button.addEventListener('click', function() {
                this.classList.toggle('active-collapsible');
                
                // Toggle content visibility
                if (content.style.display === "none" || content.style.display === "") {
                    content.style.display = "block";
                } else {
                    content.style.display = "none";
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadSection('professional_summary');
});
