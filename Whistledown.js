/* ==========================================
   WHISTLEDOWN — MAIN JAVASCRIPT
   ========================================== */

(() => {
  "use strict";

  const $ = id => document.getElementById(id);

  const STORAGE_KEY = "whistledown-refined-v1";
  const VIEW_KEY = "whistledown-layout-v1";

  const collator = new Intl.Collator("en", {
    sensitivity: "base"
  });

  const state = {
    search: "",
    author: "all",
    status: "all",
    genre: "all",
    format: "all",
    sort: "original",
    view: "grid",
    selected: null
  };

  const editableFields = [
    "title",
    "author",
    "genre",
    "status",
    "format",
    "shelf",
    "dateAdded",
    "rating",
    "publisher",
    "year",
    "isbn",
    "pages",
    "lentTo",
    "synopsis",
    "notes"
  ];

  let saved = {
    edits: {},
    removed: []
  };

  /* ==========================================
     LOCAL STORAGE
     ========================================== */

  function loadStorage() {
    try {
      const parsed = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "null"
      );

      if (parsed && typeof parsed === "object") {
        saved = {
          edits: parsed.edits || {},
          removed: Array.isArray(parsed.removed)
            ? parsed.removed
            : []
        };
      }
    } catch {
      saved = { edits: {}, removed: [] };
    }

    try {
      if (localStorage.getItem(VIEW_KEY) === "list") {
        state.view = "list";
      }
    } catch {
      // Storage may be unavailable.
    }
  }

  function persist() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(saved)
      );
      return true;
    } catch {
      return false;
    }
  }

  /* ==========================================
     REUSABLE ELEMENT HELPERS
     ========================================== */

  function element(tag, className = "", content) {
    const node = document.createElement(tag);

    if (className) {
      node.className = className;
    }

    if (content !== undefined) {
      node.textContent = content;
    }

    return node;
  }

  function action(label, handler, className = "") {
    const button = element("button", className, label);
    button.type = "button";
    button.addEventListener("click", handler);
    return button;
  }

  function image(src, alt) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.loading = "lazy";
    return img;
  }

  function toast(message) {
    const notification = $("toast");

    notification.textContent = message;
    notification.hidden = false;

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {
      notification.hidden = true;
    }, 3200);
  }

  function textOrDash(value) {
    if (
      value === undefined ||
      value === null ||
      String(value).trim() === ""
    ) {
      return "—";
    }

    return String(value);
  }

  function dateLabel(iso) {
    if (!iso) return "—";

    const [year, month, day] = iso
      .split("-")
      .map(Number);

    if (!year || !month || !day) return "—";

    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(new Date(year, month - 1, day));
  }

  /* ==========================================
     BOOK DATA
     ========================================== */

  function combinedBooks() {
    return DATA.books
      .filter(book => !saved.removed.includes(book.id))
      .map((book, index) => ({
        ...book,
        status: "Not tracked",
        ...saved.edits[book.id],
        index
      }));
  }

  function selectedBook() {
    return combinedBooks().find(
      book => book.id === state.selected
    );
  }

  function uniqueValues(values) {
    return [...new Set(values.filter(Boolean))]
      .sort(collator.compare);
  }

  /* ==========================================
     CATALOG FILTER OPTIONS
     ========================================== */

  function rebuildSelect(id, values, defaultText) {
    const select = $(id);
    const previous = select.value;

    select.replaceChildren(
      new Option(defaultText, "all")
    );

    values.forEach(value => {
      select.add(new Option(value, value));
    });

    select.value = values.includes(previous)
      ? previous
      : "all";

    return select.value;
  }

  function populateFilters() {
    const books = combinedBooks();

    state.author = rebuildSelect(
      "authorFilter",
      uniqueValues(books.map(book => book.author)),
      "All authors"
    );

    const genres = uniqueValues(
      books.map(book => book.genre)
    );

    state.genre = rebuildSelect(
      "genreFilter",
      genres,
      "All genres"
    );

    $("genreHolder").hidden = genres.length === 0;

    const formats = uniqueValues(
      books.map(book => book.format)
    );

    state.format = rebuildSelect(
      "formatFilter",
      formats,
      "All formats"
    );

    $("formatHolder").hidden = formats.length === 0;

    const hasDates = books.some(
      book => Boolean(book.dateAdded)
    );

    const hasRatings = books.some(
      book => book.rating !== undefined &&
              book.rating !== ""
    );

    $("recentSort").hidden = !hasDates;
    $("ratingSort").hidden = !hasRatings;

    if (
      (!hasDates && state.sort === "recent") ||
      (!hasRatings && state.sort === "rating")
    ) {
      state.sort = "original";
      $("sort").value = "original";
    }
  }

  /* ==========================================
     SEARCH, FILTER, SORT
     ========================================== */

  function filteredBooks() {
    const query = state.search
      .trim()
      .toLocaleLowerCase();

    const matches = combinedBooks().filter(book => {

      if (query) {
        const searchable = [
          book.title,
          book.author,
          book.isbn,
          book.genre
        ];

        const found = searchable.some(value =>
          String(value || "")
            .toLocaleLowerCase()
            .includes(query)
        );

        if (!found) return false;
      }

      if (
        state.author !== "all" &&
        book.author !== state.author
      ) {
        return false;
      }

      if (
        state.status !== "all" &&
        (book.status || "Not tracked") !== state.status
      ) {
        return false;
      }

      if (
        state.genre !== "all" &&
        book.genre !== state.genre
      ) {
        return false;
      }

      if (
        state.format !== "all" &&
        book.format !== state.format
      ) {
        return false;
      }

      return true;
    });

    matches.sort((a, b) => {
      switch (state.sort) {
        case "title":
          return collator.compare(a.title, b.title);

        case "author":
          return (
            collator.compare(a.author, b.author) ||
            collator.compare(a.title, b.title)
          );

        case "recent":
          return (
            (b.dateAdded || "").localeCompare(
              a.dateAdded || ""
            ) ||
            a.index - b.index
          );

        case "rating": {
          const aRating = a.rating === "" ||
            a.rating === undefined
            ? -1
            : Number(a.rating);

          const bRating = b.rating === "" ||
            b.rating === undefined
            ? -1
            : Number(b.rating);

          return bRating - aRating ||
            a.index - b.index;
        }

        default:
          return a.index - b.index;
      }
    });

    return matches;
  }

  /* ==========================================
     BOOK GRID CARDS
     ========================================== */

  function renderCard(book) {
    const card = element("article", "book-card");

    const cover = action(
      "",
      () => openBook(book.id),
      "book-cover"
    );

    cover.setAttribute(
      "aria-label",
      `See details for ${book.title}`
    );

    cover.append(
      image(book.cover, `Cover of ${book.title}`)
    );

    if (
      book.status &&
      book.status !== "Not tracked"
    ) {
      cover.append(
        element("span", "status", book.status)
      );
    }

    const copy = element("div", "book-copy");

    const title = action(
      book.title,
      () => openBook(book.id),
      "book-title"
    );

    const author = element(
      "p",
      "author",
      `by ${book.author}`
    );

    copy.append(title, author);

    const footer = element("div", "book-foot");

    footer.append(
      element(
        "span",
        "",
        book.genre || "Book collection"
      ),
      action(
        "Details ↗",
        () => openBook(book.id)
      )
    );

    copy.append(footer);

    card.append(cover, copy);

    return card;
  }

  /* ==========================================
     BOOK LIST VIEW
     ========================================== */

  function renderRow(book) {
    const row = element("tr");

    const firstCell = element("td");
    const bookInfo = element("div", "table-book");

    bookInfo.append(
      image(book.cover, `Cover of ${book.title}`),
      action(book.title, () => openBook(book.id))
    );

    firstCell.append(bookInfo);
    row.append(firstCell);

    const fields = [
      book.author,
      textOrDash(book.genre),
      textOrDash(book.shelf),
      dateLabel(book.dateAdded),
      book.status || "Not tracked"
    ];

    fields.forEach(value => {
      row.append(element("td", "", value));
    });

    const finalCell = element("td");

    const openButton = action(
      "Open →",
      () => openBook(book.id),
      "plain-link"
    );

    openButton.setAttribute(
      "aria-label",
      `Open ${book.title}`
    );

    finalCell.append(openButton);
    row.append(finalCell);

    return row;
  }

  /* ==========================================
     RENDER CATALOG
     ========================================== */

  function renderCatalog() {
    const books = combinedBooks();
    const visibleBooks = filteredBooks();

    const gridMode = state.view === "grid";

    $("statBooks").textContent = books.length;

    $("resultCount").textContent =
      `Showing ${visibleBooks.length} of ${books.length} books`;

    $("clearSearch").hidden = !state.search;

    const filtersActive =
      Boolean(state.search) ||
      state.author !== "all" ||
      state.status !== "all" ||
      state.genre !== "all" ||
      state.format !== "all" ||
      state.sort !== "original";

    $("resetFilters").hidden = !filtersActive;

    $("restoreBooks").hidden =
      saved.removed.length === 0;

    $("gridToggle").setAttribute(
      "aria-pressed",
      String(gridMode)
    );

    $("listToggle").setAttribute(
      "aria-pressed",
      String(!gridMode)
    );

    $("booksGrid").hidden =
      !gridMode || visibleBooks.length === 0;

    $("booksList").hidden =
      gridMode || visibleBooks.length === 0;

    $("emptyState").hidden =
      visibleBooks.length !== 0;

    if (gridMode) {
      $("booksGrid").replaceChildren(
        ...visibleBooks.map(renderCard)
      );
    } else {
      $("booksTableBody").replaceChildren(
        ...visibleBooks.map(renderRow)
      );
    }
  }

  function resetFilters() {
    state.search = "";
    state.author = "all";
    state.status = "all";
    state.genre = "all";
    state.format = "all";
    state.sort = "original";

    $("search").value = "";
    $("sort").value = "original";

    [
      "authorFilter",
      "statusFilter",
      "genreFilter",
      "formatFilter"
    ].forEach(id => {
      $(id).value = "all";
    });

    renderCatalog();
  }

  function switchView(view) {
    state.view = view;

    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      // View selection remains active for this session.
    }

    renderCatalog();
  }

  /* ==========================================
     AUTHORS
     ========================================== */

  function renderAuthors() {
    const container = $("authorsGrid");

    container.replaceChildren();

    DATA.authors.forEach(author => {
      const card = element("article", "author-card");

      const portrait = image(
        author.portrait,
        `Portrait of ${author.name}`
      );

      const content = element(
        "div",
        "author-content"
      );

      content.append(
        element("h3", "", author.name),
        element("p", "", author.bio)
      );

      const browseButton = action(
        "View their books →",
        () => {
          resetFilters();

          state.author = author.name;
          $("authorFilter").value = author.name;

          renderCatalog();

          $("books").scrollIntoView({
            behavior: matchMedia(
              "(prefers-reduced-motion: reduce)"
            ).matches ? "instant" : "smooth"
          });
        }
      );

      content.append(browseButton);
      card.append(portrait, content);
      container.append(card);
    });

    $("statAuthors").textContent =
      DATA.authors.length;
  }

  /* ==========================================
     READER REVIEWS
     ========================================== */

  function renderReviews() {
    const container = $("reviewsGrid");

    container.replaceChildren();

    DATA.reviews.forEach(review => {
      const card = element("article", "review");

      card.append(
        element("span", "quote", "“"),
        element("h3", "", review.headline),
        element("p", "", review.body)
      );

      container.append(card);
    });

    $("statReviews").textContent =
      DATA.reviews.length;
  }

  /* ==========================================
     BOOK DETAILS MODAL
     ========================================== */

  function openBook(id) {
    state.selected = id;

    showBook();

    $("bookDialog").showModal();

    document.body.classList.add("modal-open");

    $("closeDialog").focus();
  }

  function showBook() {
    const book = selectedBook();

    if (!book) return;

    const cover = $("detailCover");

    cover.src = book.cover;
    cover.alt = `Cover of ${book.title}`;

    $("detailTitle").textContent = book.title;

    $("detailAuthor").textContent =
      `by ${book.author}`;

    $("detailStatus").textContent =
      book.status || "Not tracked";

    $("detailSynopsis").textContent =
      book.synopsis || "No synopsis recorded.";

    const metadata = [
      ["Genre", book.genre],
      ["Format", book.format],
      ["Shelf or tag", book.shelf],
      [
        "Date added",
        book.dateAdded ? dateLabel(book.dateAdded) : ""
      ],
      ["Publisher", book.publisher],
      ["Publication year", book.year],
      ["ISBN", book.isbn],
      ["Page count", book.pages],
      [
        "Personal rating",
        book.rating !== undefined &&
        book.rating !== ""
          ? `${book.rating} / 5`
          : null
      ],
      ["Lent to", book.lentTo]
    ];

    const metadataContainer = $("detailMeta");

    metadataContainer.replaceChildren();

    metadata.forEach(([label, value]) => {
      const box = element("div");

      box.append(
        element("dt", "", label),
        element("dd", "", textOrDash(value))
      );

      metadataContainer.append(box);
    });

    $("detailNotes").textContent =
      book.notes || "No personal notes yet.";

    $("detailsView").hidden = false;
    $("editForm").hidden = true;
  }

  /* ==========================================
     EDIT BOOK DETAILS
     ========================================== */

  function beginEdit() {
    const book = selectedBook();

    if (!book) return;

    const form = $("editForm");

    editableFields.forEach(key => {
      const field = form.elements.namedItem(key);

      if (field) {
        field.value = book[key] ??
          (key === "status" ? "Not tracked" : "");
      }
    });

    $("detailsView").hidden = true;
    form.hidden = false;

    form.elements.namedItem("title").focus();
  }

  function saveEdit(event) {
    event.preventDefault();

    const book = selectedBook();

    if (!book) return;

    const form = $("editForm");
    const changes = {};

    editableFields.forEach(key => {
      changes[key] = form.elements
        .namedItem(key)
        .value
        .trim();
    });

    if (!changes.title || !changes.author) {
      toast("A book needs a title and author.");
      return;
    }

    saved.edits[book.id] = changes;

    const savedSuccessfully = persist();

    populateFilters();
    renderCatalog();
    showBook();

    toast(
      savedSuccessfully
        ? "Details saved on this device."
        : "Updated for this session. Browser storage is unavailable."
    );
  }

  /* ==========================================
     REMOVE AND RESTORE BOOKS
     ========================================== */

  function removeBook() {
    const book = selectedBook();

    if (!book) return;

    const confirmed = confirm(
      `Hide "${book.title}" from your library on this device? ` +
      "You can restore removed books."
    );

    if (!confirmed) return;

    if (!saved.removed.includes(book.id)) {
      saved.removed.push(book.id);
    }

    persist();
    closeDialog();

    populateFilters();
    renderCatalog();

    toast(
      "Book hidden. Use Restore removed books to undo."
    );
  }

  function restoreBooks() {
    saved.removed = [];

    persist();
    populateFilters();
    renderCatalog();

    toast("All hidden books have been restored.");
  }

  function closeDialog() {
    if ($("bookDialog").open) {
      $("bookDialog").close();
    }

    document.body.classList.remove(
      "modal-open"
    );

    state.selected = null;
  }

  /* ==========================================
     FEATURED BOOK SLIDESHOW
     ========================================== */

  function initFeatured() {
    const slides = DATA.slides;
    let current = 0;

    if (!slides.length) return;

    function update() {
      const slide = slides[current];

      $("featureImage").src = slide.src;
      $("featureImage").alt = slide.alt;

      $("featureCount").textContent =
        `${current + 1} / ${slides.length}`;
    }

    $("prevFeature").addEventListener(
      "click",
      () => {
        current = (
          current - 1 + slides.length
        ) % slides.length;

        update();
      }
    );

    $("nextFeature").addEventListener(
      "click",
      () => {
        current = (
          current + 1
        ) % slides.length;

        update();
      }
    );

    update();
  }

  /* ==========================================
     MOBILE NAVIGATION
     ========================================== */

  function initMenu() {
    const toggle = $("mobileToggle");
    const navigation = $("navigation");

    function closeMenu() {
      navigation.classList.remove("open");

      toggle.setAttribute(
        "aria-expanded",
        "false"
      );

      toggle.setAttribute(
        "aria-label",
        "Open navigation"
      );
    }

    toggle.addEventListener("click", () => {
      const isOpen = navigation
        .classList
        .toggle("open");

      toggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      toggle.setAttribute(
        "aria-label",
        isOpen
          ? "Close navigation"
          : "Open navigation"
      );
    });

    navigation.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  /* ==========================================
     BACKGROUND MUSIC
     ========================================== */

  function initMusic() {
    const audio = $("music");
    const button = $("musicToggle");

    button.addEventListener("click", async () => {
      if (audio.paused) {
        try {
          await audio.play();

          button.textContent = "Ⅱ Pause ambience";

          button.setAttribute(
            "aria-pressed",
            "true"
          );
        } catch {
          toast(
            "Audio could not play. Check ILMB.mp3."
          );
        }
      } else {
        audio.pause();

        button.textContent = "♫ Play ambience";

        button.setAttribute(
          "aria-pressed",
          "false"
        );
      }
    });
  }

  /* ==========================================
     EVENT LISTENERS
     ========================================== */

  function initEvents() {
    $("search").addEventListener(
      "input",
      event => {
        state.search = event.target.value;
        renderCatalog();
      }
    );

    $("clearSearch").addEventListener(
      "click",
      () => {
        state.search = "";
        $("search").value = "";

        renderCatalog();
        $("search").focus();
      }
    );

    const filterBindings = [
      ["authorFilter", "author"],
      ["statusFilter", "status"],
      ["genreFilter", "genre"],
      ["formatFilter", "format"],
      ["sort", "sort"]
    ];

    filterBindings.forEach(([id, key]) => {
      $(id).addEventListener(
        "change",
        event => {
          state[key] = event.target.value;
          renderCatalog();
        }
      );
    });

    $("gridToggle").addEventListener(
      "click",
      () => switchView("grid")
    );

    $("listToggle").addEventListener(
      "click",
      () => switchView("list")
    );

    $("resetFilters").addEventListener(
      "click",
      resetFilters
    );

    $("emptyReset").addEventListener(
      "click",
      resetFilters
    );

    $("restoreBooks").addEventListener(
      "click",
      restoreBooks
    );

    $("closeDialog").addEventListener(
      "click",
      closeDialog
    );

    $("bookDialog").addEventListener(
      "close",
      () => {
        document.body.classList.remove(
          "modal-open"
        );

        state.selected = null;
      }
    );

    $("bookDialog").addEventListener(
      "click",
      event => {
        if (event.target === $("bookDialog")) {
          closeDialog();
        }
      }
    );

    $("editBook").addEventListener(
      "click",
      beginEdit
    );

    $("cancelEdit").addEventListener(
      "click",
      showBook
    );

    $("editForm").addEventListener(
      "submit",
      saveEdit
    );

    $("removeBook").addEventListener(
      "click",
      removeBook
    );
  }

  /* ==========================================
     INITIALIZATION
     ========================================== */

  function init() {
    if (
      typeof DATA === "undefined" ||
      !Array.isArray(DATA.books)
    ) {
      console.error(
        "Whistledown-data.js could not be loaded."
      );
      $("resultCount").textContent =
        "Could not load book data.";
      return;
    }

    loadStorage();

    $("aboutText").textContent = DATA.about;

    renderAuthors();
    renderReviews();
    populateFilters();
    renderCatalog();

    initFeatured();
    initMenu();
    initMusic();
    initEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }
})();