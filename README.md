### **Proof-of-Genuine-Code (PoGC) - Full Project Documentation**  

---

## **📌 What the Program Does & Tools Used**  

**PoGC (Proof-of-Genuine-Code)** is an **AI-resistant coding verification system** designed for **academic integrity and professional use**. It prevents students from **using AI-generated code dishonestly** while providing **tamper-proof proof of effort** using **Ethereum-based decentralization**.

**🔹 Key Features:**  
✅ Tracks **keystrokes & paste events** to detect AI-generated code  
✅ Forces students to **justify flagged code sections** with inline comments  
✅ Stores coding session **history on IPFS/Swarm**  
✅ Uses **ENS (Ethereum Name Service)** for student report lookup  
✅ Generates **tamper-proof reports stored on Ethereum blockchain**  
✅ Provides **a web-based UI for professors** to navigate & review reports  

**🛠️ Tools & APIs Used:**  
- **Eclipse Plugin Development API** – To integrate tracking & UI within Eclipse  
- **React + Web3.js** – For WebApp navigation & Ethereum interactions  
- **IPFS/Swarm** – Decentralized storage of PoGC reports  
- **Ethereum Smart Contracts** – Verification of report authenticity  
- **ENS (Ethereum Name Service)** – Student identity linking  
- **AI-Detection API** – Checks pasted code similarity with AI-generated content  

---
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

## **📌 Explanation of Components**  

| **Component** | **Description** |
|--------------|----------------|
| **PoGC Eclipse Plugin** | A plugin that runs inside Eclipse, tracking coding behavior and preventing AI-assisted cheating. |
| **Keystroke & Paste Tracking** | Logs typing behavior, detects large pastes, and flags AI-assisted coding. |
| **AI Detection & Code Complexity Analysis** | Identifies AI-like code patterns, ensuring students manually write their code. |
| **Explain-Your-Code Auto-Comments** | Inserts inline comments where AI is detected, requiring students to justify their approach. |
| **Offline Mode & Syncing** | Stores tracking logs locally, then syncs them to Ethereum once back online. |
| **Blockchain & ENS Integration** | Links reports to a student's ENS domain and stores report hashes for verification. |
| **PoGC WebApp UI** | A professor-facing dashboard that retrieves reports from IPFS/Swarm and Ethereum. |
| **Report Navigation** | Allows professors to browse by class section, assignment, and student before viewing reports. |
| **Report Viewer** | Displays JSON-based reports in a structured, readable format. |

---

## **📌 Step-by-Step Development Plan**  

The following guide outlines **what needs to be coded first** to ensure proper functionality from the start.  

### **🔹 Phase 1: Core Tracking & Detection (🚀 Highest Priority)**
✅ **Build the Eclipse Plugin Base (`PluginMain.java`)**  
   - Set up **Eclipse extension hooks** and configuration management.  

✅ **Implement Keystroke & Paste Tracking (`KeystrokeTracker.java`, `PasteDetector.java`)**  
   - Capture **keyboard inputs and paste events**.  
   - Store data in **local logs** for later AI verification.  

✅ **Develop Session Tracking (`SessionTracker.java`)**  
   - Track **total time coding, activity periods, and inactivity gaps**.  
   - Allow **exporting logs** to JSON/CSV.  

---

### **🔹 Phase 2: AI Detection & Justification (🏗️ AI & Comment System)**
✅ **Implement AI-Detection API Connection (`AiChecker.java`)**  
   - Send **code snippets** to AI-checking API.  
   - Retrieve **AI-likelihood percentage** and flag code accordingly.  

✅ **Auto-Insert "Explain Your Code" Comments (`InsertComments.java`)**  
   - **Highlight flagged AI-generated sections**.  
   - Insert **comment prompts forcing student justification**.  

✅ **Block Submissions Without Justification (`CommentValidator.java`)**  
   - Prevent students from **submitting code with unanswered AI-flagged comments**.  

---

### **🔹 Phase 3: Report Generation & Offline Mode (📜 Proof & Storage)**
✅ **Generate PoGC Reports (`ReportGenerator.java`, `SessionHistory.java`)**  
   - Compile **keystroke data, AI-detection results, and student justifications**.  

✅ **Develop Local Storage (`LocalStorageHandler.java`, `SyncManager.java`)**  
   - **Save reports locally** when offline.  
   - **Sync reports to IPFS/Swarm** once online.  

✅ **Implement Blockchain & ENS Integration (`EthereumConnector.java`, `ENSIntegration.java`)**  
   - Store **PoGC report hashes** on Ethereum.  
   - Link reports to **ENS student domains** for easy retrieval.  

---

### **🔹 Phase 4: WebApp UI & Report Viewing (🎨 Final Phase)**
✅ **Develop Section & Assignment Selection (`SectionSelector.js`, `AssignmentSelector.js`)**  
   - Allow professors to **navigate class sections before viewing reports**.  

✅ **Integrate ENS & IPFS Fetching (`ENSLookup.js`, `StorageFetcher.js`)**  
   - Retrieve student reports **using ENS names & IPFS storage**.  

✅ **Implement JSON Report Viewer (`ReportViewer.js`)**  
   - Format and display **fetched PoGC reports** for professors.  

✅ **Finalize UI Styling & Debugging (`main.css`)**  
   - Ensure **intuitive navigation & readability**.  

---

## **📌 Testing & Debugging Guide**  

If a **component fails**, follow these **debugging steps**:  

| **Issue** | **Potential Cause** | **How to Fix It** |
|-----------|--------------------|------------------|
| 🚨 **Plugin Not Loading in Eclipse** | Incorrect Eclipse plugin configuration | Ensure the `PluginMain.java` correctly registers with Eclipse’s extension system. |
| 🚨 **Keystrokes & Pasting Not Being Logged** | Tracking methods not properly hooked | Add debug logs inside `KeystrokeTracker.java` and `PasteDetector.java`. |
| 🚨 **AI Detection Failing** | API not responding | Check `AiChecker.java` for API errors and verify API key. |
| 🚨 **Explain-Your-Code Comments Not Inserting** | Comment insertion logic not triggering | Ensure `InsertComments.java` receives AI-flagged sections and adds comments properly. |
| 🚨 **Submissions Not Blocking for Unanswered Comments** | Validation not enforced | Add `console.log` checks in `CommentValidator.java` to verify flagged comments are detected. |
| 🚨 **Reports Not Syncing to IPFS/Swarm** | Network issue or incorrect storage setup | Run `SyncManager.java` manually and check for failed network requests. |
| 🚨 **ENS Name Not Resolving** | Incorrect ENS domain setup | Debug `ENSLookup.js` and verify ENS registration on Ethereum. |
| 🚨 **WebApp Not Fetching Reports** | UI not correctly querying IPFS | Ensure `StorageFetcher.js` sends the correct ENS name and fetches from IPFS. |

---

🔥 **Now you’re ready to build, test, and deploy the Proof-of-Genuine-Code system!** 🚀
