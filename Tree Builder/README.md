# 📐 Draughtsman — Visual Tree Architect

A lightweight, offline, single-file HTML tool for generating clean folder/file tree diagrams **and** ready-to-run Python scripts to scaffold them on disk. Includes an interactive step-by-step tutorial, light/dark mode, and English/Urdu language support.

**Made by [Zulfiqar Teams](https://zulfiqarteams.github.io/Portfolio_Website/)**

---

## ✨ Features

- 100% offline — no dependencies, no build step, just open the HTML file
- Interactive blueprint-style editor with live preview
- Add folders and files by typing relative paths (e.g. `src/components/Button.jsx`)
- Auto-generates nested tree structure with proper `├──` / `└──` connectors
- One-click copy of the generated tree as plain text
- **Auto-generates a matching offline Python script** that recreates the exact folder/file structure on disk
- Copy or **download** the script (`create_structure.py`) and run it locally
- 🎓 **Built-in interactive tutorial** — guided popup walkthrough that highlights each part of the UI step by step
- 🌗 **Light / Dark mode toggle** — preference is remembered between visits
- 🌐 **English / Urdu language toggle** — full UI translation including the tutorial, with right-to-left layout for Urdu
- Custom root node name
- Responsive design for desktop and mobile

---

## 🚀 How To Use

1. Open `Tree_Builder.html` in any modern browser.
2. (Optional) Click **🎓 Tutorial** at the top right for a guided, step-by-step popup walkthrough of every feature.
3. (Optional) Use **🌙 / ☀️** to switch between dark and light mode, and **🌐** to switch between English and Urdu.
4. Set your project's **root folder name** in the field at the top right.
5. Enter a relative path (e.g. `css/style.css` or `js/audio.js`) in the input box.
6. Click **+ Folder** or **+ File** depending on the entry type. Parent directories are created automatically.
7. The tree updates live in the right-hand panel.
8. Click **Copy Structural Text Payload** to copy the result, then paste it into your project's `README.md` inside a code block.
9. Scroll down to the **Offline Python Generator Script** panel — it's auto-generated from your current structure.
10. Click **⬇ Download create_structure.py** (or **Copy Script**), place it in your target directory, and run:
    ```bash
    python create_structure.py
    ```
    This creates all the folders and empty files exactly as shown in the tree — fully offline, no internet required.

---

## 🎓 Interactive Tutorial

Click the **Tutorial** button in the header to launch a guided popup that walks through:

1. Setting the root folder name
2. Adding a file/folder path
3. Choosing File vs Folder
4. Reading the live tree preview
5. Copying the tree for your README
6. Downloading the Python scaffold script

Each step highlights the relevant part of the page with a glowing outline. The tutorial is fully available in both English and Urdu.

---

## 🌗 Light / Dark Mode

Toggle between a dark "engineering blueprint" theme and a clean light theme using the toggle button in the header. Your preference is saved in the browser and restored on your next visit.

---

## 🌐 English / Urdu Support

Switch the entire interface — labels, buttons, instructions, and the tutorial — between English and Urdu using the language toggle. Urdu mode automatically switches the page to right-to-left (RTL) layout for natural reading.

---

## 🖥️ Live Demo

Open `Tree_Builder.html` directly in your browser — no server required.

---

## 🛠️ Tech Stack

- HTML5
- CSS3 (custom properties, CSS grid, RTL support)
- Vanilla JavaScript (no frameworks/libraries)
- Auto-generated Python 3 (standard library only — `os` module)

---

## 📄 License

Free to use and modify for personal and commercial projects.

---

## 👤 Author

**Zulfiqar Teams**
Portfolio: [zulfiqarteams.github.io/Portfolio_Website](https://zulfiqarteams.github.io/Portfolio_Website/)
