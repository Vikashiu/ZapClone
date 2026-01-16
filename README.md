# Workflow Automation Platform (Zapier-like)
A full-stack, event-driven workflow automation platform that enables users to design, configure, and execute automated workflows using a visual editor. The platform allows users to connect triggers and actions, configure action-specific metadata, and execute workflows reliably at scale using a microservices-based, event-driven backend architecture.

This project is inspired by platforms such as Zapier and Make, but is built from first principles with a strong emphasis on reliability, scalability, and extensibility.

## Problem Statement

Modern applications frequently need to react to events and orchestrate actions across multiple services (emails, spreadsheets, blockchains, APIs, etc.). Implementing such automation individually for each use case leads to:

- Tight coupling between services

- Poor fault tolerance

- Limited observability

- Complex retry and recovery logic

This platform solves that problem by providing a generic automation engine that allows non-technical users to define workflows visually, while ensuring enterprise-grade reliability under the hood.

## High-Level Overview
<img width="1104" height="697" alt="4154e63a-5afa-4674-a174-853e2340f7d9" src="https://github.com/user-attachments/assets/92806f9a-884d-45f3-9673-92d8bfa6f516" />

The platform consists of three major layers:

1. Visual Workflow Builder (Frontend)

2. Workflow Coordinator & API Layer (Backend)

3. Event Processing & Execution Layer (Kafka-based Microservices)
## Key Features (Detailed)
### 3.1 Visual Workflow Builder

- Drag-and-drop canvas powered by React Flow

- Node-based representation of triggers and actions

- Edge validation to enforce valid trigger → action flows

- Modal-based configuration for action metadata

- Real-time workflow validation before publishing

### 3.2 Trigger → Action Execution Model

- Single entry trigger per workflow

- Deterministic execution order based on graph topology

- Support for sequential and extensible execution patterns

### 3.3 Authentication & Integrations

- OAuth 2.0 support for third-party services

- Secure token storage and refresh handling

- Pluggable integration model for adding new providers

### 3.4 Webhook-Based Triggers

- Public webhook endpoints per workflow

- Signature validation and payload normalization

- Real-time ingestion of external events

### 3.5 Action Metadata Configuration

- Each action defines a schema for required metadata

- Metadata stored per workflow node

- Runtime resolution of metadata during execution

Examples:

Email → recipient, subject, body

Google Sheets → spreadsheet ID, range, values

### 3.6 Reliable Event Processing

- Apache Kafka as the event backbone

- Exactly-once intent via Outbox Pattern

### 3.7 Execution Monitoring

- Workflow run tracking

- Step-level execution status

- Error visibility and retry diagnostics

##  4. Tech Stack
###  Frontend

   - Next.js – server-side rendering and routing

   - React Flow – visual graph editor
    
   - TypeScript – static typing and safety
    
   - Tailwind CSS – consistent UI styling

### Backend

- Node.js + Express – REST APIs and webhook handlers

- PostgreSQL – workflow definitions, execution state

- Apache Kafka – asynchronous event processing

- Infrastructure & Architectural Patterns

- OAuth 2.0

- Webhooks

- Outbox Pattern

- Event-driven microservices

- Stateless workers

## 5. Core Domain Concepts
### 5.1 Workflow

- A workflow is a persisted directed acyclic graph (DAG) consisting of:

- One trigger node

- One or more action nodes

- Explicit edges defining execution order

- Workflows are versioned and immutable once published.

### 5.2 Trigger

- A trigger represents the entry point of a workflow.

Supported trigger types include:

- Incoming webhooks

- Scheduled events (future extension)

- Third-party callbacks (OAuth-based)(future extension)

When a trigger fires, it creates a workflow execution event.

### 5.3 Action

- An action performs a concrete operation.

Each action:

- Has a defined input schema

- Accepts metadata configured in the UI

- Executes independently in a worker service

- Emits success or failure events

Actions are designed to be stateless and idempotent.

## Workflow Execution Architecture

### Flow:

1. Trigger event hits backend

2. Workflow is loaded from database

3. Actions executed synchronously or semi-synchronously

### Limitations:

- Tight coupling between execution steps

- Poor fault tolerance

- Difficult retries and recovery
### Improved Architecture (Kafka-Driven)



### initial architecture for workflow execution:

<img width="825" height="577" alt="image" src="https://github.com/user-attachments/assets/b6eca08b-045a-4288-99af-2e65f97d0608" />
###What This Diagram Shows

This diagram represents the first Kafka-based version of workflow execution.

Step-by-Step Flow

1. An external system sends a webhook request

2 .The hooks service receives the webhook

3. The hooks service publishes a message to Kafka

4. A worker consumes the Kafka message

5. The worker executes the workflow action

6. After execution finishes, the worker updates the database to mark the workflow as completed

### In this design:

- Kafka is used to trigger action execution

- Workers handle the actual work

- The database is updated only after execution finishes
- What Works Well Here

### The backend does not block on execution

- Action execution is asynchronous

- Workers can scale independently

- Kafka decouples request handling from execution

