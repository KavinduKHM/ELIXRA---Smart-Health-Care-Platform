FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/appointment-service.jar app.jar
EXPOSE 8084
RUN apk add --no-cache curl
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8084/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]