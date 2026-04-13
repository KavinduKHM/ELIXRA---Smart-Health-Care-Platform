FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8083
RUN apk add --no-cache curl

ENTRYPOINT ["java", "-jar", "app.jar"]