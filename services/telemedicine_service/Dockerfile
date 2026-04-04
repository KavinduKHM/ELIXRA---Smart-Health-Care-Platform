FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/telemedicine-service.jar app.jar
EXPOSE 8085
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8085/actuator/health | grep -q UP || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]