"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const schema_1 = require("./schema");
const resolvers_1 = require("./resolvers");
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
async function startServer() {
    const app = (0, express_1.default)();
    const httpServer = http_1.default.createServer(app);
    const server = new server_1.ApolloServer({
        typeDefs: schema_1.typeDefs,
        resolvers: resolvers_1.resolvers,
        plugins: [(0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
    });
    await server.start();
    app.use('/graphql', (0, cors_1.default)(), express_1.default.json(), (0, express4_1.expressMiddleware)(server, {
        context: async () => ({ prisma }),
    }));
    app.get('/health', (_, res) => {
        res.status(200).send('OK');
    });
    const PORT = process.env.PORT || 4000;
    await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
    logger_1.logger.info(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}
process.on('unhandledRejection', (error) => {
    logger_1.logger.error('Unhandled rejection:', error);
});
startServer().catch((error) => {
    logger_1.logger.error('Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map