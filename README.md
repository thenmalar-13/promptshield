# PromptShield 🛡️

### AI Prompt Injection Detection & LLM Security Gateway

PromptShield is a security gateway for AI applications that detects, explains, and mitigates prompt-injection attacks **before untrusted prompts reach the LLM**.

It combines deterministic security rules with **Gemini AI analysis**, risk scoring, a safety gate, human review, and security telemetry.

> **User → PromptShield → Analyze → Risk Score → ALLOW / REVIEW / BLOCK → LLM**

---

## 🚀 Key Features

* 🔍 **Prompt Scanner** — Analyze prompts for security threats
* 🧠 **Gemini AI Analysis** — Semantic threat detection and reasoning
* 🛡️ **12 Threat Categories** — Injection, jailbreaks, extraction, obfuscation, tool abuse, and more
* 🧪 **Attack Lab** — 19 adversarial security scenarios
* 🚦 **Safety Gate** — Automatically decides `ALLOW`, `REVIEW`, or `BLOCK`
* 👤 **Human-in-the-Loop** — Review gate for suspicious requests
* 🤖 **Secure LLM Gateway** — Only approved prompts are forwarded to the model
* 📊 **Security Telemetry** — Risk, decisions, threats, latency, AI confidence, and hashed prompt metadata
* 📈 **Live Security Dashboard** — Real-time security posture and activity

---

## 🏗️ Security Architecture

```text
User / AI Application
        │
        ▼
┌─────────────────────────┐
│   PromptShield Gateway  │
└────────────┬────────────┘
             ▼
   Input Normalization
   NFKC • Unicode • Encoding
             │
             ▼
     Rule-Based Engine
       12 Threat Types
             │
             ▼
       Gemini AI Layer
   Semantic Analysis + Reasoning
             │
             ▼
        Risk Engine
    Rule Score + AI Score
             │
             ▼
        Safety Gate
      ┌──────┼──────┐
      ▼      ▼      ▼
    ALLOW  REVIEW  BLOCK
      │      │       │
      │      ▼       └── Stop
      │   Human Approval
      │      │
      └──────┘
             ▼
       Gemini LLM
```

---

## 🧪 Security Validation

PromptShield includes **19 adversarial security scenarios** covering **12 threat categories**.

### Tested attacks

Direct Injection • Jailbreak • System Prompt Extraction • Instruction Override • Data Exfiltration • Obfuscation • Role-Play Jailbreak • Multilingual Injection • Unicode/Homoglyph • Delimiter Smuggling • Tool Abuse • Context Manipulation

### Current controlled test result

**19 / 19 detected — 100% detection**

This result represents the included controlled security test suite and is **not a claim of 100% protection against all real-world attacks**.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js, React, TypeScript, Tailwind CSS
* **Security Engine:** Custom rule-based prompt analyzer
* **AI Security Layer:** Google Gemini
* **LLM Gateway:** Gemini API
* **Charts & UI:** Recharts, Lucide, shadcn/ui
* **Storage:** Browser local storage for privacy-preserving telemetry
* **Development:** VS Code, Git, GitHub

---

## ⚡ Getting Started

### 1. Clone

```bash
git clone https://github.com/thenmalar-13/promptshield.git
cd promptshield
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Gemini

Create `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run

```bash
npm run dev
```

Open the local URL shown by Next.js.

---

## 🔐 Security & Privacy

PromptShield does **not store raw prompts in telemetry**.

Security events store metadata such as:

* Risk score
* Security decision
* Threat category
* AI confidence
* Latency
* Prompt hash

The Gemini API key should remain in `.env.local` and must never be committed to Git.

---

## 🎯 Why PromptShield?

Traditional LLM applications often send user input directly to the model.

PromptShield introduces a **security control layer before the LLM**, combining:

**Deterministic Rules → AI Semantic Analysis → Risk Correlation → Safety Gate → Controlled LLM Access**

This makes the system useful not only for detecting attacks, but also for **explaining, governing, and controlling LLM requests**.

---

## 📌 Project Status

**Hackathon-ready prototype**

The current implementation includes a functional security gateway, Gemini-powered analysis, LLM forwarding, Attack Lab validation, live telemetry, dashboard monitoring, and security configuration.

---

## 👩‍💻 Author

**Thenmalar Devarajan**
B.E. Computer Science & Engineering

[GitHub](https://github.com/thenmalar-13)

