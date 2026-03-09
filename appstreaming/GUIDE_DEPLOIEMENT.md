# 🚀 Guide de Déploiement Rapide

## ⚡ Démarrage en 5 Minutes

### Option 1 : Docker Compose (Recommandé)

```bash
# 1. Cloner le projet
git clone <repo-url>
cd appstreaming

# 2. Configurer les variables d'environnement
cp .env.example .env
nano .env  # Modifier avec vos valeurs

# 3. Démarrer tous les services
docker-compose up -d

# 4. Vérifier que tout fonctionne
docker-compose logs -f backend
```

**URLs disponibles** :

- Backend API : http://localhost:8080
- PgAdmin : http://localhost:5050 (admin@appstreaming.com / admin)
- PostgreSQL : localhost:5432

---

### Option 2 : Déploiement Manuel

#### Prérequis

- Java 17+
- PostgreSQL 14+
- Maven 3.8+

#### Étapes

```bash
# 1. Créer la base de données
sudo -u postgres psql
CREATE DATABASE apstreaming;
CREATE USER appuser WITH PASSWORD 'votre_password';
GRANT ALL PRIVILEGES ON DATABASE apstreaming TO appuser;
\q

# 2. Exécuter la migration
psql -U appuser -d apstreaming -f src/main/resources/db/migration/V1__add_missing_fields.sql

# 3. Configurer application.properties
nano src/main/resources/application.properties

# Modifier ces lignes :
spring.datasource.url=jdbc:postgresql://localhost:5432/apstreaming
spring.datasource.username=appuser
spring.datasource.password=votre_password

# 4. Compiler le projet
./mvnw clean package -DskipTests

# 5. Lancer l'application
java -jar target/appstreaming-0.0.1-SNAPSHOT.jar
```

---

## 🔧 Configuration PostgreSQL

### Installer PostgreSQL (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Créer la base et l'utilisateur

```sql
sudo -u postgres psql

CREATE DATABASE apstreaming;
CREATE USER appuser WITH PASSWORD 'SecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE apstreaming TO appuser;

-- Donner les permissions sur le schéma public
\c apstreaming
GRANT ALL ON SCHEMA public TO appuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO appuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO appuser;

\q
```

### Exécuter la migration

```bash
psql -U appuser -d apstreaming -f src/main/resources/db/migration/V1__add_missing_fields.sql
```

---

## 🐳 Configuration Docker

### Construire l'image

```bash
# Build l'image Docker
docker build -t appstreaming-backend .

# Vérifier l'image
docker images | grep appstreaming
```

### Lancer avec Docker Compose

```bash
# Mode détaché
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

---

## 🌐 Configuration Ant Media Server

### Installer Ant Media Server

```bash
# Télécharger Ant Media Server Community Edition
wget https://github.com/ant-media/Ant-Media-Server/releases/download/ams-v2.7.0/ant-media-server-community-2.7.0.zip

# Décompresser
unzip ant-media-server-community-2.7.0.zip

# Démarrer
cd ant-media-server
./start.sh
```

### Configurer dans application.properties

```properties
antmedia.server.base-url=http://VOTRE_IP:5080
antmedia.server.app=LiveApp
```

### Tester la connexion

```bash
# Vérifier qu'Ant Media est accessible
curl http://VOTRE_IP:5080/LiveApp/rest/v2/broadcasts/list/0/10
```

---

## 📧 Configuration Email (Gmail)

### 1. Créer un mot de passe d'application

1. Aller sur https://myaccount.google.com/
2. Sécurité → Validation en deux étapes (activer)
3. Mots de passe d'application → Créer
4. Copier le mot de passe généré

### 2. Configurer application.properties

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=votre_email@gmail.com
spring.mail.password=VOTRE_MOT_DE_PASSE_APP
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

app.mail-from=votre_email@gmail.com
```

---

## 🔐 Configuration SSL/HTTPS (Production)

### Avec Let's Encrypt

```bash
# Installer Certbot
sudo apt install certbot

# Générer certificat
sudo certbot certonly --standalone -d votre-domaine.com

# Certificats générés dans :
# /etc/letsencrypt/live/votre-domaine.com/fullchain.pem
# /etc/letsencrypt/live/votre-domaine.com/privkey.pem
```

### Configurer Spring Boot

```properties
server.port=8443
server.ssl.key-store=/etc/letsencrypt/live/votre-domaine.com/keystore.p12
server.ssl.key-store-password=VotreMotDePasse
server.ssl.key-store-type=PKCS12
server.ssl.key-alias=tomcat
```

### Convertir les certificats

