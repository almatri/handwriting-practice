# Handwriting Practice Worksheet

A browser app for creating printable handwriting worksheets for kids. Type practice sentences, tune the layout, preview the sheet live, then print or save as PDF.

## Features

- **English and Arabic** — Switch language for labels, fonts, and text direction (RTL for Arabic).
- **Worksheet modes**
  - **Multiple** — One sentence per row; each row gets a model line plus a blank practice line.
  - **Single** — Repeat one sentence with a configurable number of practice lines (1–10).
- **Handwriting fonts** — English options include Poppins, Edu SA Hand, KG Primary Penmanship, ABeeZee, Patrick Hand, and Kalam. Arabic options include educational Naskh, Amiri, Ruqaa, playful styles, and more.
- **Layout controls** — Adjust font size (12–70px) and spacing between sentence blocks.
- **Bold words** — Wrap text in `**double asterisks**` to emphasize words on the worksheet (markers are hidden on the sheet).
- **Guided lines** — English worksheets use primary-style top, mid (dashed), and baseline guides on practice rows. Arabic uses a simplified single-line guide.
- **Print-ready** — A4 layout with name/date header, decorative header, and parent rating stars. Controls are hidden when printing.

## Getting started

**Requirements:** Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### Other scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run build`   | Type-check and production build |
| `npm run preview` | Serve the production build locally |

## How to use

1. Choose **English** or **Arabic** and **Single** or **Multiple** worksheet mode.
2. Enter practice sentences in the sidebar. In **Multiple** mode, press **Enter** to add another line, or paste several lines at once to fill multiple rows.
3. Pick a handwriting font and adjust font size and sentence spacing to match your child’s level.
4. Check the **Live preview** on the right.
5. Click **Print / Save as PDF**. In the system print dialog, choose **Save as PDF** if you want a file instead of paper.

**Tips**

- Use `**word**` in a sentence to bold that word on the worksheet (e.g. `I **love** school` or `أنا **أحب** المدرسة`).
- Arabic text is detected automatically for RTL layout even in mixed content.
- Fonts are loaded from Google Fonts in `index.html`; an internet connection is needed the first time fonts load.

## Tech stack

- [React](https://react.dev/) 19
- [Vite](https://vite.dev/) 6
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4

## Project structure

```
├── index.html          # Page shell and Google Fonts links
├── src/
│   ├── App.tsx         # Worksheet UI, preview, and print layout
│   ├── main.tsx        # React entry point
│   └── index.css       # Tailwind import and print styles
├── vite.config.ts
└── package.json
```

## License

Private project — see repository owner for usage terms.
