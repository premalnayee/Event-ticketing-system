const SuperTest = require('supertest');
const createServer = require('../src/server');
const port = 8888;

/**
 * This is a dummy test file to establish the skeleton framework for the project
 * The tests below assures the basic expressJS server has been established and responding,
 * and an in memory mongodb database has been setup for integration testing.
 *
 * Feel free to remove the entire file.
 */

describe('Dummy test', () => {
	let server;
	let agent;

	beforeAll(async () => {
		const app = await createServer();
		server = app.listen(port);
		agent = SuperTest(server);
	});

	afterAll(async () => {
		await server.close();
	});

	test('Express server test', async () => {
		const res = await agent.get('/test').expect(200);
		expect(res.text).toEqual('hello world');
	});

	// unit test to test only a single event can be created on a given day
	test('Single event per day', async () => {
		// Add a new event
		let res = await agent.post('/events').send({
			name: 'Charity Auction',
			date: '31/10/2024',
			capacity: 100,
			costPerTicket: 5
		}).expect(201);
		expect(res.body).toHaveProperty('eventId');

		// Add another event on the same day
		res = await agent.post('/events').send({
			name: 'Charity Auction',
			date: '31/10/2024',
			capacity: 100,
			costPerTicket: 5
		}).expect(400);
		expect(res.body).toHaveProperty('error', 'An event is already scheduled on this date.');
	});


	// full integration test based on the requirements
	test('Full integration test of events', async () => {
		// Add a new event
		const res = await agent.post('/events').send({
			name: 'Charity Auction',
			date: '01/11/2024',
			capacity: 100,
			costPerTicket: 5
		}).expect(201);
		expect(res.body).toHaveProperty('eventId');

		const eventId = res.body.eventId;

		// Add ticket to the event
		const ticketRes = await agent.post(`/events/${eventId}/tickets`).send({
			event: eventId,
			nTickets: 5
		}).expect(200);
		expect(ticketRes.body).toHaveProperty('ticketId');

		// Get the ticket sales statistics
		const statsRes = await agent.get(`/events/stats`).expect(200);
		expect(statsRes.body).toHaveProperty('monthlyStats');
		expect(Array.isArray(statsRes.body.monthlyStats)).toBe(true);
		// Verify that statistics are provided for the past 12 months
		expect(statsRes.body.monthlyStats.length).toBe(12);

		// Validate structure of each monthly stats object
		statsRes.body.monthlyStats.forEach(stat => {
			expect(stat).toEqual(
				expect.objectContaining({
					year: expect.any(Number),
					month: expect.any(Number),
					revenue: expect.any(Number),
					nEvents: expect.any(Number),
					averageTicketsSold: expect.any(Number)
				})
			);
		});

		// Example: expected output structure for reference (the test doesn't verify exact values)
		// [
		//   { "year": 2024, "month": 9, "revenue": 10203, "nEvents": 10, "averageTicketsSold": 40 },
		//   { "year": 2024, "month": 8, "revenue": 0, "nEvents": 0, "averageTicketsSold": 0 },
		//   // …similar output for the July 2024 to October 2023.
		// ]

	});

});
