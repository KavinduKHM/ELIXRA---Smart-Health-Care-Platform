FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/doctor_service.jar app.jar
EXPOSE 8083
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8083/actuator/health | grep -q UP || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]