document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');
    
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    
    // Default to light mode unless dark mode was explicitly saved
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
    } else {
        document.documentElement.removeAttribute('data-theme');
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            moonIcon.style.display = 'block';
            sunIcon.style.display = 'none';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
        }
    });

    // News Data Sources
    const RSS_SOURCES = [
        { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', class: 'bbc' },
        { name: 'CNN', url: 'http://rss.cnn.com/rss/edition_world.rss', class: 'cnn' },
        { name: 'El Mundo', url: 'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml', class: 'el-mundo' },
        { name: 'NYT', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', class: 'nyt' },
        { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', class: 'al-jazeera' },
        { name: 'DW', url: 'https://rss.dw.com/rdf/rss-en-all', class: 'dw' }
    ];

    const API_BASE = 'https://api.rss2json.com/v1/api.json?rss_url=';
    let allNewsItems = [];
    let currentFilter = 'all';

    const grid = document.getElementById('news-grid');
    const statusMessage = document.getElementById('status-message');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Fetch all feeds
    async function fetchNews() {
        try {
            const fetchPromises = RSS_SOURCES.map(source => 
                fetch(`${API_BASE}${encodeURIComponent(source.url)}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.status === 'ok') {
                            const feedImage = data.feed && data.feed.image ? data.feed.image : '';
                            // Attach source metadata to each item
                            return data.items.map(item => ({
                                ...item,
                                sourceName: source.name,
                                sourceClass: source.class,
                                fallbackImage: feedImage
                            }));
                        }
                        return [];
                    })
                    .catch(err => {
                        console.error(`Failed to fetch ${source.name}:`, err);
                        return [];
                    })
            );

            const results = await Promise.all(fetchPromises);
            
            // Flatten array and sort by date (newest first)
            allNewsItems = results.flat().sort((a, b) => {
                return new Date(b.pubDate) - new Date(a.pubDate);
            });

            if (allNewsItems.length === 0) {
                statusMessage.innerHTML = '<p>Unable to load news at this time. Please try again later.</p>';
            } else {
                statusMessage.style.display = 'none';
                renderNews(allNewsItems);
            }

        } catch (error) {
            console.error('Error fetching news:', error);
            statusMessage.innerHTML = '<p>An error occurred while loading news.</p>';
        }
    }

    // Render news cards
    function renderNews(items) {
        grid.innerHTML = '';
        
        items.forEach(item => {
            try {
                const card = document.createElement('a');
                card.className = 'news-card';
                card.href = item.link || '#';
                card.target = '_blank';
                card.rel = 'noopener noreferrer';

                // Handle images (rss2json provides thumbnail or enclosure)
                let imageUrl = item.thumbnail || '';
                if (!imageUrl && item.enclosure && item.enclosure.link) {
                    const type = item.enclosure.type;
                    if (!type || String(type).startsWith('image/') || item.enclosure.link.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
                        imageUrl = item.enclosure.link;
                    }
                }

                // Extract image from description if needed
                const desc = item.description ? String(item.description) : '';
                if (!imageUrl && desc.includes('<img')) {
                    const imgMatch = desc.match(/<img[^>]+src="([^">]+)"/);
                    if (imgMatch) imageUrl = imgMatch[1];
                }

                // Clean description (remove HTML tags)
                let cleanDesc = desc.replace(/<[^>]*>?/gm, '').trim();
                if (cleanDesc.length > 150) {
                    cleanDesc = cleanDesc.substring(0, 150) + '...';
                }

                // Format date
                const dateObj = new Date(item.pubDate || Date.now());
                const timeAgo = getTimeAgo(dateObj);

                // Construct HTML
                let imageHtml = '';
                if (imageUrl) {
                    imageHtml = `<img src="${imageUrl}" alt="News image" class="card-img" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'no-image-placeholder\\'>${item.sourceName || 'News'}</div>'">`;
                } else if (item.fallbackImage) {
                    imageHtml = `<img src="${item.fallbackImage}" alt="${item.sourceName || 'News'} Logo" class="card-img" style="object-fit: contain; padding: 1.5rem; background-color: var(--surface-color);" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'no-image-placeholder\\'>${item.sourceName || 'News'}</div>'">`;
                } else {
                    imageHtml = `<div class="no-image-placeholder">${item.sourceName || 'News'}</div>`;
                }

                card.innerHTML = `
                    <div class="card-img-wrapper">
                        ${imageHtml}
                    </div>
                    <div class="card-content">
                        <div class="card-meta">
                            <span class="source-tag ${item.sourceClass || 'default'}">${item.sourceName || 'News'}</span>
                            <span class="pub-date" title="${dateObj.toLocaleString()}">${timeAgo}</span>
                        </div>
                        <h2 class="card-title">${item.title || 'Untitled'}</h2>
                        <p class="card-desc">${cleanDesc || 'Click to read full story.'}</p>
                        <div class="card-footer">Read article</div>
                    </div>
                `;
                
                grid.appendChild(card);
            } catch (err) {
                console.error('Failed to render a news item:', err);
            }
        });
    }

    // Helper: Time Ago format
    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        
        return "Just now";
    }

    // Filtering Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const source = btn.getAttribute('data-source');
            currentFilter = source;
            
            if (source === 'all') {
                renderNews(allNewsItems);
            } else {
                const filtered = allNewsItems.filter(item => item.sourceName === source);
                renderNews(filtered);
            }
            
            // Scroll to top of grid
            window.scrollTo({
                top: document.querySelector('.content-wrapper').offsetTop - 100,
                behavior: 'smooth'
            });
        });
    });

    // Init
    fetchNews();
    
    // Auto-refresh every 60 seconds (60000 milliseconds)
    setInterval(fetchNews, 60000);
});
