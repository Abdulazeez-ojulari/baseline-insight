# Baseline Insight CLI

The **Baseline Insight CLI** is a command-line tool that scans your project files and generates a detailed compatibility report based on web platform features, helping you identify modern and legacy code usage.

## 🚀 Features
- Scans JavaScript, TypeScript, HTML, and CSS files for web platform features.
- Generates a detailed **Baseline Compatibility Report** (`baseline-report.json`).
- Integrates seamlessly with the [@baseline-insight/core-engine](https://www.npmjs.com/package/@baseline-insight/core-engine).
- Supports custom baseline year targets (e.g., 2017, 2020, 2023).
- Fast scanning using `fast-glob` and efficient parsing via Babel.

## 🧩 Installation

You can install the CLI globally using **npm**:

```bash
npm install -g @baseline-insight/analyzer-cli
```

Once installed, run the command anywhere in your project:

```bash
baseline-insight --help
```

## ⚙️ Usage

```bash
baseline-insight [options]
```

### Options

| Option | Description | Default |
|--------|--------------|----------|
| `-d, --dir <dir>` | Directory to scan | `.` |
| `-o, --out <file>` | Output file path | `baseline-report.json` |
| `-y, --year <year>` | Baseline year target | `2023` |
| `-h, --help` | Display help information | — |

### Example

```bash
baseline-insight --dir ./src --out report.json --year 2021
```

This will scan the `src` directory, analyze web features, and save the report as `report.json` using **2021** as the baseline reference year.

## 🧠 How It Works

1. Parses your project files (`.js`, `.ts`, `.jsx`, `.tsx`, `.html`, `.css`).
2. Extracts web feature usage via Babel and PostCSS.
3. Compares against the [Baseline](https://web.dev/baseline/) dataset for browser support.
4. Generates a structured JSON report containing:
   - Feature name
   - Compatibility support data
   - Baseline status
   - Sample file references

Example output (`baseline-report.json`):
```json
{
  "scannedFiles": 120,
  "baselineYear": "2023",
  "features": {
    "css.properties.grid": {
      "count": 8,
      "samples": [
        "src/styles/main.css:45|css.properties.grid"
      ],
      "baseline": true,
      "support": {
        "chrome": "57",
        "firefox": "52",
        "safari": "10.1"
      }
    }
  },
  "generatedAt": "2025-10-04T14:33:12.000Z"
}
```

## 🧪 Development

1. Clone the repository:
  ```bash
  git clone https://github.com/Abdulazeez-ojulari/baseline-insight.git
  cd baseline-insight/packages/analyzer-cli
  ```

2. Install dependencies:
  ```bash
  npm install
  ```

3. Run in development mode:
   ```bash
    npm run build
    npm link
    baseline-insight --help
   ```

## 🧩 Dependencies

- [commander](https://www.npmjs.com/package/commander)
- [fast-glob](https://www.npmjs.com/package/fast-glob)
- [@babel/parser](https://www.npmjs.com/package/@babel/parser)
- [@baseline-insight/core-engine](https://www.npmjs.com/package/@baseline-insight/core-engine)
- [postcss](https://www.npmjs.com/package/postcss)

## 📄 License

This project is licensed under the **MIT License** — see the LICENSE file for details.
