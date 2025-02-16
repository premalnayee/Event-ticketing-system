const express = require('express');
const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

const createService = async () => {
    const app = express();

	// Middleware to parse JSON bodies from requests
    app.use(express.json());

    // Start the in-memory MongoDB server
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const conn = await MongoClient.connect(uri);
    const db = conn.db('event_ticketing_db');
    const col = db.collection('events');

    app.post('/test', (req, res) => {
		console.log(req.body);
        res.send('In-memory MongoDB is running.');
    });

    app.post('/events', (req, res) => {
		console.log('POST /events');
		console.log(req.body);
        const { name, date, capacity, costPerTicket } = req.body;
        if (!name || !date || !capacity || !costPerTicket) {
            return res.status(400).json({ error: 'Missing required event fields.' });
        }

        app.locals.events = app.locals.events || [];
        if (app.locals.events.find(event => event.date === date)) {
            return res.status(400).json({ error: 'An event is already scheduled on this date.' });
        }

        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newEvent = { id, name, date, capacity, costPerTicket };

        // Save the event to the in-memory database
		app.locals.events.push(newEvent);
        res.status(201).json({ id });
    });

	app.get('/events', async (req, res) => {
		const events = app.locals.events
		res.json(events);
	});

	app.post('/transactions', (req, res) => {
        console.log('POST /transactions');
        console.log(req.body);
        const { event: eventId, nTickets } = req.body;
        
        // Validate input
        if (!eventId || !nTickets || typeof nTickets !== 'number' || nTickets <= 0) {
            return res.status(400).json({ error: 'Invalid request data. Ensure "event" and a positive number "nTickets" are provided.' });
        }

        // Ensure events list exists
        app.locals.events = app.locals.events || [];
        
        // Find the event by ID
        const foundEvent = app.locals.events.find(ev => ev.id === eventId);
        if (!foundEvent) {
            return res.status(404).json({ error: 'Event not found.' });
        }

        // Initialize ticketsSold if not already set
        if (typeof foundEvent.ticketsSold !== 'number') {
            foundEvent.ticketsSold = 0;
        }

        // Check if this transaction would exceed event capacity
        if (foundEvent.ticketsSold + nTickets > foundEvent.capacity) {
            return res.status(400).json({ error: 'Transaction exceeds event capacity or event is sold out.' });
        }

        // Record the transaction by updating ticketsSold and optionally tracking the transaction
        foundEvent.ticketsSold += nTickets;
        app.locals.transactions = app.locals.transactions || [];
        const transaction = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            event: eventId,
            nTickets,
            timestamp: new Date()
        };
        app.locals.transactions.push(transaction);

        res.status(201).json({ transaction });
    });

	app.get('/statistics', (req, res) => {
        // Get the current date and determine the start of the 12-month window.
        const now = new Date();
        const startMonth = new Date(now.getFullYear(), now.getMonth() - 11, 1);

        // Prepare a map for each month in the past 12 months.
        const statsMap = {};
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            statsMap[key] = {
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                revenue: 0,
                nEvents: 0,
                totalTickets: 0 // used for computing averageTicketsSold
            };
        }

        // Grab events from in-memory store.
        const events = app.locals.events || [];

        // Process each event that occurred within the past 12 months.
        events.forEach(ev => {
            // Parse the event date
            const eventDate = new Date(ev.date);
            if (eventDate >= startMonth && eventDate <= now) {
                const key = `${eventDate.getFullYear()}-${eventDate.getMonth() + 1}`;
                // If the month exists in our statsMap, accumulate values.
                if (statsMap[key]) {
                    statsMap[key].nEvents++;
                    const ticketsSold = ev.ticketsSold || 0;
                    statsMap[key].totalTickets += ticketsSold;
                    // revenue from event = costPerTicket multiplied by ticketsSold
                    statsMap[key].revenue += (ev.costPerTicket * ticketsSold);
                }
            }
        });

        // Build the final statistics array, including averageTicketsSold.
        const stats = Object.values(statsMap).map(entry => {
            return {
                year: entry.year,
                month: entry.month,
                revenue: entry.revenue,
                nEvents: entry.nEvents,
                averageTicketsSold: entry.nEvents > 0 ? Math.round(entry.totalTickets / entry.nEvents) : 0
            };
        });

        // Sort descending by year then month so the most recent month is first.
        stats.sort((a, b) => {
            if (a.year === b.year) {
                return b.month - a.month;
            }
            return b.year - a.year;
        });

        res.json(stats);
    });

    return app;
};

module.exports = createService;
