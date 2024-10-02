function loadSection(sectionName) {
    fetch(`sections/${sectionName}.html`)
        .then(response => response.text())
        .then(data => {
            document.getElementById('content-container').innerHTML = data;
            updateActiveTab(sectionName);
            attachCollapsibleEventListeners(); // Attach listeners after loading content
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

function attachCollapsibleEventListeners() {
    const collapsibleButtons = document.querySelectorAll('.collapsible');
    collapsibleButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active-collapsible');
            const content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadSection('professional_summary');
});
