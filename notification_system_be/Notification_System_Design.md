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





