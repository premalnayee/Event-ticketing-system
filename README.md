# Event Ticketing System

This is a simple Node.js project that provides an event ticketing system using Express. For simplicity and quick prototyping (or testing), the project uses in-memory arrays to store events and ticket transactions.

## Features

- **Create Events:** Add events with details such as name, date, capacity, and cost per ticket.
- **List Events:** Retrieve all created events.
- **Purchase Tickets:** Record ticket purchases for a specific event while ensuring that the event capacity is not exceeded.
- **Statistics Endpoint:** Generate monthly statistics for the past 12 months including revenue, number of events, and average tickets sold.
- **In-Memory Storage:** Uses in-memory arrays to simulate a database. Note that this is for demonstration purposes only and is not suitable for production.

## Installation

1. Clone the repository:
```powershell
git clone <repository-url>
```
2. Navigate to the project folder:
```powershell
cd Event-ticketing-system
```
3. Install dependencies:
```powershell
npm install
```
4. Running the Server
To start the server, run:
```powershell
npm start
```
This will start the Express application on the default port (usually 8080).

For development with auto-reloading, run:
```powershell
npm run watch
```
### GET /test

**Description:** Returns a simple welcome message.

**Response:**

```
"hello world"
```

### POST /events

**Description:** Creates a new event.

**Expected Request Body:**

```json
{
    "name": "Charity Auction",
    "date": "31/10/2024",
    "capacity": 100,
    "costPerTicket": 5
}
```

**Response:** On success, returns HTTP status 201 with the generated event ID.
```json
{ "eventId": "<generated_event_id>" }
```

**Error Response:** Returned when required fields are missing or if an event is already scheduled on the same date.

### GET /events

**Description:** Retrieves the list of all events stored in memory.

**Response:** An array of event objects.

### POST /events/:eventId/tickets

**Description:** Records a ticket purchase for the event specified by eventId.

**Route Parameter:**
- **eventId:** The ID of the event.

**Expected Request Body:**
```json
{
  "nTickets": 5
}
```

**Response:** On success, returns HTTP status 200 with a ticket ID.
```json
{ "ticketId": "<generated_ticket_id>" }
```

**Error Response:** Returned if the event is not found, if the number of tickets is invalid, or if the purchase would exceed the event capacity.

### GET /events/stats

**Description:** Retrieves monthly ticket sales statistics for the past 12 months.

**Response:** Returns an object with a `monthlyStats` property that is an array of statistics for each month.

Example:
```json
{
  "monthlyStats": [
    { "year": 2024, "month": 9, "revenue": 10203, "nEvents": 10, "averageTicketsSold": 40 },
    { "year": 2024, "month": 8, "revenue": 0, "nEvents": 0, "averageTicketsSold": 0 }
    // ...similar output for previous months
  ]
}
```

### Testing
This project uses Jest and Supertest for integration testing.

To run tests, execute:
```powershell
npm test
```

### Notes
This project uses in-memory arrays to simulate a database for demonstration and testing purposes. It is not intended for production use.
Feel free to extend the API and modify the code according to your needs.