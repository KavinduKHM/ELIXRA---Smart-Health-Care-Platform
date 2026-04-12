# infrastructure/service-discovery/Dockerfile
FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

COPY target/service-discovery.jar app.jar

EXPOSE 8761

ENTRYPOINT ["java","-jar","app.jar"]
