# services/patient_service/Dockerfile
FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

COPY target/patient-service.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]
