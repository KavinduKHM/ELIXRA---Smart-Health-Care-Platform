FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy any JAR from target folder (build the JAR locally before running compose)
COPY target/*.jar app.jar

EXPOSE 8081

RUN apk add --no-cache curl

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
	CMD curl -f http://localhost:8081/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]