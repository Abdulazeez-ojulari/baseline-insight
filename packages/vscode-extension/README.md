# 🧩 Baseline Insight – VS Code Extension

**Baseline Insight** is a Visual Studio Code extension that helps developers analyze web technologies, CSS/HTML features, and compatibility data directly from their editor. It integrates with the Baseline Core Engine to detect and highlight modern web features and provide compatibility insights for multiple browsers.

---

## 🚀 Features

✅ **Real-time Baseline Analysis**  
Automatically scans your HTML, CSS, and JavaScript files when you save them, detecting web features and APIs used in your code.

✅ **Hover Insights**  
Hover over properties or elements to instantly view compatibility information (e.g., `css.properties.outline`, `css.features.grid`, etc.), including which browsers support them.

✅ **Feature Tracking by Year**  
Set a *baseline year* (e.g., 2015, 2017, 2020) to determine whether a feature is considered “baseline,” “low,” or “high” relative to that year.

✅ **Seamless Integration**  
Works smoothly with the Baseline CLI and Core Engine for deep analysis and consistent reporting across the ecosystem.

✅ **Lightweight & Fast**  
Runs efficiently without slowing down your editor, even on large projects.

---

## ⚙️ How It Works

1. The extension activates when a supported file type (`.js`, `.ts`, `.css`, `.html`) is opened or saved.
2. It parses the file using the Baseline Core Engine to identify recognized web platform features.
3. On hover or save, it provides baseline compatibility information.
4. The baseline year and display preferences can be configured in VS Code settings.

---

## 🧠 Example

Hovering over the following CSS property:

```css
button {
  outline: none;
}
```

Will display:
> **Baseline Insight -** padding  
> **In Baseline 2017** No  
> **Reason:** below threshold  
> **Description:** The padding CSS property sets space between an element's edge and its contents.
---

## ⚙️ Configuration

Open VS Code **Settings** → **Extensions** → **Baseline Insight** to customize:

| Setting | Type | Default | Description |
|----------|------|----------|-------------|
| `baselineInsight.year` | `string` | `"2017"` | Set the baseline year for feature evaluation. |
| `baselineInsight.enableHover` | `boolean` | `true` | Show feature insights on hover. |
| `baselineInsight.scanOnSave` | `boolean` | `true` | Automatically scan files on save. |

---

## 🧩 Commands

| Command | Description |
|----------|-------------|
| **Baseline Insight: Scan Document** | Manually scan the active document for features. |
| **Baseline Insight: Set Baseline Year** | Quickly update the baseline year through the command palette. |

---

## 🧱 Project Structure

```
packages/
├── core-engine/        # Baseline detection & feature parser
├── analyzer-cli/       # CLI tool for project-wide scanning
├── dashboard/          # Analytics
└── vscode-extension/   # VS Code extension
```

---

## 🧪 Development

1. Clone the repository:
   ```bash
   git clone https://github.com/Abdulazeez-ojulari/baseline-insight.git
   cd baseline-insight/packages/vscode-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run compile
   code .
   ```

4. Press **F5** in VS Code to launch the extension in a new Extension Host window.

---

## 📦 Publishing

To package and publish your extension:

```bash
npm install -g @vscode/vsce
vsce package
vsce publish
```

Ensure your `publisher` and `version` fields are correctly set in `package.json`.

---

## 🧰 Technologies Used

- **TypeScript** – Extension and engine logic  
- **VS Code API** – Activation, hover providers, and workspace configuration  
- **@babel/parser / postcss / parser5** – For feature extraction from JS/CSS/HTML  
- **Baseline Core Engine** – Shared logic for feature detection and analysis  
- **Node.js** – CLI and runtime integration  

---

## 💡 Example Use Case

Developers targeting **baseline 2017** can instantly know whether a CSS property or JS API is modern enough for their project’s compatibility targets — without leaving VS Code.

---

## 👨‍💻 Author

**Abdulazeez Ojulari**  
Full Stack Developer | Backend Engineer | VS Code Extension Developer
🌐 [GitHub Repository](https://github.com/Abdulazeez-ojulari/baseline-insight)

---

## 🪪 License

This project is licensed under the **MIT License**.

---
