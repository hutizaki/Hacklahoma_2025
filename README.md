# Proof-of-Genuine-Code (PoGC) - README

## 🚀 Project Summary
Proof-of-Genuine-Code (PoGC) is a **VS Code & Eclipse extension** that prevents AI-assisted cheating by tracking code authorship, detecting AI-generated content, and requiring justifications for flagged sections. The plugin integrates **Ethereum for decentralized verification** and provides a **web-based dashboard** for professors to review reports.

## 📁 Project File Structure
```
PoGC-VSCode-Extension/
│── .vscode/                      # ⚙️ VS Code settings & launch configurations
│   ├── settings.json              # VS Code-specific settings
│   ├── extensions.json            # Recommended extensions for development
│
│── src/                           # 📂 Main source code
│   ├── extension.ts               # 🎯 Entry point for VS Code extension
│   ├── tracking/                  # 📂 Tracking & Monitoring
│   │   ├── KeystrokeTracker.ts     # ⌨️ Logs keystrokes, pastes, and typing behavior
│   │   ├── PasteDetector.ts        # 📋 Detects pastes & flags AI-generated code
│   │   ├── SessionTracker.ts       # ⏳ Tracks time spent coding and session durations
│   │   ├── AuthReplay.ts           # 🔄 Captures real-time coding playback
│   ├── detection/                  # 📂 AI-Assisted Code Detection
│   │   ├── AiChecker.ts            # 🤖 Calls AI API for similarity checks
│   │   ├── CodeComplexity.ts       # 📊 Detects sudden jumps in skill level & structure
│   │   ├── PlagiarismCheck.ts      # ⚠️ Compares against known AI-generated code
│   ├── comments/                   # 📂 Auto-Insert Comment System
│   │   ├── InsertComments.ts       # 📝 Inserts Explain-Your-Code prompts above flagged code
│   │   ├── CommentValidator.ts     # ✔️ Ensures all comments are answered before submission
│   ├── reporting/                   # 📂 Proof-of-Genuine-Code Report Generation
│   │   ├── ReportGenerator.ts      # 📑 Creates final PoGC report (JSON format)
│   │   ├── SessionHistory.ts       # 📜 Logs session history & coding timeline
│   │   ├── PercentageBreakdown.ts  # 📊 Breaks down Human vs AI vs Pasted Code
│   │   ├── BlockchainStorage.ts    # ⛓️ Stores report hash on Ethereum
│   ├── ethereum/                    # 📂 Ethereum & Web3 Integration
│   │   ├── SwarmStorage.ts         # 🌐 Uploads PoGC reports to Swarm
│   │   ├── EthereumConnector.ts    # 🔗 Handles Ethereum transactions & smart contract interaction
│   │   ├── ENSIntegration.ts       # 🌍 Links PoGC report to ENS domain
│   ├── ui/                          # 📂 UI & WebView Components
│   │   ├── PanelView.ts            # 🎨 VS Code WebView panel for report display
│   │   ├── ReportViewer.ts         # 📜 Loads JSON reports in a formatted UI
│   │   ├── AlertSystem.ts          # ⚠️ Shows popups & warnings inside VS Code
│
│── config/                         # 📂 Configuration Files
│   ├── settings.json                # ⚙️ Plugin settings
│   ├── apiKeys.json                 # 🔑 API credentials for AI-checking & Ethereum
│
│── tests/                           # 📂 Unit tests
│   ├── trackingTests.ts             # ✅ Tests for Keystroke/Paste tracking
│   ├── detectionTests.ts            # ✅ AI-detection & plagiarism tests
│   ├── reportingTests.ts            # ✅ Report generation verification
│
│── webapp/                          # 🌍 Web-Based UI for Professors
│   ├── pages/                       # 📂 Web pages
│   │   ├── index.tsx                # 📄 Home page for accessing reports
│   │   ├── report.tsx               # 📄 UI to display PoGC report
│   ├── components/                   # 📂 UI components
│   │   ├── ReportCard.tsx           # 📜 Shows report summary
│   │   ├── Navigation.tsx           # 🧭 Sidebar & navigation
│   ├── services/                     # 📂 Web3 & Swarm integration
│   │   ├── fetchReport.ts            # 🔍 Fetches report from Swarm/ENS
│   │   ├── auth.ts                   # 🔐 Handles professor authentication
│   ├── public/                        # 📂 Static assets
│   ├── styles/                        # 🎨 UI styles
│
│── docs/                            # 📂 Documentation
│   ├── README.md                     # 📖 Overview & setup guide
│   ├── API.md                         # 🌐 AI & Ethereum integration details
│   ├── ARCHITECTURE.md                # 🏗️ Technical breakdown
│   ├── CONTRIBUTING.md                # 👥 Contribution guidelines
│
│── package.json                      # 📦 VS Code extension dependencies
│── tsconfig.json                      # 🔧 TypeScript compiler configuration
│── .gitignore                         # 🚫 Version control exclusions
│── LICENSE                            # ⚖️ Open-source license

```
```
PoGC-WebApp/
│── public/                          # 📂 Static assets (unchanged)
│   ├── index.html                    # 🏠 Main HTML entry point
│   ├── favicon.ico                    # 🎨 Branding icon
│
│── src/                              # 📂 Main source code
│   ├── pages/                        # 📂 Web pages
│   │   ├── index.tsx                 # 📄 Landing page (professors login)
│   │   ├── report.tsx                # 📄 Displays PoGC report fetched from Swarm
│   ├── components/                   # 📂 Reusable UI components
│   │   ├── ReportCard.tsx            # 📜 Displays report metadata
│   │   ├── Navigation.tsx            # 🧭 Sidebar navigation
│   │   ├── EthereumStatus.tsx        # ⛓️ Displays Ethereum connectivity status
│   ├── services/                     # 📂 Web3, Swarm & ENS integration
│   │   ├── fetchReport.ts            # 🔍 Retrieves report from Swarm/ENS
│   │   ├── auth.ts                    # 🔐 Handles professor authentication
│   │   ├── ethereum.ts                # 🔗 Connects to Ethereum smart contract
│   │   ├── swarm.ts                    # 📂 Uploads & retrieves reports from Swarm
│   ├── context/                      # 📂 Global state management
│   │   ├── AuthContext.tsx            # 🛂 Manages professor authentication state
│   │   ├── ReportContext.tsx          # 📜 Manages report state globally
│   ├── styles/                        # 🎨 UI Styling (Tailwind/SCSS)
│
│── tests/                            # 📂 Unit & Integration Tests
│   ├── fetchReport.test.ts           # ✅ Tests Swarm report retrieval
│   ├── ethereum.test.ts              # ✅ Ensures Ethereum transactions work
│   ├── ui.test.ts                    # ✅ UI unit tests for components
│
│── config/                           # 📂 Configuration & Environment Variables
│   ├── settings.json                  # ⚙️ WebApp settings
│   ├── apiKeys.json                    # 🔑 API keys for Ethereum & Swarm
│
│── docs/                             # 📂 Documentation (unchanged)
│   ├── README.md                      # 📖 Setup guide
│   ├── API.md                          # 🌐 Swarm & Ethereum API details
│   ├── ARCHITECTURE.md                 # 🏗️ System architecture breakdown
│
│── package.json                       # 📦 WebApp dependencies
│── tsconfig.json                       # 🔧 TypeScript compiler configuration
│── .gitignore                          # 🚫 Version control exclusions
│── LICENSE                             # ⚖️ Open-source license
```

