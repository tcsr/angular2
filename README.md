db.js
------
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

  // Listen for notifications on 'estimation_update' channel
  client.query('LISTEN estimation_update');

  client.on('notification', (msg) => {
    console.log('Notification received:', msg.payload); // This message will be emitted via Socket.io
    // Pass the notification data to the API logic (handled externally)
    if (global.onDatabaseUpdate) {
      global.onDatabaseUpdate(msg.payload);
    }
  });
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};

server.js
-------------

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
// Function to fetch consolidated data from the estimation_summary table
async function fetchEstimationSummary() {
  const query = `
    SELECT 
      SUM(total_revenue) AS total_revenue,
      SUM(total_programs) AS total_programs,
      COUNT(*) AS total_estimates
    FROM estimation_summary;
  `;
  try {
    const { rows } = await db.query(query);
    return rows[0]; // Returning the result object with the summed values
  } catch (error) {
    console.error('Error fetching estimation summary:', error);
    throw error; // Ensure errors are properly propagated
  }
}

// API endpoint to get consolidated counts
app.get('/api/estimation-summary', async (req, res) => {
  try {
    const data = await fetchEstimationSummary();
    res.json(data);
  } catch (error) {
    console.error('Error fetching estimation summary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Function to emit data updates to connected clients
async function sendDataUpdates() {
  const data = await fetchEstimationSummary();
  io.emit('estimation-update', data);
}

// Handle new client connections
io.on('connection', (socket) => {
  console.log('Client connected');
  // Send initial data on connect
  sendDataUpdates();

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Listen for PostgreSQL notifications (triggered by changes to estimation_summary table)
global.onDatabaseUpdate = async (payload) => {
  console.log('Database update detected:', payload);
  await sendDataUpdates();
};

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


data.service.ts
-----------------

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private socket: Socket;
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {
    this.socket = io(this.baseUrl);
  }

  // Fetch initial data from the API
  getInitialData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/estimation-summary`);
  }

  // Listen for real-time updates
  onDataUpdate(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('estimation-update', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
  }
}


app.component.ts
-----------------

export class AppComponent {
  title = 'my-ng-18-app';
  summary: any;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    // Fetch initial data
    this.dataService.getInitialData().subscribe((data) => {
      this.summary = data;
      console.log(this.summary);
    });

    // Listen for real-time updates
    this.dataService.onDataUpdate().subscribe((updatedData) => {
      this.summary = updatedData;
      console.log(this.summary);
    });
  }

}


pg:
-----

-- Step 1: Create a trigger function
CREATE OR REPLACE FUNCTION notify_estimation_update() RETURNS TRIGGER AS $$
BEGIN
    -- Notify the channel 'estimation_update' with a payload (optional)
    PERFORM pg_notify('estimation_update', 'Estimation summary data updated');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create a trigger on estimation_summary table
CREATE TRIGGER estimation_update_trigger
AFTER INSERT OR UPDATE OR DELETE ON estimation_summary
FOR EACH ROW
EXECUTE FUNCTION notify_estimation_update();

