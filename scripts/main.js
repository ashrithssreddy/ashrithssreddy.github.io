function loadSection(sectionName) {
    // Update the URL using history.pushState() without reloading the page
    history.pushState(null, null, `#${sectionName}`);

    // Fetch the section content dynamically
    fetch(`sections/${sectionName}.html`)
        .then(response => response.text())
        .then(data => {
            document.getElementById('content-container').innerHTML = data;
            updateActiveTab(sectionName);
            attachCollapsibleEventListeners(sectionName); // Pass the section name
            // Align snake icons if this is the about_me section
            if (sectionName === 'about_me') {
                // Wait for layout to settle, then align icons
                setTimeout(() => {
                    alignSnakeIcons();
                    // Also set up resize listener
                    window.removeEventListener('resize', alignSnakeIcons);
                    window.addEventListener('resize', alignSnakeIcons);
                }, 150);
            }
        })
        .catch(error => console.error('Error loading section:', error));
}

function alignSnakeIcons() {
    const container = document.querySelector('.snake-container');
    if (!container) {
        console.log('Container not found');
        return;
    }
    
    const svg = container.querySelector('.snake-svg');
    const paths = container.querySelectorAll('.snake-path');
    const icons = container.querySelectorAll('.snake-icon');
    
    if (!svg) {
        console.log('SVG not found');
        return;
    }
    if (paths.length === 0) {
        console.log('No paths found');
        return;
    }
    if (icons.length === 0) {
        console.log('No icons found');
        return;
    }
    
    // Get container and SVG dimensions
    const containerRect = container.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    
    // Icon radius in pixels
    const iconRadius = 25;
    const lineThickness = 4;
    
    // Calculate scale factors (SVG might be scaled to fit container)
    const scaleX = svgRect.width / viewBox.width;
    const scaleY = svgRect.height / viewBox.height;
    
    icons.forEach((icon, index) => {
        const pathIndex = parseInt(icon.getAttribute('data-path'));
        const position = parseFloat(icon.getAttribute('data-position'));
        const path = paths[pathIndex];
        
        if (!path) {
            console.log('Path not found for icon', index, 'pathIndex', pathIndex);
            return;
        }
        
        try {
            // Get total length of path
            const pathLength = path.getTotalLength();
            
            // Get point at position along path (in SVG viewBox coordinates)
            const point = path.getPointAtLength(pathLength * position);
            
            // Convert SVG viewBox coordinates to percentage of container
            // viewBox is 0 0 1200 600
            const xPercent = (point.x / viewBox.width) * 100;
            const yPercent = (point.y / viewBox.height) * 100;
            
            // For the first icon, position it on top of the line
            let yOffset = 0;
            if (index === 0) {
                // Calculate offset to position icon on top of line
                // Move up by (icon radius + half line thickness) in percentage
                const offsetPixels = iconRadius + (lineThickness / 2);
                yOffset = -(offsetPixels / containerRect.height) * 100;
            }
            
            // Set position as percentage
            icon.style.left = xPercent + '%';
            icon.style.top = (yPercent + yOffset) + '%';
            icon.style.display = 'flex';
            icon.style.visibility = 'visible';
            icon.style.opacity = '1';
            
        } catch (e) {
            console.error('Error positioning icon', index, e);
        }
    });
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
    const sectionName = location.hash ? location.hash.substring(1) : 'about_me';
    loadSection(sectionName);
});

// Initial load based on the URL hash
document.addEventListener('DOMContentLoaded', () => {
    const sectionName = location.hash ? location.hash.substring(1) : 'about_me';
    loadSection(sectionName);
});
