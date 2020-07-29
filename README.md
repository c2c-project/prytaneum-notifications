# Notification-Service

## High-Level

The notification-service manages the notifications that are sent out to potential and subscribed Prytaneum users.

## API Endpoitns

### /invite-many

- Description: An `admin`, `moderator`, and `speaker` can send out an invite to a list of invitees via email while ensuring not to send them to unsubscribed users.
- HTTP Method: POST
- Request Body:

```typescript
{
  inviteeList: [{email: 'test@example.com', fName: 'First', lName: 'Last' }];
  MoC: 'Member of Congress',
  topic: 'Town Hall Topic',
  eventDateTime: 'July 31, 12:00 PM PST',
  constituentScope: 'State',
  region: 'example_coast',
  deliveryTime: 'ISO Date-Time',
}
```

- Response:
  - Status 200
    - Success
    - Status 400
      - message: 'Invalid ISO Date format' | 'Past time picked'
    - Status 500
      - Invalid data sent or Non-Client error

### /invite-one

- An `admin`, `moderator`, and `speaker` can send out an invite to a single contact who is not unsubscribed.
- HTTP Method: POST
- Request Body:

```typescript
{
  email: 'test@example.com',
  fName: 'First',
  lName: 'Last',
  MoC: 'Member of Congress',
  topic: 'Town Hall Topic',
  eventDateTime: 'July 31, 12:00 PM PST',
  constituentScope: 'State',
  region: 'example_coast',
  deliveryTime: 'ISO Date-Time',
}

```

- Response:
  - Status 200
    - Success
  - Status 400
    - message: 'Invalid ISO Date format' | 'Past time picked'

### /subscribe

- An `admin`, `moderator`, `speaker`, and `user` can subscribe to getting notifications sent to their email.
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

### /unsubscribe

- An `admin`, `moderator`, `speaker`, and `user` can unsubscribe to getting notifications sent to their email.
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
