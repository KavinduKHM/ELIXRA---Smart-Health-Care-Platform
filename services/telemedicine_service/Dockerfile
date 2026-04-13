FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the built JAR (use wildcard to avoid name mismatches)
COPY target/*.jar app.jar

EXPOSE 8085

RUN apk add --no-cache curl

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8085/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]