```bash
sudo openssl pkcs12 -export \
  -in /etc/letsencrypt/live/votre-domaine.com/fullchain.pem \
  -inkey /etc/letsencrypt/live/votre-domaine.com/privkey.pem \
  -out keystore.p12 \
  -name tomcat
```

---

## 🔄 Configuration Nginx (Reverse Proxy)

### Installer Nginx

```bash
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Configurer le site

```nginx
# /etc/nginx/sites-available/appstreaming

server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:8080/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### Activer le site

```bash
sudo ln -s /etc/nginx/sites-available/appstreaming /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🎯 Vérification du Déploiement

### 1. Health Check

```bash
# Vérifier que l'application répond
curl http://localhost:8080/actuator/health

# Devrait retourner : {"status":"UP"}
```

### 2. Test Authentification

```bash
# Créer un utilisateur admin
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Admin",
    "prenom": "Super",
    "email": "admin@test.com",
    "password": "admin123",
    "role": "ADMINISTRATEUR"
  }'

# Se connecter
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'

# Copier le token JWT retourné
```

### 3. Test API Admin

```bash
# Tester le dashboard (remplacer <TOKEN> par votre JWT)
curl http://localhost:8080/api/admin/dashboard \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 📊 Monitoring

### Spring Boot Actuator

Ajouter à `pom.xml` :

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

Configurer `application.properties` :

```properties
management.endpoints.web.exposure.include=health,info,metrics,env
management.endpoint.health.show-details=always
```

**Endpoints disponibles** :

- `/actuator/health` - Santé de l'application
- `/actuator/metrics` - Métriques
- `/actuator/info` - Informations
- `/actuator/env` - Variables d'environnement

---

## 🔧 Dépannage

### Problème : Port 8080 déjà utilisé

```bash
# Trouver le processus
sudo lsof -i :8080

# Tuer le processus
sudo kill -9 <PID>

# Ou changer le port dans application.properties
server.port=8081
```

### Problème : Connexion PostgreSQL refusée

```bash
# Vérifier que PostgreSQL tourne
sudo systemctl status postgresql

# Démarrer si nécessaire
sudo systemctl start postgresql

# Vérifier les connexions
sudo -u postgres psql -c "\l"
```

### Problème : Erreur "Role does not exist"

```sql
sudo -u postgres psql
CREATE USER appuser WITH PASSWORD 'VotrePassword';
GRANT ALL PRIVILEGES ON DATABASE apstreaming TO appuser;
```

### Problème : WebSocket ne fonctionne pas

Vérifier CORS dans `WebConfig.java` :

```java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
        .allowedOrigins("http://localhost:5173", "https://votre-frontend.com")
        .allowedMethods("*")
        .allowCredentials(true);
}
```

---

## 🌍 Variables d'Environnement

### Production

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://db-host:5432/apstreaming
export SPRING_DATASOURCE_USERNAME=appuser
export SPRING_DATASOURCE_PASSWORD=SecurePassword123!
export ANTMEDIA_SERVER_BASE_URL=http://ant-media-server:5080
export SPRING_MAIL_USERNAME=votre_email@gmail.com
export SPRING_MAIL_PASSWORD=votre_app_password
export JWT_SECRET=VotreCleSecreteTresTresLongue123456789
```

### Docker

Créer `.env` :

```env
POSTGRES_DB=apstreaming
POSTGRES_USER=appuser
POSTGRES_PASSWORD=SecurePassword123!
MAIL_USERNAME=votre_email@gmail.com
MAIL_PASSWORD=votre_app_password
ANTMEDIA_SERVER_URL=http://ant-media-server:5080
```

---

## 📝 Checklist Pré-Production

- [ ] Base de données PostgreSQL configurée
- [ ] Migration exécutée
- [ ] Ant Media Server installé et accessible
- [ ] Email configuration testée
- [ ] SSL/HTTPS configuré
- [ ] Nginx reverse proxy configuré
- [ ] Firewall configuré (ports 80, 443, 8080)
- [ ] Variables d'environnement sécurisées
- [ ] Backup automatique configuré
- [ ] Monitoring activé
- [ ] Tests d'authentification passés
- [ ] Tests API passés
- [ ] WebSocket testé
- [ ] Documentation à jour

---

## 🎉 Déploiement Réussi !

Votre application est maintenant déployée et accessible.

**URLs** :

- API Backend : https://votre-domaine.com
- Documentation : https://votre-domaine.com/docs
- Health Check : https://votre-domaine.com/actuator/health

---

**Besoin d'aide ?** Consultez les logs :

```bash
# Docker
docker-compose logs -f backend

# Systemd
sudo journalctl -u appstreaming -f

# Fichier
tail -f logs/spring.log
```
