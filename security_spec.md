# Security Spec

## Data Invariants
1. A user can only access and modify their own `/users/{userId}` profile, except for readonly global data if any exists. They cannot modify anyone else's profile.
2. Only system users/admins can create or edit `/courses/{courseId}`. Standard users can only read them.
3. Every `user_progress` must reference a valid `userId` (which corresponds to `request.auth.uid`), and users can only read/write their own progress.
4. `simulation_results` and `ai_interactions` are strictly tied to a `userId`. Users can only create/update/delete their own results/interactions.
5. `createdAt` timestamps cannot be faked; they must be exactly `request.time`.

## The "Dirty Dozen" Payloads

1. Spoofed User ID Profile Edit: Attempting to create a profile with a mismatched userId (`userId: "malicious_uid"` while authenticated as `"uid123"`).
2. Giant Profile Attack: Try to inject a 2MB string into `name`.
3. Elevation of Privilege: Add `isAdmin: true` to a profile during creation/update.
4. Unverified user edit: Attempt to write to profile with an unverified email.
5. Create Course: A non-admin user attempts to create a course document in `/courses/`.
6. Edit Other User's Progress: User `"attacker"` tries to update `user_progress/victim_123`.
7. Fake Timestamp Create: Give a past or future timestamp to `createdAt` for `simulation_results`.
8. Fake Timestamp Update: Try to change `createdAt` during an update.
9. Oversize Array: Try to insert 10,000 goals into the `goals` array of a profile.
10. Incomplete Schema: Attempting to create `user_progress` without setting `courseId`.
11. Unauthorized Read List: Attempting to query `ai_interactions` without restricting the query to the user's `userId`.
12. Invalid Simulation Score Type: Posting a string instead of a number for `score` in a simulation result.

## Phase 3: Primitive Definition
```javascript
function isValidId(id) { 
  return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$'); 
}
function incoming() { return request.resource.data; }
function existing() { return resource.data; }
function isSignedIn() { return request.auth != null; }
function isVerified() { return isSignedIn() && request.auth.token.email_verified == true; }
function isAdmin() { return isSignedIn() && exists(/databases/$(database)/documents/admins/$(request.auth.uid)); }
```

