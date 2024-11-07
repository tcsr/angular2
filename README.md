# TApp


Step 1: Backend Setup with Node.js, Express, PostgreSQL, and Socket.io
Install Dependencies:

npm install express socket.io pg dotenv cors
Directory Structure:

project/
├── server.js         # Main server file
├── db.js             # Database connection file
├── .env              # Environment variables file
.env File:

Create a .env file to store PostgreSQL connection details.

dotenv
Copy code
PGHOST=localhost
PGUSER=yourUsername
PGPASSWORD=yourPassword
PGDATABASE=yourDatabase
PGPORT=5432
PORT=3000
db.js - Database Connection:


// db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
server.js - Server and WebSocket Implementation:

javascript
Copy code
// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

async function fetchEstimationSummary() {
  const query = `
    SELECT 
      COUNT(*) AS total,
      COUNT(CASE WHEN status = 'new' THEN 1 END) AS new,
      COUNT(CASE WHEN status = 'due' THEN 1 END) AS due,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed
    FROM estimation_summary;
  `;
  const { rows } = await db.query(query);
  return rows[0];
}

async function sendDataUpdates() {
  const data = await fetchEstimationSummary();
  io.emit('estimation-update', data);
}

// Emits data to connected clients every 10 seconds.
setInterval(sendDataUpdates, 10000);

io.on('connection', (socket) => {
  console.log('Client connected');
  sendDataUpdates(); // Send initial data on connect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
Step 2: Frontend Setup in Angular
Install Socket.io Client:


npm install socket.io-client
Establish a WebSocket Connection and Fetch Data in Real-Time

app.module.ts: Make sure HttpClientModule is imported if you’re making any HTTP requests, as it’s generally required for real-world apps.

typescript
Copy code
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
Create a Service for WebSocket Handling:

real-time.service.ts:

typescript
Copy code
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RealTimeService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000'); // Node server URL
  }

  // Observable to receive estimation summary updates
  getEstimationSummaryUpdates(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('estimation-update', (data) => {
        observer.next(data);
      });
    });
  }
}
Using the Service in a Component:

app.component.ts:

typescript
Copy code
import { Component, OnInit } from '@angular/core';
import { RealTimeService } from './real-time.service';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <h2>Estimation Summary</h2>
      <p>Total: {{ estimationSummary?.total }}</p>
      <p>New: {{ estimationSummary?.new }}</p>
      <p>Due: {{ estimationSummary?.due }}</p>
      <p>Completed: {{ estimationSummary?.completed }}</p>
    </div>
  `
})
export class AppComponent implements OnInit {
  estimationSummary: { total: number, new: number, due: number, completed: number };

  constructor(private realTimeService: RealTimeService) {}

  ngOnInit() {
    this.realTimeService.getEstimationSummaryUpdates().subscribe((data) => {
      this.estimationSummary = data;
    });
  }
}

Explanation of Key Points
Backend Polling and WebSocket Emit: The setInterval in server.js fetches data every 10 seconds and emits it to connected clients. This can be modified to trigger only on data changes.
Socket.io on the Angular Side: The Angular service establishes a connection and listens for estimation-update events to update the UI.
Automatic UI Update: The Angular component listens for data changes and updates the displayed summary counts in real-time.
This structure allows the Angular app to receive real-time data updates from the Node.js backend, which fetches data from PostgreSQL and sends it over WebSocket.


===================

To ensure real-time updates from the database to the server API without constant polling, we can use PostgreSQL's LISTEN/NOTIFY feature. This approach lets the database notify the Node.js server only when relevant data changes occur, reducing unnecessary load and providing near-instant updates.

Here’s how to set it up:

Step 1: Database Setup with PostgreSQL's LISTEN/NOTIFY
Create a Trigger Function:

Define a trigger function in PostgreSQL that will notify the server whenever an update occurs in the estimation_summary table.
sql
Copy code
CREATE OR REPLACE FUNCTION notify_estimation_update() RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('estimation_updates', 'Data has been updated');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
Create a Trigger:

Attach the trigger to the table to fire whenever an insert, update, or delete occurs.
sql
Copy code
CREATE TRIGGER estimation_update_trigger
AFTER INSERT OR UPDATE OR DELETE ON estimation_summary
FOR EACH ROW EXECUTE FUNCTION notify_estimation_update();
Step 2: Backend Setup with Node.js
Install PostgreSQL and Socket.io (if not already installed):

bash
Copy code
npm install pg socket.io express cors dotenv
Update the db.js Connection File to Listen for Notifications:

Update the PostgreSQL client in Node.js to listen for notifications from the database.

javascript
Copy code
// db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

pool.connect((err, client) => {
  if (err) throw err;

  client.query('LISTEN estimation_updates'); // Listen for notifications

  client.on('notification', async (msg) => {
    console.log('Notification received:', msg);
    // Emit an event when a notification is received
    const data = await fetchEstimationSummary(); // Fetch updated data
    io.emit('estimation-update', data);
  });
});

async function fetchEstimationSummary() {
  const query = `
    SELECT 
      COUNT(*) AS total,
      COUNT(CASE WHEN status = 'new' THEN 1 END) AS new,
      COUNT(CASE WHEN status = 'due' THEN 1 END) AS due,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed
    FROM estimation_summary;
  `;
  const { rows } = await pool.query(query);
  return rows[0];
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  fetchEstimationSummary,
};
Set Up Server for WebSocket Connections:

In server.js, use socket.io to send the updated data to clients only when triggered by the database.

javascript
Copy code
// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('Client connected');
  db.fetchEstimationSummary().then((data) => {
    socket.emit('estimation-update', data); // Send initial data on connect
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
Step 3: Angular Frontend Implementation
Use the Angular code from the previous example, as it will automatically handle real-time updates whenever they are pushed by the server.

This setup ensures the database only notifies the server when there’s an actual change in data. The server, in turn, pushes the update to all connected clients, achieving real-time updates with minimal load on both the backend and frontend.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
