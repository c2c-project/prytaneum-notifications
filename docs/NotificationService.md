# Documentation for Notification Service

## Endpoints

## invite

An `admin`, `moderator`, and `speaker` can uplaod a file which can be parsed into an array of objects containing the relevant information to send out a single invitation to all contacts who are not unsubscribed.

```mermaid
sequenceDiagram
  participant U as User
  participant C as Client
  participant NS as Notification Service
  participant DB as Database
  participant ES as Email Service
  participant R as Recipiant
  U-->>C: Upload File
  C-->>NS: Send Data as string
  NS-->>NS: Parse data
  NS-->>DB: Request Unsubscribe List
  DB->>NS: Get Unsub List
  NS-->>ES: Filter & Send Data
  ES-->>R: Notification
  NS->>C: Return Success/Error Response
  C->>U: Display Status of Response
```

## subscribe

An `admin`, `moderator`, `speaker`, and `user` can subscribe to get notifications sent to their email.

```mermaid
sequenceDiagram
  participant U as User
  participant C as Client
  participant NS as Notification Service
  participant DB as Database
  U-->>C: Click Subscribe Link/Button
  C-->>NS: Subscribe
  NS-->>DB: Append Email to Subscriber List
  DB->>NS: Response
  NS->>C: Return Success/Error Response
  C->>U: Display Status of Response
```

## unsubscribe (Embeded Info In Link)

An `admin`, `moderator`, `speaker`, and `user` can unsubscribe to prevent getting any notifications sent to their email. This should be doable via a link embedded into each email.

```mermaid
sequenceDiagram
  participant U as User
  participant C as Client
  participant NS as Notification Service
  participant DB as Database
  U-->>C: Click Unsubscribe Link/Button
  C-->>NS: Unsubscribe Request
  NS-->>DB: Append Email to Unsubscribe List
  DB->>NS: Response
  NS->>C: Return Success/Error Response
  C->>U: Display Status of Response
```

## Scheduled Jobs

## Reminders/Notifications (Using RabbitMQ)

```mermaid
sequenceDiagram
  participant C as Client
  participant RMQ as Rabbit MQ
  participant NS as Notification Service
  participant DB as Database
  participant ES as Email Service
  participant R as Recipiant
  participant LS as Logging Service
  C-->>RMQ: Event w/ notification created
  NS-->>RMQ: Pulse to check for new Notification Jobs
  RMQ-->>NS: Consume the Notification Jobs
  NS->>RMQ: Acknowledge Job Data Received
  NS-->>DB: Request relevant Sub List
  DB->>NS: Response
  NS-->>ES: Queue notifications for subscribers
  ES-->>R: Notification
  ES->>NS: Response
  NS-->>LS: Log Output
```

## Permissions

`Roles: admin, moderator, speaker, user`
