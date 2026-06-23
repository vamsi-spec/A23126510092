# Notification System Design

## Stage 1

### REST API Endpoints

**Base URL:** `/api/notifications`  
**Required Headers for all endpoints:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer "
}
```

### 1. Get all notifications for a student
```
GET /api/notifications?studentId=1042&page=1&limit=20

getting for each student per page limit condition
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "Placement",
      "message": "XYZ Compamny hiring",
      "isRead": false,
      "createdAt": "2026-06-23T12:57:37Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```
#### 2. Get Single Notification
```
GET /api/notifications/:id
```
Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "Result",
    "message": "sem-syllabus",
    "isRead": false,
    "createdAt": "2026-04-22T17:51:30Z"
  }
}
```

#### 3. Single notification mark as a read
```
PATCH /api/notifications/:id/read
```
Request body: None  
Response:
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### 4. Mark All Notifications as Read
```
PATCH /api/notifications/read-all
give the studentId marks as all read
```
Request Body:
```json
{ "studentId": 1042 }
```
Response:
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```


#### 5. Delete a Notification
```
DELETE /api/notifications/:id
delelting the particular notification by sending the id
```
Response:
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

#### 6. Notifying number of students at once made by admin
```
POST /api/notifications/notify-all
```
Request Body:
```json
{
  "type": "Placement",
  "message": "XYZ Compamny is hiring",
}
```
Response:
```json
{
  "success": true,
  "message": "Notification sent successfully for N no.of students"
}
```

#### 8. Get Unread Count
```
GET /api/notifications/unread-count?studentId=1042
```
Response:
```json
{
  "success": true,
  "unreadCount": 12
}
```

### Real-Time Notification Mechanism

**Chosen Technology: Server-Sent Events (SSE)**

**Endpoint:**
```
GET /api/notifications/stream?studentId=1042
Headers: Authorization: Bearer <token>
```

**Why SSE over WebSockets or Polling:**

because client just want to recieve the notification.
The client does not need to send continuous data back to the server, so communication is one-way (server → client).
SSE: Server keeps sending updates to client (good for notifications)
WebSockets: Both server and client communicate (useful for chat apps)
Polling: Client keeps asking server again and again (less efficient and wastes resources)





## Stage 2

### Database Choice: PostgreSQL

**Why PostgreSQL over NoSQL:**
- Notifications have a clear, structured schema with relationships (student → notifications)
- ACID compliance ensures no notification is lost or duplicated
- Complex queries (filter by type, date range, read status) are natural in SQL
- support for indexing strategies.

### Schema

```sql
CREATE TABLE students (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  roll_no     VARCHAR(50) UNIQUE NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  notification_type   VARCHAR(20) NOT NULL CHECK (notification_type IN ('Placement', 'Result', 'Event')),
  message             TEXT NOT NULL,
  is_read             BOOLEAN DEFAULT false,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_student_id ON notifications(student_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_composite ON notifications(student_id, is_read, created_at DESC);
```

### Problems at Scale (50,000 students, 5,000,000 notifications)

* **Full table scans (Searching without a map)**: Without indexes, every time a student checks their notifications, the database has to read through all 5 million rows from start to finish just to find theirs. This makes requests extremely slow.
* **Lock contention (Database traffic jams)**: When the admin sends a notification to all 50,000 students at once, the database is busy writing new rows. This can lock the tables/rows, preventing students from reading their notifications at the same time.
* **Memory pressure (Loading too much at once)**: Trying to load all notifications for a student on every single page load uses up all the database memory. We need to use pagination (like loading 20 at a time).
* **Index bloat (Too many lists to update)**: Having too many indexes makes searching faster but slows down saving new notifications, because the database has to update multiple index lists every single time a new notification is created.


### SQL Queries for Stage 1 APIs

```sql
SELECT id, notification_type, message, is_read, created_at
FROM notifications
WHERE student_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

SELECT id, notification_type, message, is_read, created_at
FROM notifications
WHERE id = $1;

UPDATE notifications
SET is_read = true
WHERE id = $1;

UPDATE notifications
SET is_read = true
WHERE student_id = $1 AND is_read = false;

DELETE FROM notifications WHERE id = $1;

INSERT INTO notifications (student_id, notification_type, message)
SELECT unnest($1::int[]), $2, $3;

SELECT COUNT(*) as unread_count
FROM notifications
WHERE student_id = $1 AND is_read = false;
```

---


## Stage 3 - Query Analysis

### 1. Is the query correct?
Not fully correct because:
- `SELECT *` fetches unnecessary data
- Column names should follow snake_case (`student_id`, `is_read`, `created_at`)
- No `LIMIT`, so it may return too many rows

---

### 2. Why is it slow?
- Without indexes, database does a full table scan (O(n))
- Sorting with `ORDER BY` adds extra cost

---

### 3. Improved Query

```sql
CREATE INDEX idx_notifications_student_unread 
ON notifications(student_id, is_read, created_at DESC)
WHERE is_read = false;
SELECT id, notification_type, message, created_at
FROM notifications
WHERE student_id = 1042 AND is_read = false
ORDER BY created_at DESC
LIMIT 20;
4. Is indexing every column good?

No.

Slows INSERT/UPDATE/DELETE
Takes extra storage
Only useful indexes should be created
5. Placement notification (last 7 days)
SELECT DISTINCT s.id, s.name, s.email
FROM students s
JOIN notifications n ON n.student_id = s.id
WHERE n.notification_type = 'Placement'
AND n.created_at >= NOW() - INTERVAL '7 days';
