const createServer = require('./server');

const port = 8080;

async function start() {
    const app = await createServer();
    app.listen(port, () => {
        console.log(`Server started on ${port}`);
    });
}

start();