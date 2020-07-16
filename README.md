# Notification-Service

## High-Level

The notification-service manages the notifications that are sent out to potential and subscribed Prytaneum users.

## API Endpoitns

### /invite-many

-   Description: An `admin`, `moderator`, and `speaker` can send out an invite to a list of invitees via email while ensuring not to send them to unsubscribed users.

-   Request Body:

```typescript
{
  inviteeList: [{email: 'test@example.com', fName: 'First', lName: 'Last' }];
  MoC: 'Member of Congress',
  topic: 'Town Hall Topic',
  eventDateTime: 'July 31, 12:00 PM PST',
  constituentScope: 'State',
  region: 'example_coast',
}
```

### /invite-one

-   An `admin`, `moderator`, and `speaker` can send out an invite to a single contact who is not unsubscribed.

-   Request Body:

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
}
```

### /subscribe & /unsubscribe

-   An `admin`, `moderator`, `speaker`, and `user` can subscribe/unsubscribe to get notifications sent to their email.

-   Request Body:

```typescript
{
  email: 'test@example.com',
  region: 'example_coast',
}
```
