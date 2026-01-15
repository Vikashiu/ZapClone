# Workflow Automation Platform (Zapier-like)

A full-stack workflow automation platform that enables users to build event-driven workflows using a visual editor. The system allows users to connect triggers and actions, configure metadata, and execute workflows reliably at scale using an event-driven microservices architecture.

---

## Overview

This platform is inspired by tools like Zapier and Make, providing a **visual workflow builder**, **webhook-based triggers**, and **pluggable actions**. The backend is designed with reliability and scalability in mind, leveraging Kafka and the Outbox Pattern to ensure guaranteed event delivery.

---

## Key Features

- Visual workflow builder using drag-and-drop nodes
- Trigger → Action workflow execution model
- OAuth-based authentication for third-party integrations
- Webhook ingestion for real-time triggers
- Configurable action metadata (email, blockchain, sheets, etc.)
- Reliable event processing using Kafka
- Fault-tolerant execution with retries
- Workflow execution monitoring via dashboard

---

## High-Level Architecture

---

## Tech Stack

### Frontend
- React
- React Flow
- TypeScript
- Tailwind CSS / Custom UI components

### Backend
- Node.js
- Express
- PostgreSQL
- Apache Kafka

### Infrastructure & Patterns
- OAuth 2.0
- Webhooks
- Outbox Pattern
- Event-driven microservices
- REST APIs

---

## Core Concepts

### Workflow
A workflow is a directed graph consisting of:
- **Trigger node** – initiates execution
- **Action nodes** – perform operations sequentially

### Trigger
Triggers listen for external events such as:
- Webhook calls
- Scheduled events
- Third-party API callbacks

### Action
Actions execute tasks such as:
- Sending emails
- Appending data to Google Sheets
- Blockchain interactions
- API calls

Each action supports **custom metadata configuration**.

---

## Services

### API Service
- Manages authentication
- Creates and stores workflows
- Validates workflow structure
- Writes events to the Outbox table

### Processor Service
- Reads events from Kafka
- Determines next action to execute
- Orchestrates workflow execution order

### Worker Service
- Executes individual actions
- Handles retries and failures
- Sends execution status updates

---

## Reliability Guarantees

- **Exactly-once workflow creation** using the Outbox Pattern
- **At-least-once execution** for actions
- Safe retries for idempotent actions
- Decoupled services via Kafka

---

## Database Design (Simplified)

- Users
- Workflows
- WorkflowNodes
- WorkflowEdges
- ActionMetadata
- OutboxEvents
- ExecutionLogs

---

## Running the Project Locally

### Prerequisites
- Node.js
- PostgreSQL
- Apache Kafka
- npm / yarn

### Steps

```bash
# Install dependencies
npm install

# Start PostgreSQL & Kafka
# (Use Docker or local installations)

# Run backend services
npm run server
npm run processor
npm run worker

# Run frontend
npm run client
```
initial architecture for workflow execution:
<img width="825" height="577" alt="image" src="https://github.com/user-attachments/assets/b6eca08b-045a-4288-99af-2e65f97d0608" />


<img width="956" height="531" alt="image" src="https://github.com/user-attachments/assets/aab1cd58-daee-476f-b6bf-1e4ca78b6ed2" />


###final architecture
<img width="982" height="488" alt="image" src="https://github.com/user-attachments/assets/1c40ac6b-b951-492f-a48a-1b421c678d0f" />
