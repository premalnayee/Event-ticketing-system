const createServer = require('./server');

const port = 8080;
createServer().listen(port, () => {
	console.log(`Server started on ${port}`);
});
