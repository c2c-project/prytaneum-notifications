# Notification-Service

## High-Level

The notification-service manages the notifications that are sent out to potential and subscribed Prytaneum users.

## API Endpoitns

### /invite-limited

- Description: An `admin`, `moderator`, and `speaker` can send out an invite to a list of invitees via email while ensuring not to send them to unsubscribed users.
- Limitations: The number of invites is limited by `SIZE_LIMIT = 100`. Invites are sent out normally if this limit is not exceeded, otherwise a `400 status` is returned. 
- HTTP Method: POST
- Request Body:

```typescript
  inviteeList: 'email,fName,lName\ntest@example.com,First,Last' // List sent as strigified csv array buffer
```

- Request Headers:

```typescript
  MoC: 'Member of Congress',
  topic: 'Town Hall Topic',
  eventDateTime: 'July 31, 12:00 PM PST',
  constituentScope: 'State',
  region: 'example_coast',
  deliveryTime?: 'ISO Date-Time', // Optional, defaults to sending immediatly. Limit of 3 days ahead.
  townHallId: 'Town Hall ID',
  previewEmail?: 'preview@example.com' // If included a copy of the invite will be sent to the given email address.
```

- Response:
  - Status 200
    - Success
  - Status 400
    - message: 'Invalid ISO Date format' | 'Past time picked' | 'File undefined' | 'Invite list limit exceeded'
  - Status 500
    - Invalid data sent or Non-Client error

### /invite

- Description: An `admin` can send out an invite to a list of invitees via email while ensuring not to send them to unsubscribed users.
- Limitations: In the case of many unsubscribed users we may need to use multiple unsubLists. This route should only be used by admins as it allows for an unlimited number of invites to be sent out at once.
- HTTP Method: POST
- Request Body:

```typescript
  inviteeList: 'email,fName,lName\ntest@example.com,First,Last' // List sent as strigified csv array buffer
```

- Request Headers:

```typescript
  MoC: 'Member of Congress',
  topic: 'Town Hall Topic',
  eventDateTime: 'July 31, 12:00 PM PST',
  constituentScope: 'State',
  region: 'example_coast',
  deliveryTime?: 'ISO Date-Time', // Optional, defaults to sending immediatly. Limit of 3 days ahead.
  townHallId: 'Town Hall ID',
  previewEmail?: 'preview@example.com' // If included a copy of the invite will be sent to the given email address.
```

- Response:
  - Status 200
    - Success
  - Status 400
    - message: 'Invalid ISO Date format' | 'Past time picked' | 'File undefined'
  - Status 500
    - Invalid data sent or Non-Client error

### /subscribe

- Description: An `admin`, `moderator`, `speaker`, and `user` can subscribe to getting notifications sent to their email.
- HTTP Method: POST
- Request Body:

```typescript
{
  email: 'test@example.com',
  region: 'example_coast',
}
```

- Response:
  - Status 200
    - Success
  - Status 400
    - message: 'Invalid Data'
  - Status 500
    - Invalid data sent or Non-Client error

### /unsubscribe

- Description: An `admin`, `moderator`, `speaker`, and `user` can unsubscribe to getting notifications sent to their email.
- HTTP Method: POST
- Request Body:

```typescript
{
  email: 'test@example.com',
  region: 'example_coast',
}
```

- Response:
  - Status 200
    - Success
  - Status 400
    - message: 'Invalid Data'
  - Status 500
    - Invalid data sent or Non-Client error
