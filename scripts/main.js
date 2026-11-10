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

    items.forEach((item) => {
        const content = item.querySelector('.content');
        if (!item.querySelector('.timeline-label')) {
            const label = document.createElement('div');
            label.className = 'timeline-label';
            label.textContent = item.dataset.label || '';
            if (content) {
                item.insertBefore(label, content);
            } else {
                item.appendChild(label);
            }
        }
        if (content && !content.querySelector('.timeline-card-head')) {
            const date = item.querySelector('.timeline-date');
            const head = document.createElement('div');
            head.className = 'timeline-card-head';
            const kicker = document.createElement('div');
            kicker.className = 'timeline-card-kicker';
            kicker.textContent = date ? date.textContent.trim() : '';
            const title = document.createElement('div');
            title.className = 'timeline-card-title';
            title.textContent = item.dataset.label || '';
            head.append(kicker, title);
            content.prepend(head);
        }
        item.setAttribute('role', 'button');
        item.tabIndex = 0;
        if (item.dataset.bound === 'true') {
            return;
        }
        item.dataset.bound = 'true';
        const placeCard = () => {
            requestAnimationFrame(() => placeLifeTimelineCard(item));
        };
        item.addEventListener('mouseenter', placeCard);
        item.addEventListener('focus', placeCard);
    });

    positionLifeTimeline(timeline, items);
}

function placeLifeTimelineCard(item) {
    const card = item.querySelector('.content');
    if (!card) {
        return;
    }
    const itemRect = item.getBoundingClientRect();
    const spaceBelow = window.innerHeight - itemRect.bottom;
    const spaceAbove = itemRect.top;
    if (spaceBelow < 230 && spaceAbove > spaceBelow) {
        card.classList.add('is-above');
    } else {
        card.classList.remove('is-above');
    }
    card.style.left = '50%';
    card.style.right = 'auto';
    card.style.transform = 'translateX(-50%)';
    const rect = card.getBoundingClientRect();
    const margin = 8;
    const viewWidth = document.documentElement.clientWidth;
    if (rect.right > viewWidth - margin) {
        card.style.left = 'auto';
        card.style.right = '0';
        card.style.transform = 'none';
    } else if (rect.left < margin) {
        card.style.left = '0';
        card.style.right = 'auto';
        card.style.transform = 'none';
    }
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
    drawLifeTimelinePath(timeline, items, columns);
}

function drawLifeTimelinePath(timeline, items, columns) {
    const path = timeline.querySelector('.life-timeline-path');
    const line = path ? path.querySelector('path') : null;
    if (!path || !line) {
        return;
    }
    const host = timeline.getBoundingClientRect();
    const centers = items.map((item) => {
        const icon = item.querySelector('i') || item;
        const rect = icon.getBoundingClientRect();
        return {
            x: rect.left + (rect.width / 2) - host.left,
            y: rect.top + (rect.height / 2) - host.top
        };
    });
    const elbow = 8;
    const commands = [];
    centers.forEach((point, index) => {
        if (index === 0) {
            commands.push('M ' + point.x.toFixed(1) + ' ' + point.y.toFixed(1));
            return;
        }
        const previous = centers[index - 1];
        const previousRow = Math.floor((index - 1) / columns);
        const row = Math.floor(index / columns);
        if (row === previousRow) {
            commands.push('L ' + point.x.toFixed(1) + ' ' + point.y.toFixed(1));
            return;
        }
        const outward = (previousRow % 2 === 0) ? host.width - elbow : elbow;
        commands.push('L ' + outward.toFixed(1) + ' ' + previous.y.toFixed(1));
        commands.push('L ' + outward.toFixed(1) + ' ' + point.y.toFixed(1));
        commands.push('L ' + point.x.toFixed(1) + ' ' + point.y.toFixed(1));
    });
    path.setAttribute('viewBox', '0 0 ' + host.width + ' ' + host.height);
    path.setAttribute('width', String(host.width));
    path.setAttribute('height', String(host.height));
    line.setAttribute('d', commands.join(' '));
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