This already improves scalability compared to a fully backend-driven approach.

### The Core Problem in This Architecture
- No Visibility Into Running Workflows
- We cannot track which workflows are currently processing or have been received until execution is fully completed.
### Why This Happens

The system does not store execution state when the event is received

- The database is updated only after the worker finishes

- Kafka holds the message, but Kafka is not a state store

- If a workflow is still being processed, there is no database record showing:

    - That the workflow has started

    - Which step it is on

    - Whether it is stuck or delayed
- Kafka guarantees message delivery, but:

   - It does not track business execution state
    
   - It does not represent workflow progress
    
   - It cannot replace a database for execution tracking

  Using Kafka without persisting execution state leads to blind execution.
---
### Next Architecture
<img width="956" height="531" alt="image" src="https://github.com/user-attachments/assets/aab1cd58-daee-476f-b6bf-1e4ca78b6ed2" />
What This Architecture Improves

*The system now knows when a workflow starts*

*In-progress workflows can be tracked in the database*

Dashboards can show:

 - Running workflows
  
 - Completed workflows
  
 - Basic observability is introduced

This is a major improvement over the previous design.
**The Core Limitation of This Architecture**
Problem: Database and Kafka Are Not Atomic

The hooks service performs two separate operations:

- Writing to the database
  
- Publishing an event to Kafka
  
- These two operations are not guaranteed to succeed together.
---
**Failure Scenarios**
### Scenario 1: DB write succeeds, Kafka publish fails

 - Workflow is marked as processing
  
 - No event exists in Kafka
  
 - Worker never executes the workflow
  
 - Workflow appears stuck forever

### Scenario 2: Kafka publish succeeds, DB write fails

Worker executes the workflow

No “processing” entry exists in the database

Execution happens without tracking

System state becomes inconsistent
---
- Why This Is a Serious Issue 
    - Leads to ghost workflows
    
    - Causes incorrect execution state
    
   - Breaks dashboard accuracy
    
  -  Makes retries unsafe
    
   - Difficult to debug production issues

This is known as a dual-write problem.

### final architecture
In the previous design, the hooks service had to write to the database and publish to Kafka separately.
Because these operations were not atomic, failures could leave the system in an inconsistent state (ghost workflows, stuck executions, missing tracking).

To fix this, the system uses the Outbox Pattern.
<img width="982" height="488" alt="image" src="https://github.com/user-attachments/assets/1c40ac6b-b951-492f-a48a-1b421c678d0f" />
### Step-by-Step Flow

- A webhook triggers the hooks service

- The hooks service performs a single database transaction:

  - Creates a record in the zaprun table (marks workflow as processing)

  - Creates a record in the zaprun outbox table (event to be published)

- The database transaction is committed

- A separate processor service reads pending events from the outbox table

- The processor publishes those events to Kafka

- Workers consume events from Kafka and execute the workflow

- Workers update execution status in the zaprun table

### Why This Solves the Dual-Write Problem
- Database Is the Source of Truth

- Workflow state and events are stored together

- Either both are written, or neither is written

- Kafka Publishing Is Decoupled

- Kafka failures do not affect database consistency

- Events remain safely stored until published

- No More Inconsistent States

- No ghost workflows

- No untracked executions

- No stuck “processing” workflows

### What Happens During Failures
- If Kafka Is Down

  - Events stay in the outbox table

  - Processor retries later

  - No data is lost

- If Processor Crashes

  - Outbox records remain unchanged

  - Another processor instance can continue

- If Worker Fails

  - Kafka retries delivery

  - Workflow state remains intact

### Why This Architecture Is Reliable

- Eliminates dual writes

- Guarantees event delivery

- Enables accurate workflow tracking

- Supports retries and recovery

- Scales independently at each layer

The final architecture uses the Outbox Pattern to eliminate dual-write issues and ensure reliable, trackable Kafka-based workflow execution.

## Future Improvements
https://www.notion.so/Future-Improvement-2eaa8d47bfcb8076a58cf944f537605f?source=copy_link

## Live Demo

Frontend is deployed and accessible at:
DEMO 
🔗 https://zapclone-frontend.onrender.com

You can use the UI to:
- Create workflows
- Configure triggers and actions
- Generate webhook URLs
- View workflow structure and metadata

> Note: Workflow execution currently runs locally. See the sections below for details.

---

## How the System Runs (High Level)

The system is split into two parts:

1. **Deployed services**
   - Frontend (UI)
   - Primary backend (API + hooks service)

2. **Local execution services**
   - Kafka
   - Outbox processor
   - Worker services (action execution)

The deployed backend handles workflow creation and webhook ingestion.
The actual execution of workflows happens locally via Kafka and workers.

---

## For Users / Reviewers

- You can create workflows using the deployed UI
- Webhooks generated from the UI are functional
- Workflow execution logic is implemented but runs in a local environment
- This separation is intentional and allows safe iteration on execution logic

---

## For Developers: Running Workflow Execution Locally

### Prerequisites
- Node.js
- PostgreSQL
- Kafka (local)
- Git

---

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-root>
