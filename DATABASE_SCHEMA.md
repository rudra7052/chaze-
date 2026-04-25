# ChazeX - Firestore Database Schema

## Overview
This document outlines the Firestore NoSQL database schema for **ChazeX**, a fintech learning platform. The design is normalized where appropriate for fast queries but embeds data (like modules in courses) where it rarely changes and is often read together, optimizing for Firebase's document-oriented structure.

## 1. Collections & Relationships

*   **`users`** (Root Collection)
    *   1:N with `user_progress`
    *   1:N with `simulation_results`
    *   1:N with `ai_interactions`
*   **`courses`** (Root Collection)
    *   Embeds `modules` (Array of objects)
*   **`user_progress`** (Root Collection)
    *   Links `userId` to `courseId`
*   **`simulation_results`** (Root Collection)
*   **`ai_interactions`** (Root Collection)

---

## 2. Schema Definition & Sample JSON

### 2.1. `users` Collection
Stores user profile data. Authentication is handled by Firebase Auth, and the UID from Auth is used as the Document ID here.

**Document ID:** `{userId}` (from Firebase Auth)
```json
{
  "userId": "usr_abc123xyz",
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "createdAt": "2023-10-25T14:30:00Z",
  "goals": [
    "saving",
    "investing",
    "learning"
  ],
  "riskProfile": "medium"
}
```

### 2.2. `courses` Collection
Stores the learning paths. Since modules belong strictly to a course and are reasonably small, they are embedded as an array inside the course document to save read operations.

**Document ID:** `{courseId}`
```json
{
  "courseId": "crs_finance101",
  "title": "Financial Basics",
  "description": "Learn the absolute essentials of managing money.",
  "category": "basics",
  "difficulty": "beginner",
  "modules": [
    {
      "moduleId": "mod_1",
      "title": "What is Money?",
      "content": "https://youtube.com/watch?v=example",
      "duration": 5,
      "order": 1
    },
    {
      "moduleId": "mod_2",
      "title": "Introduction to Interest",
      "content": "Compound interest is the 8th wonder of the world...",
      "duration": 10,
      "order": 2
    }
  ]
}
```

### 2.3. `user_progress` Collection
Tracks an individual user's completion status for a specific course.

**Document ID:** `{progressId}` (or `{userId}_{courseId}`)
```json
{
  "progressId": "prog_abc123_crs101",
  "userId": "usr_abc123xyz",
  "courseId": "crs_finance101",
  "completedModules": [
    "mod_1"
  ],
  "progressPercentage": 50,
  "lastAccessed": "2023-10-26T09:15:00Z",
  "quizScores": [
    {
      "moduleId": "mod_1",
      "score": 90,
      "attempts": 1
    }
  ]
}
```

### 2.4. `simulation_results` Collection
Stores the input and output data from the budget/investment simulators.

**Document ID:** `{simulationId}`
```json
{
  "simulationId": "sim_789def",
  "userId": "usr_abc123xyz",
  "type": "budget",
  "inputData": {
    "income": 5000,
    "needs": 2500,
    "wants": 1500,
    "savings": 1000
  },
  "resultData": {
    "budgetRule": "50/30/20",
    "healthStatus": "Good",
    "recommendation": "Try to reduce wants to 30% of income."
  },
  "score": 85,
  "createdAt": "2023-10-27T11:00:00Z"
}
```

### 2.5. `ai_interactions` Collection
Stores interactions with the FloatChat or AI summaries for analytics and history.

**Document ID:** `{interactionId}`
```json
{
  "interactionId": "ax_456ghi",
  "userId": "usr_abc123xyz",
  "type": "chat",
  "input": "How much should I save for an emergency fund?",
  "output": "A good rule of thumb is 3 to 6 months of living expenses.",
  "timestamp": "2023-10-28T16:20:00Z"
}
```

---

## 3. Design Rationale for Scalability
*   **Separation of Concerns:** `users` only holds profile definitions, not active progress, keeping user loads fast and lightweight.
*   **Embedded vs. Referenced Data:** `courses` embeds `modules` because querying a course usually implies displaying its module list. This prevents the N+1 read problem.
*   **Composite IDs:** Using `{userId}_{courseId}` as the document ID in `user_progress` prevents duplicates and makes looking up a specific progress record O(1) without requiring complex index queries.
*   **Flat Metrics:** Placing `progressPercentage` directly on the `user_progress` document allows the Dashboard to draw progress bars extremely fast across multiple courses without needing to calculate dynamically from `completedModules` size vs. total.
