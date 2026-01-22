This repository contains the frontend for a modern, AI-integrated banking application. The system provides real-time transaction analysis using an ATM-inspired interface, bridging the gap between raw financial data and actionable user insights.

Project Overview
The core of this application is an AI-powered Transaction Advisor. It uses RAG (Retrieval-Augmented Generation) to securely fetch a user's transaction history from a Java/Spring Boot backend and process it through a Large Language Model. To ensure a low-latency experience, the insights are delivered via Server-Sent Events (SSE), providing a word-by-word streaming effect on the dashboard.

Key Technical Features
RAG Architecture: The frontend triggers a retrieval process where private banking data is injected into the AI context window, ensuring the advisor’s responses are grounded in factual financial history.

SSE Streaming Implementation: Utilizes the Streams API to consume chunks from the backend in real-time. This eliminates the "waiting period" associated with standard REST calls, significantly improving the user experience.

ATM Dashboard Interface: A professional, high-fidelity UI designed to mimic an ATM screen, featuring a live system clock, processing indicators, and a sanitized terminal for reading insights.

Regex-Based Token Parsing: Implemented a robust client-side parser to handle non-deterministic AI tokens, preserving character-level fidelity for currency, dates, and numerical summaries.

Tech Stack
React (Vite): Frontend framework for high-performance UI rendering.

Spring Boot: Java backend serving as the orchestration layer for database retrieval and OpenAI integration: https://github.com/engralikhodor/gdc-bank


SSE (Server-Sent Events): Protocol used for unidirectional real-time data streaming.

CSS3: Custom styles for the specialized ATM-glass effect and responsive layout.

Install dependencies:

Bash
npm install
Run the development server:

Bash
npm run dev
Environment Configuration: Ensure the backend is running to allow the frontend to communicate with the AI endpoints.

Future Enhancements
Markdown Support: Integrating a parser to render AI summaries with bold headers and bullet points for better readability.

Source Citations: Mapping AI-generated values back to specific transaction IDs for increased transparency.