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
