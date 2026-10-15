import express from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config"
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";

import schema from "./graphql/schema.js";
import { createContext } from "./graphql/context.js";
import mongoose from "mongoose";

const connect_db = async () => {
  try {
    await mongoose.connect("mongodb+srv://manikatti90_db_user:Ww64BQoMcU5BQ4XR@cluster0.bb04vo8.mongodb.net/inaiudb?retryWrites=true&w=majority");
    console.log("mongodb connected successfully");
  } catch (error) {
    console.log(error);
  }
};

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

const apolloServer = new ApolloServer({
  schema,
});
connect_db();
await apolloServer.start();

app.use(
  "/graphql",
  expressMiddleware(apolloServer, {
    context: createContext,
  }),
);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
   console.log(`Server running on http://localhost:${PORT}/graphql`);
});
