# Whistledown Personal Library

**A Modern, Interactive, and User-Friendly Digital Bookshelf**

Whistledown Personal Library is a frontend web application designed to showcase a curated collection of books, authors, and reader reviews through an elegant and accessible digital library experience.

Inspired by classic literary aesthetics, the project combines a soft rose, peach, and burgundy color palette with modern UI/UX design principles to create a clean, responsive, and intuitive reading catalog.

The application is built entirely with **HTML, CSS, and Vanilla JavaScript**, without requiring a backend or database.

## Features

### Interactive Book Catalog
- Browse a curated collection of 24 books.
- Switch between grid and list views.
- Search books by title, author, ISBN, or genre.
- Filter books by author and available catalog metadata.
- Sort books alphabetically or by available ratings and dates.
- View detailed book information, including genre, format, publisher, publication year, ISBN, and page count.

### Book Management
- View and edit book information.
- Update reading statuses, such as Reading, Completed, Wishlist, and Lent Out.
- Add personal ratings and reading notes.
- Organize books using shelf labels or tags.
- Remove books from the current view and restore them when needed.
- Preserve user changes locally through browser `localStorage`.

### Author Profiles
- Explore 8 featured authors.
- Read short author biographies.
- Browse books associated with each author.

### Reader Reviews
- Discover reader perspectives and recommendations.
- Explore literary experiences through a dedicated review section.

### UI/UX Features
- Responsive layouts for desktop, tablet, and mobile devices.
- Minimalist navigation with a collapsible mobile menu.
- Consistent book-cover dimensions and structured card layouts.
- Smooth hover effects and subtle transitions.
- Interactive book-details modal.
- Accessible form labels, keyboard focus indicators, and reduced-motion support.
- Optional background music and featured-book slideshow.

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Semantic page structure |
| CSS3 | Styling, animations, Grid, and Flexbox |
| JavaScript (ES6+) | Dynamic rendering and interactions |
| LocalStorage API | Browser-local data persistence |
| Google Fonts | Literary typography and readability |
| Git & GitHub | Version control and source-code hosting |
| Vercel | Planned static website deployment |

**Typography:** Cinzel, EB Garamond, and Quicksand.

## UI/UX Design Principles

The redesign focuses on creating a user-friendly experience while preserving Whistledown's original visual identity.

- **KISS (Keep It Simple, Stupid):** Maintain straightforward navigation and understandable workflows.
- **DRY (Don't Repeat Yourself):** Reuse JavaScript rendering functions and CSS design tokens.
- **YAGNI (You Aren't Gonna Need It):** Avoid unnecessary frameworks, backend infrastructure, and features beyond the project's scope.
- **Visual Hierarchy:** Establish clear distinctions between headings, descriptions, metadata, and interactive elements.
- **Consistency:** Use standardized colors, typography, buttons, cards, and spacing.
- **Progressive Disclosure:** Display essential book information first, with additional details available on demand.
- **Responsive Design:** Adapt the interface to different screen sizes and devices.
- **Accessibility:** Support readable typography, meaningful labels, keyboard navigation, and reduced-motion preferences.

## Project Structure

```text
Whistledown-Personal-Library/
│
├── photos/
│   ├── logoW.png
│   ├── GTY.jpg
│   ├── heartless.jpg
│   ├── Jonaxx.png
│   └── ... other images
│
├── index.html
├── Whistledown.css
├── Whistledown-data.js
├── Whistledown.js
├── ILMB.mp3
└── README.md
```

### File Descriptions

- **index.html** — Main website structure and layout.
- **Whistledown.css** — Design system, responsive styling, and visual interactions.
- **Whistledown-data.js** — Book records, author profiles, reader reviews, and featured images.
- **Whistledown.js** — Catalog rendering, search, sorting, book management, and interactive functionality.
- **photos/** — Book covers, author portraits, and branding images.
- **ILMB.mp3** — Optional website background audio.

## Getting Started

### Prerequisites

You only need a modern web browser and a code editor, such as Visual Studio Code.

No Node.js installation, backend server, or database setup is required.

### 1. Clone the Repository

```bash
git clone https://github.com/Lerrica-Torreno/Whistledown-Personal-Library.git
```

### 2. Navigate to the Project

```bash
cd Whistledown-Personal-Library
```

### 3. Run the Website

Open `index.html` in your browser.

For a more convenient development experience, use the **Live Server** extension in Visual Studio Code:

1. Open the project folder in VS Code.
2. Right-click `index.html`.
3. Select **Open with Live Server**.
4. The website will open in your browser.

## Data Storage and Limitations

Whistledown is currently a **frontend-only application**.

Its book collection and publication metadata are defined in `Whistledown-data.js`. Changes made through the interface are stored using the browser's `localStorage` API.

This means:

- No account registration or login is required.
- Changes remain local to each visitor's browser.
- Data is not synchronized across devices.
- Clearing browser storage can remove locally saved changes.
- The application does not use a shared backend or database.

Some catalog fields contain **demonstration data** for interface testing. These values should not be treated as verified publication records or authentic personal reading history.

## Deployment

The project is designed for static hosting and is being prepared for deployment through **Vercel**.

Because the application uses HTML, CSS, and JavaScript, it can also be hosted through GitHub Pages or other static hosting providers.

A public demo link will be added after deployment.

## Future Improvements

Possible enhancements include:

- Integration with a book-information API for verified metadata.
- User authentication and personalized accounts.
- Cloud-based storage for book collections.
- Reading-progress tracking.
- Custom shelves and reading lists.
- Improved catalog management and data validation.

These features are potential future developments, not part of the current frontend release.

## Project Background

Whistledown began as a personal web development project inspired by an appreciation for literature and digital storytelling.

The project was later redesigned to improve usability, visual consistency, maintainability, and responsiveness while preserving its original literary identity.

It demonstrates how a static website can provide an engaging, interactive user experience through thoughtful UI/UX design and well-organized frontend development.

## Content and Asset Attribution

Book titles, cover artwork, author portraits, and other third-party literary materials belong to their respective authors, publishers, photographers, or rights holders.

Their inclusion in the project does not imply ownership or endorsement. Permission or appropriate licensing must be secured before publicly distributing assets where required, including background music.

## Developer

**Lerrica Jeremy S. Torreno**

BS Computer Science — Data Science Specialization

GitHub: [Lerrica-Torreno](https://github.com/Lerrica-Torreno)

---

*Whistledown Personal Library — Where stories find a home.*