### **PoGC Web Application**
📍 **Directory:** `PoGC-WebApp/`
| Component        | Description |
|-----------------|-------------|
| `public/`       | Static assets (index.html, favicon) |
| `src/pages/`    | Web pages (landing, report display) |
| `src/components/` | Reusable UI elements (Navigation, ReportCard) |
| `src/services/`  | Web3, Swarm & ENS integrations (fetch reports, auth, Ethereum) |
| `src/context/`  | Global state management (AuthContext, ReportContext) |
| `tests/`        | Unit & integration tests (fetchReport, Ethereum) |
| `config/`       | API keys & web app settings |
| `docs/`         | Documentation (README, API, ARCHITECTURE) |
| `package.json`  | Dependencies |
| `.gitignore`    | Version control exclusions |

### **PoGC VS Code Extension**
📍 **Directory:** `PoGC-VSCode-Extension/`
| Component        | Description |
|-----------------|-------------|
| `.vscode/`       | VS Code settings & extensions |
| `src/extension.ts` | Main entry point for the VS Code plugin |
| `src/tracking/`  | Keystroke, paste, session tracking |
| `src/detection/` | AI-generated code detection (AI API, complexity analysis) |
| `src/comments/`  | Auto-insert explain-your-code prompts |
| `src/reporting/` | PoGC report generation (JSON, session history) |
| `src/ethereum/`  | Swarm & Ethereum integration |
| `src/ui/`       | VS Code WebView for report display |
| `tests/`        | Unit tests (tracking, AI detection, reporting) |
| `docs/`         | Project documentation (README, API, ARCHITECTURE) |

