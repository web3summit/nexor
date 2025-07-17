import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

// Define context type
interface MyContext {
  prisma: PrismaClient;
}

async function startServer() {
  // Create Express app and HTTP server
  const app = express();
  const httpServer = http.createServer(app);

  // Create Apollo Server
  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  // Start Apollo Server
  await server.start();

  // Apply Express middleware
  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: async () => ({ prisma }),
    }),
  );

  // Health check endpoint
  app.get('/health', (_, res) => {
    res.status(200).send('OK');
  });

  // Start HTTP server
  const PORT = process.env.PORT || 4000;
  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  
  logger.info(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection:', error);
});

// Start the server
startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
