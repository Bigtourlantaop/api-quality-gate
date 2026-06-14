# 🚦 Autonomous API Quality Gate

![Quality Gate](https://github.com/Bigtourlantaop/api-quality-gate/actions/workflows/quality-gate.yml/badge.svg)

An automated framework that protects production from API breaking changes — detecting schema evolution, validating contracts, and blocking unsafe deployments before they happen.

## 🎯 The Problem

In microservices architecture, when a backend team changes an API response (e.g. renaming `name` to `fullName`), frontend clients break silently — often discovered only after production incidents.

This framework catches these breaking changes **automatically**, before deployment.

## 🛠️ Tech Stack

- **Playwright + TypeScript** — Test automation
- **Pact.js** — Consumer-driven contract testing
- **AJV** — JSON Schema validation
- **GitHub Actions** — CI/CD pipeline

## ✅ What This Does

### 1. Schema Validation
Validates real API responses against versioned JSON schemas (v1, v2).

### 2. Breaking Change Detection
Automatically compares schema versions and classifies changes:
- ❌ **Breaking**: removed fields, renamed fields, type changes
- ✅ **Non-breaking**: new optional fields

### 3. Contract Testing
Consumer-driven contracts ensure frontend and backend stay in sync using Pact.js.

### 4. Quality Gate
Aggregates all checks into a single deploy/no-deploy decision:
- Breaking Change Check
- Schema Validation Check
- Contract Compatibility Check

### 5. Auto-Generated Reports
- JSON report with full details
- HTML dashboard with visual summary
- Markdown changelog of schema changes

## 🚀 Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/api-quality-gate.git
cd api-quality-gate
npm install
npx playwright install
npx playwright test --project=chromium
```

## 📊 View Reports

```bash
# HTML Dashboard
start reports/dashboard.html

# Playwright Report
npx playwright show-report
```

## 🏗️ Architecture