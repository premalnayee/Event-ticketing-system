const express = require('express');

const createService = () => {
	const app = express();

	app.get('/test', (req, res) => {
		// this is a route used for the sample test case - Feel free to remove
		res.send('hello world');
	});

	return app;
};

module.exports = createService;
