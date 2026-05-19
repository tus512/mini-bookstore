# Use Eclipse Temurin JDK 21 as base image for Ubuntu-22.04
FROM eclipse-temurin:21-jdk-jammy

# Set working directory inside container
WORKDIR /app

# Copy Gradle wrapper and Gradle config first
# This helps Docker cache dependencies layer
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Give execute permission to gradlew
RUN chmod +x gradlew

# Download dependencies only
# Faster rebuilds because dependencies are cached
RUN ./gradlew dependencies --no-daemon

# Copy source code
COPY src src

# Expose Spring Boot port
EXPOSE 8080

# Enable Spring Boot DevTools + continuous restart
# bootRun keeps app running with hot reload
CMD ["./gradlew", "bootRun", "--continuous"]