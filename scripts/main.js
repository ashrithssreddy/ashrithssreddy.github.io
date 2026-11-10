// Place About Me stops on a snake: across, down, back, and so on.
// The section HTML is injected as text, so this has to run from here.
function layoutLifeTimeline() {
    const timeline = document.querySelector('#content-container .life-timeline');
    if (!timeline) {
        return;
    }

    const items = Array.from(timeline.querySelectorAll(':scope > .timeline-item'));
    if (items.length === 0) {
        return;
    }

    let path = timeline.querySelector('.life-timeline-path');
    if (!path) {
        path = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        path.setAttribute('class', 'life-timeline-path');
        path.setAttribute('aria-hidden', 'true');
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.appendChild(line);
        timeline.prepend(path);
    }

    let detail = timeline.parentElement.querySelector(':scope > .life-timeline-detail');
    if (!detail) {
        detail = document.createElement('div');
        detail.className = 'life-timeline-detail';
        detail.setAttribute('aria-live', 'polite');
        timeline.insertAdjacentElement('afterend', detail);
    }

    items.forEach((item) => {
        if (!item.querySelector('.timeline-label')) {
            const label = document.createElement('div');
            label.className = 'timeline-label';
            label.textContent = item.dataset.label || '';
            item.appendChild(label);
        }
        item.setAttribute('role', 'button');
        item.tabIndex = 0;
        if (item.dataset.bound === 'true') {
            return;
        }
        item.dataset.bound = 'true';
        item.addEventListener('click', () => selectLifeStop(items, detail, item));
        item.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                selectLifeStop(items, detail, item);
            }
        });
    });

    positionLifeTimeline(timeline, items);
    if (!timeline.querySelector('.timeline-item.is-selected')) {
        selectLifeStop(items, detail, items[0]);
    }
}

function selectLifeStop(items, detail, item) {
    items.forEach((node) => {
        const selected = node === item;
        node.classList.toggle('is-selected', selected);
        node.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    const date = item.querySelector('.timeline-date');
    const dateText = date ? date.textContent.trim() : '';
    const label = item.dataset.label || '';
    const content = item.querySelector('.content');
    const heading = [dateText, label].filter(Boolean).join(' — ');
    detail.innerHTML = '<h3>' + escapeTimelineText(heading) + '</h3>' + (content ? content.innerHTML : '');
}

function positionLifeTimeline(timeline, items) {
    const columns = timeline.clientWidth < 720 ? 2 : 4;
    timeline.style.gridTemplateColumns = 'repeat(' + columns + ', minmax(0, 1fr))';
    items.forEach((item, index) => {
        const row = Math.floor(index / columns);
        const offset = index % columns;
        const column = (row % 2 === 0) ? offset + 1 : columns - offset;
        item.style.gridColumn = String(column);
        item.style.gridRow = String(row + 1);
    });
    drawLifeTimelinePath(timeline, items);
}

function drawLifeTimelinePath(timeline, items) {
    const path = timeline.querySelector('.life-timeline-path');
    const line = path ? path.querySelector('path') : null;
    if (!path || !line) {
        return;
    }
    const host = timeline.getBoundingClientRect();
    const points = items.map((item) => {
        const icon = item.querySelector('i') || item;
        const rect = icon.getBoundingClientRect();
        return {
            x: rect.left + (rect.width / 2) - host.left,
            y: rect.top + (rect.height / 2) - host.top
        };
    });
    path.setAttribute('viewBox', '0 0 ' + host.width + ' ' + host.height);
    path.setAttribute('width', String(host.width));
    path.setAttribute('height', String(host.height));
    line.setAttribute('d', points.map((point, index) => {
        return (index === 0 ? 'M ' : 'L ') + point.x.toFixed(1) + ' ' + point.y.toFixed(1);
    }).join(' '));
}

function escapeTimelineText(value) {
    return value.replace(/[&<>"']/g, (character) => {
        switch (character) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            default: return '&#39;';
        }
    });
}

let lifeTimelineResize = null;

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
            if (sectionName === 'about_me') {
                layoutLifeTimeline();
                if (lifeTimelineResize) {
                    window.removeEventListener('resize', lifeTimelineResize);
                }
                lifeTimelineResize = () => {
                    const timeline = document.querySelector('#content-container .life-timeline');
                    if (!timeline) {
                        return;
                    }
                    positionLifeTimeline(timeline, Array.from(timeline.querySelectorAll(':scope > .timeline-item')));
                };
                window.addEventListener('resize', lifeTimelineResize);
            }
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
