# Baseline Insight  

Baseline Insight is a **developer productivity toolkit** that integrates the [Baseline](https://web.dev/baseline/) project into your workflow. It helps developers understand the compatibility and adoption status of web platform features **directly in their code editor, CI pipeline, and CLI tools**—without needing to constantly check MDN, Can I Use, or blog posts.  

The goal is simple: **make modern web features safe and easy to use, everywhere.**  

---

## ✨ Features  

- **🔍 Static Analysis CLI**  
  - Analyze your JavaScript, TypeScript, CSS, and HTML code.  
  - Extract features (like `addEventListener`, `CSS.properties.outline`, `URL.searchParams`).  
  - Map features to Baseline data (`featureId` + `bdckey`).  
  - Report which features are universally supported, which are only available in certain Baseline years, and which are unsafe.  

- **💡 VS Code Extension**  
  - Hover tooltips on APIs (e.g., hovering `addEventListener` shows:  
    *“Available since Baseline 2015.”*)  
  - Inline diagnostics/warnings for features not yet in Baseline or only in later versions.  
  - Commands to run analysis across the project.  

- **⚡ Baseline-Aware Parsing**  
  - Uses Babel parser + CSS parsers to handle real-world, even **incomplete code**.  
  - Extracts DOM APIs, CSS properties, HTML features.  
  - Fallback regex-based extraction when AST parsing fails.  

- **📊 Developer Insights**  
  - CLI output supports **JSON** and **table formats** for integration into build pipelines.  
  - Integration-ready: feed results into CI/CD (GitHub Actions, GitLab CI, etc.) to block unsafe feature usage.  

---

## 🛠️ Functionality  

1. **Parsing & Feature Extraction**  
  - JavaScript/TypeScript parsing via `@babel/parser`.  
  - CSS parsing via `postcss`.  
  - HTML parsing via `parser5`.  
  - Handles **complete and incomplete code fragments** (via `errorRecovery` mode).  

2. **Feature Mapping**  
  - Features (e.g., `element.addEventListener`, `css.properties.outline`) are normalized into Baseline-compatible keys (`bdckey`, `featureId`).  
  - Cross-referenced with the official [web-features npm package](https://www.npmjs.com/package/web-features).  

3. **Baseline Compatibility Checking**  
  - Uses `isFeatureInBaseline(featureId, opts)` to determine :  
    - ✅ **Safe** (supported)  
    - ❌ **Unsupported** 

4. **Developer Experience**  
  - VS Code hover tooltips with Baseline details.  
  - CLI command:  
    ```bash
    baseline-insight --dir ./src --out report.json --year 2021
    ```
  - Optional JSON output for custom dashboards.  

---

## 🧑‍💻 Technologies Used  

- **Core Engine**  
  - `web-features` → Official Baseline feature dataset.  

- **CLI**  
  - `@babel/parser`, `@babel/traverse` → JavaScript & TypeScript AST parsing.  
  - `postcss` → CSS parsing.  
  - `parser5` → HTML feature extraction.  
  - Node.js (TypeScript).  
  - Outputs results in **JSON** formats.  

- **VS Code Extension**  
  - `@babel/parser`, `@babel/traverse` → JavaScript & TypeScript AST parsing.  
  - `postcss` → CSS parsing.  
  - `parser5` → HTML feature extraction.  
  - TypeScript + VS Code Extension API.  
  - Provides **hover tooltips**, **diagnostics**, and **commands**.  

- **Build & Packaging**  
  - Monorepo structure with `npm` workspaces.  
  - `tsup` for bundling.  
  - Published via `vsce` (Visual Studio Code Marketplace) and `npm`.  

---

## 📦 Repository Structure  

```
baseline-insight/
│
├── packages/
│   ├── analytic-cli/       # CLI for analysis
│   ├── core-engine/        # Parsing, feature extraction, Baseline lookups
│   ├── dashboard/          # Analytics
│   └── vscode-extension/   # VS Code Extension
│
├── docs/                   # Documentation
└── README.md
```

---

## 🚀 Getting Started  

### Install CLI  
```bash
npm install -g @baseline-insight/analyzer-cli
```

### Run Analysis  
```bash
baseline-insight analyze ./src --format table
```

### VS Code Extension (Development)  
```bash
cd packages/vscode-extension
npm install
npm run compile
code .
```

Press `F5` to launch VS Code in Extension Development Host mode.  

---

## 📄 License  
MIT License – open source, free to use and modify.  
