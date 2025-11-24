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
                // Wait for layout to settle, then align icons multiple times to ensure it works
                setTimeout(alignSnakeIcons, 50);
                setTimeout(alignSnakeIcons, 200);
                setTimeout(alignSnakeIcons, 500);
                // Also set up resize listener
                const resizeHandler = () => {
                    setTimeout(alignSnakeIcons, 50);
                };
                window.removeEventListener('resize', resizeHandler);
                window.addEventListener('resize', resizeHandler);
            }
        })
        .catch(error => console.error('Error loading section:', error));
}

function alignSnakeIcons() {
    const container = document.querySelector('.snake-container');
    if (!container) return;
    
    const svg = container.querySelector('.snake-svg');
    const paths = Array.from(container.querySelectorAll('.snake-path'));
    const icons = Array.from(container.querySelectorAll('.snake-icon'));
    
    if (!svg || paths.length === 0 || icons.length === 0) return;
    
    // Wait for layout to be ready
    const containerRect = container.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    
    if (containerRect.width === 0 || containerRect.height === 0 || svgRect.width === 0 || svgRect.height === 0) {
        setTimeout(alignSnakeIcons, 100);
        return;
    }
    
    // Calculate total length of all paths combined
    const pathLengths = paths.map(p => p.getTotalLength());
    const totalLength = pathLengths.reduce((sum, len) => sum + len, 0);
    
    if (totalLength === 0) return;
    
    // Calculate cumulative lengths to know which path segment each position falls on
    const cumulativeLengths = [0];
    pathLengths.forEach((len, i) => {
        cumulativeLengths.push(cumulativeLengths[i] + len);
    });
    
    // Icon radius
    const iconRadius = 25;
    const lineThickness = 4;
    
    // Create SVG point for coordinate transformation
    const svgPoint = svg.createSVGPoint();
    const containerPoint = container.getBoundingClientRect();
    
    // Distribute icons evenly along the entire snake path
    icons.forEach((icon, index) => {
        // Calculate position along total path (0 to 1)
        const position = icons.length > 1 ? index / (icons.length - 1) : 0;
        const targetLength = position * totalLength;
        
        // Find which path segment this position falls on
        let pathIndex = paths.length - 1;
        for (let i = 0; i < cumulativeLengths.length - 1; i++) {
            if (targetLength >= cumulativeLengths[i] && targetLength <= cumulativeLengths[i + 1]) {
                pathIndex = i;
                break;
            }
        }
        
        const path = paths[pathIndex];
        if (!path) return;
        
        try {
            // Calculate position within this specific path segment
            const segmentStartLength = cumulativeLengths[pathIndex];
            const segmentLength = pathLengths[pathIndex];
            const positionInSegment = segmentLength > 0 ? Math.max(0, Math.min(1, (targetLength - segmentStartLength) / segmentLength)) : 0;
            
            // Get point on path in SVG viewBox coordinates
            const point = path.getPointAtLength(segmentLength * positionInSegment);
            
            // Use SVG's matrix transformation to convert to screen coordinates
            svgPoint.x = point.x;
            svgPoint.y = point.y;
            const screenPoint = svgPoint.matrixTransform(svg.getScreenCTM());
            
            // Convert screen coordinates to container-relative coordinates
            const containerLeft = containerPoint.left;
            const containerTop = containerPoint.top;
            const xPixels = screenPoint.x - containerLeft;
            const yPixels = screenPoint.y - containerTop;
            
            // Convert to percentage of container
            const xPercent = (xPixels / containerRect.width) * 100;
            const yPercent = (yPixels / containerRect.height) * 100;
            
            // Set position - icons use transform: translate(-50%, -50%) so this centers them on the point
            icon.style.left = xPercent + '%';
            icon.style.top = yPercent + '%';
            icon.style.display = 'flex';
            icon.style.visibility = 'visible';
            
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
