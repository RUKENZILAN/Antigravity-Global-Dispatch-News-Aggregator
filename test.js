const RSS_SOURCES = [
    { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', class: 'bbc' },
    { name: 'CNN', url: 'http://rss.cnn.com/rss/edition_world.rss', class: 'cnn' }
];
const API_BASE = 'https://api.rss2json.com/v1/api.json?rss_url=';

async function fetchNews() {
    const fetchPromises = RSS_SOURCES.map(source => 
        fetch(`${API_BASE}${encodeURIComponent(source.url)}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'ok') {
                    return data.items.map(item => ({
                        ...item,
                        sourceName: source.name
                    }));
                }
                return [];
            })
            .catch(err => [])
    );

    const results = await Promise.all(fetchPromises);
    let allNewsItems = results.flat().sort((a, b) => {
        return new Date(b.pubDate) - new Date(a.pubDate);
    });
    console.log("Fetched items length:", allNewsItems.length);
    console.log("First item:", allNewsItems[0] ? allNewsItems[0].title : "none");
}
fetchNews();
