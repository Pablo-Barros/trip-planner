## Description

Trip Planner API built with NestJS. Using MongoDB for data storage and Swagger for API documentation and DDD with clean architecture. Tests are written with Jest.

## Features

- 🚀 **NestJS Framework** - Modern Node.js framework with TypeScript
- 🗄️ **MongoDB Integration** - Document-based database with Mongoose
- 📚 **Swagger Documentation** - Interactive API documentation
- 🏗️ **Domain Driven Design** - Clean architecture with separated layers
- 🧪 **Comprehensive Testing** - Unit and integration tests with Jest
- 🐳 **Docker Support** - Development and production environments
- 🔍 **Trip Search & Management** - Search, create, list, and delete trips
- 📊 **Trip Sorting** - Sort by fastest or cheapest options

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/trips/search?origin=SYD&destination=GRU&sortBy=fastest` | Search trips with sorting |
| `POST` | `/trips` | Create a new trip |
| `GET` | `/trips` | List all trips |
| `DELETE` | `/trips/:id` | Delete a trip by ID |

## First steps for project setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/trip-planner.git
   cd trip-planner
   ```

2. Configure your environment variables in `.env`:
   ```bash
   TRIPS_API_URL=your-external-api-url
   TRIPS_API_KEY=your-api-key
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/trip-planner
   ```

## Technology Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Testing**: Jest
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose
- **Architecture**: Domain Driven Design (DDD)
- **Linting**: ESLint

## Project Structure

```
src/
├── modules/
│   └── trips/
│       ├── application/          # Use cases and DTOs
│       │   ├── dto/             # Data Transfer Objects
│       │   └── services/        # Application services
│       ├── domain/              # Business logic
│       │   ├── entities/        # Domain entities
│       │   └── services/        # Domain services
│       ├── infrastructure/      # External concerns
│       │   ├── external/        # External API clients
│       │   └── persistence/     # Database repositories
│       └── interface/           # Controllers and modules
├── app.module.ts               # Root module
└── main.ts                    # Application entry point
```

## Next steps
### Project setup with npm

```bash
$ npm install
```

### Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
- **Development**: http://localhost:3000/api
- **Production**: the docs will not be available

## Database Connection

You can use either a local MongoDB instance or a Docker container or mongo atlas free tier for testing purposes.

### MongoDB Compass
To connect to the Docker MongoDB instance:
- **Connection String**: `mongodb://localhost:27017/trip-planner`
- **Host**: `localhost`
- **Port**: `27017`
- **Database**: `trip-planner`

## Project setup with Docker
I made a Dockerfile and docker-compose.yml for easy development and production like environments. 

### **Disclaimer**
> These are not real world docker files, but they should work for demonstration and easy setup.

### Development
```bash
# Building the containers
$ docker compose -f docker-compose.dev.yml build

# Starting the containers
$ docker compose -f docker-compose.dev.yml up

# Starting the containers in detached mode
$ docker compose -f docker-compose.dev.yml up -d

# Stopping the containers
$ docker compose -f docker-compose.dev.yml down
```

### Production
```bash
# Building the containers
$ docker compose -f docker-compose.prod.yml build

# Starting the containers
$ docker compose -f docker-compose.prod.yml up

# Starting the containers in detached mode
$ docker compose -f docker-compose.prod.yml up -d

# Stopping the containers
$ docker compose -f docker-compose.prod.yml down
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **MongoDB connection issues**
   ```bash
   # Check if MongoDB is running
   docker compose ps
   
   # View MongoDB logs
   docker compose logs mongo
   ```

3. **Environment variables not loaded**
   - Ensure `.env` file exists in the root directory
   - Check that all required variables are set
   - Restart the application after changes

## License

This project is [MIT licensed](LICENSE).

## Stay in touch

- Author - pablobarroscordo@gmail.com