## 🔧 Development Roadmap

To ensure **seamless implementation**, we prioritize components as follows:

### **Primary Components (Critical for MVP)**
1. **Keystroke & Paste Tracking** (`KeystrokeTracker.ts`, `PasteDetector.ts`) - Logs user edits.
2. **AI-Assisted Code Detection** (`AiChecker.ts`, `CodeComplexity.ts`, `PlagiarismCheck.ts`) - Flags AI-generated code.
3. **Explain-Your-Code Prompts** (`InsertComments.ts`) - Forces inline justifications for flagged code.
4. **PoGC Report Generation** (`ReportGenerator.ts`, `PercentageBreakdown.ts`) - Summarizes flagged content.
5. **WebApp Report Retrieval** (`fetchReport.ts`, `Auth.ts`, `Ethereum.ts`) - Displays reports for professors.

### **Secondary Components (Enhancements & Stability)**
6. **Session Playback** (`AuthReplay.ts`) - Allows professors to replay a student’s coding session.
7. **Ethereum & Swarm Storage** (`SwarmStorage.ts`, `BlockchainStorage.ts`) - Stores proof of authorship.
8. **VS Code UI Panel** (`PanelView.ts`, `ReportViewer.ts`) - Displays PoGC reports inside VS Code.
9. **Professor Authentication** (`AuthContext.tsx`) - Ensures only professors can access reports.
10. **Time Tracking & Report Logs** (`SessionTracker.ts`, `SessionHistory.ts`) - Records total time spent coding.

## ✅ Testing & Validation
To ensure each component functions correctly, the following tests should be performed:

### **Tracking & Detection Tests**
| Test Case | Expected Outcome |
|-----------|-----------------|
| Type code & check tracking logs | KeystrokeTracker.ts records every edit |
| Paste AI-generated content | PasteDetector.ts flags the section |
| Modify complex code suddenly | CodeComplexity.ts triggers AI detection |

### **WebApp & Report Validation**
| Test Case | Expected Outcome |
|-----------|-----------------|
| Submit flagged code without comments | Explain-Your-Code prompt appears |
| Fetch PoGC report from Swarm | Report displays in the WebApp |
| Verify report authenticity on Ethereum | Report hash is stored & retrievable |

### **Integration & Performance Testing**
| Test Case | Expected Outcome |
|-----------|-----------------|
| Run the plugin in VS Code | PoGC tracking & reporting functions correctly |
| Load multiple reports at once | WebApp loads efficiently without crashes |
| Blockchain storage of reports | Reports are correctly stored & retrieved |

---

