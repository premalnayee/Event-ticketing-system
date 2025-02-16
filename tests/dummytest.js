const { MongoClient } = require('mongodb');
const SuperTest = require('supertest');
const startServer = require('../src/server');

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
		server = await startServer().listen(8888);
		agent = await SuperTest(server);
	});

	afterAll(async () => {
		await server.close();
	});

	test('Express server test', async () => {
		const res = await agent.get('/test').expect(200);
		expect(res.text).toEqual('hello world');
	});

	test('Mongo connection test', async () => {
		const conn = await MongoClient.connect('mongodb://127.0.0.1:27227');
		const db = await conn.db('test');
		const col = await db.collection('testCol');

		const dummyBson = { _id: 1, test: 1 };
		await col.insertOne(dummyBson);

		await expect(col.findOne({ _id: dummyBson._id })).resolves.toEqual(dummyBson);
		await conn.close();
	});
});
