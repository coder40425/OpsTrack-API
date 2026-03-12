import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "OPS Track API",
      version: "1.0.0",
      description: "Task Management API with production-ready backend demonstrating: • Redis caching • BullMQ async workers • Prometheus metrics • Grafana dashboards • MongoDB query instrumentation • Dockerized deployment "
    },

    servers: [
  {
    url: "https://opstrack-api.onrender.com",
    description: "Production server"
  },
  {
    url: "http://localhost:5000",
    description: "Local development"
  }
],

    tags: [
      { name: "Auth", description: "Authentication APIs" },
      { name: "Tasks", description: "Task CRUD operations" },
      { name: "Monitoring", description: "Observability endpoints" }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },

  apis: ["./src/routes/*.ts"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const setupSwagger = (app: Express) => {

  console.log("Swagger UI available at http://localhost:5000/api-docs");

  // serve swagger UI
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // optional JSON route
  app.get("/api-docs.json", (req, res) => {
    res.json(swaggerSpec);
  });
};