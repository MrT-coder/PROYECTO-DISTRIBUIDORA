# --- ETAPA 1: Construcción (Build) ---
# Usamos una imagen de Maven que ya tiene Java (JDK) para compilar nuestro código.
# Le ponemos un alias "builder" a esta etapa.
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

# Establecemos el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copiamos primero el pom.xml para aprovechar el cache de capas de Docker.
# Si las dependencias no cambian, Docker no las volverá a descargar.
COPY pom.xml .
RUN mvn dependency:go-offline

# Copiamos el resto del código fuente de la aplicación.
COPY src ./src

# Ejecutamos el comando de Maven para compilar y empaquetar la aplicación en un JAR.
# -DskipTests omite la ejecución de pruebas durante la construcción de la imagen.
RUN mvn clean package -DskipTests


# --- ETAPA 2: Ejecución (Runtime) ---
# Usamos una imagen de Java mucho más ligera (solo JRE, no el JDK completo)
# para la imagen final, lo que la hace más pequeña y segura.
FROM openjdk:17-alpine

# Establecemos el directorio de trabajo.
WORKDIR /app

# Copiamos SOLAMENTE el archivo JAR que se construyó en la etapa anterior ("builder").
COPY --from=builder /app/target/*.jar app.jar

# Exponemos el puerto en el que corre nuestra aplicación Spring Boot.
EXPOSE 8081

# El comando que se ejecutará cuando el contenedor se inicie.
ENTRYPOINT ["java", "-jar", "app.jar"]