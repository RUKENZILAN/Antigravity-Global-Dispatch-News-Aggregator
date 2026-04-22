# Building a Minimalist News Aggregator

**Global Dispatch** is a clean, minimalist web application that aggregates breaking news and top stories from the world's most trusted international news networks. Built completely from scratch without heavy frameworks, it is designed to give you a rapid, distraction-free view of global events with a sleek aesthetic. 

The site automatically polls live RSS feeds from the BBC, CNN, El Mundo, The New York Times (NYT), Al Jazeera, and Deutsche Welle (DW), combining them into one seamless feed.

## 🧠 Technical Highlights & The NYT Issue
While building this project, we encountered interesting data formatting quirks from different international networks that required robust failsafes:

- **The New York Times (NYT) Image Bug:** Initially, the NYT feed caused the entire application to crash. Why? Most standard RSS feeds attach an `enclosure` tag for their article images, complete with a file `type` (like `image/jpeg`). The NYT feed, however, occasionally sends empty enclosures or image links *without* a defined file type. Our JavaScript was strictly looking to verify the image type, and when it encountered an "undefined" type from NYT, it threw a fatal `TypeError` that broke the page. We solved this by relaxing the parsing rules to safely accept image links even if the publisher forgets to label the file type!
- **Al Jazeera & DW Placeholders:** We also discovered that Al Jazeera and Deutsche Welle strip thumbnail images out of their raw text RSS feeds entirely to save bandwidth. To keep the website looking premium, we built a fallback system that elegantly displays the official network logos whenever an article doesn't provide its own image.

## 🌟 Features
- **Live Updating**: Automatically refreshes and fetches the latest articles every 60 seconds without needing to reload the page.
- **Multiple Trusted Sources**: Integrates raw RSS feeds from BBC, CNN, El Mundo, The New York Times (NYT), Al Jazeera, and Deutsche Welle (DW).
- **Aesthetic UI**: Features a sleek Light/Dark mode toggle with an elegant, typography-driven "official newsroom" design using Google Fonts (`Playfair Display` and `Inter`).
- **Resilient Fallbacks**: Gracefully handles broken images or missing data from the RSS feeds, seamlessly displaying official network logos as fallbacks.
- **Dynamic Filters**: Instantly filter your live feed to show articles from a specific source without any loading screens.

## 🚀 Getting Started

Since this project is completely vanilla, there is zero setup required! No `npm install` or complex build tools needed.

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/global-dispatch.git
   ```
2. Navigate into the folder:
   ```bash
   cd global-dispatch
   ```
3. Open `index.html` in your favorite web browser (Chrome, Safari, Firefox). 
   ```bash
   # On macOS, simply run:
   open index.html
   ```

## 🛠 Tech Stack
- **HTML5** (Semantic layout)
- **CSS3** (CSS Variables, CSS Grid, Flexbox, Micro-animations)
- **Vanilla JavaScript** (Async/Await, DOM Manipulation, native `fetch` API)
- **rss2json API** (Used to bypass browser CORS restrictions and cleanly parse raw RSS XML feeds into JSON)

## 📸 Screenshots
*(You can add your own screenshots here!)*
