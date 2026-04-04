FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/service-discovery.jar app.jar
EXPOSE 8761
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8761/actuator/health | grep -q UP || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]