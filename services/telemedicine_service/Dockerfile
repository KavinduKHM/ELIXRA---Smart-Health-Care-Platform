# Dockerfile for Telemedicine Service
FROM eclipse-temurin:17-jre-alpine

# Set working directory inside container
WORKDIR /app

# Copy the built JAR file from target directory
COPY target/telemedicine-service.jar app.jar

# Expose the port the service runs on
EXPOSE 8085

# Install curl for health check
RUN apk add --no-cache curl

# Health check to verify container is running properly
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8085/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]