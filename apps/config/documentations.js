const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "EIGEN BE TEST - Fathoni Zikri Nugroho Documentation",
    description: "API Documentation for LIBRARY API - EIGEN BE TEST - Fathoni Zikri Nugroho.",
    version: "1.0.0",
    contact: {
      email: "fathonizikri11@gmail.com",
    },
  },
  servers: [
    {
      url: "http://localhost:3000/",
      description: "Local Development Server",
    },
  ],
  tags: [
    {
      name: "Book",
      description: "Everything about CRUD books",
      externalDocs: {
        description: "",
        url: "#",
      },
    },
    {
      name: "Member",
      description: "Everything about CRUD member",
      externalDocs: {
        description: "",
        url: "#",
      },
    },
    {
      name: "Borrow",
      description: "Everything about Borrowing and Returning Book",
      externalDocs: {
        description: "",
        url: "#",
      },
    },
  ],
  basePath: "/api",
};

const options = {
  swaggerDefinition,
  apis: ["./documentations/**/*.yaml"],
};

module.exports = options;
