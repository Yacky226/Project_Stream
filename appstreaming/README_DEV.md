# Application de Streaming Éducatif - Backend

## 📋 Description

Backend Spring Boot pour une plateforme de streaming éducatif en direct avec gestion complète des cours, sessions live, et interactions en temps réel.

## 🚀 Technologies Utilisées

- **Framework**: Spring Boot 3.4.5
- **Java**: 17
- **Base de données**: PostgreSQL
- **Sécurité**: Spring Security + JWT (jjwt 0.12.6)
- **ORM**: Spring Data JPA + Hibernate
- **WebSocket**: STOMP/SockJS pour temps réel
- **Mapping**: MapStruct 1.5.5.Final
- **Build**: Maven
- **Streaming**: Ant Media Server

## 📦 Modules Implémentés

### 1. Module E-Learning

- ✅ Gestion des cours, sections et leçons
- ✅ Inscriptions des étudiants
- ✅ Suivi de progression
- ✅ Système d'avis et notes
- ✅ Gestion des ressources (vidéos, documents)

### 2. Module Interactivité Live

- ✅ Chat en temps réel (WebSocket)
- ✅ Questions/Réponses avec votes
- ✅ Levée de main
- ✅ Notifications en temps réel

### 3. Module Streaming Avancé

- ✅ Intégration Ant Media Server
- ✅ Gestion des sessions de streaming
- ✅ VOD (Video On Demand)
- ✅ Webhooks pour événements streaming
- ✅ Contrôle d'accès aux streams

### 4. Module Administration

- ✅ Dashboard avec statistiques complètes (20+ métriques)
- ✅ Gestion des utilisateurs (CRUD + activation/désactivation)
- ✅ Gestion des cours (archivage, modération)
- ✅ Gestion des inscriptions
- ✅ Vue d'ensemble du système

## 🗄️ Structure du Projet

```
src/main/java/com/fstm/ma/ilisi/appstreaming/
├── config/
│   ├── AntMediaConfig.java         # Configuration Ant Media Server
│   ├── AppProperties.java          # Propriétés de l'application
│   ├── SecurityConfig.java         # Configuration Spring Security
│   ├── WebConfig.java              # Configuration Web (CORS)
│   └── WebSocketConfig.java        # Configuration WebSocket
├── controller/                     # Contrôleurs REST (18 contrôleurs)
│   ├── AdministrateurController.java
│   ├── AuthController.java
│   ├── CoursController.java
│   ├── SessionStreamingController.java
│   └── ...
├── service/                        # Services métier (17 services)
│   ├── AdministrateurService.java
│   ├── CoursService.java
│   └── ...
├── repository/                     # Repositories JPA (17 repositories)
│   ├── UtilisateurRepository.java
│   ├── CoursRepository.java
│   └── ...
├── model/
│   ├── bo/                         # Entités (24 entités)
│   │   ├── Utilisateur.java
│   │   ├── Cours.java
│   │   └── ...
│   └── dto/                        # DTOs (20 DTOs)
│       ├── CoursDTO.java
│       ├── DashboardStatsDTO.java
│       └── ...
├── mapper/                         # MapStruct mappers (16 mappers)
│   ├── CoursMapper.java
│   └── ...
├── security/                       # Sécurité JWT
│   ├── JwtUtil.java
│   ├── JwtAuthenticationFilter.java
│   └── CustomUserDetailsService.java
└── exception/                      # Gestion des exceptions
    ├── GlobalExceptionHandler.java
    └── ResourceNotFoundException.java
```

## ⚙️ Configuration

### 1. Base de Données PostgreSQL

Créez une base de données PostgreSQL :

```sql
CREATE DATABASE apstreaming;
```

Configurez `src/main/resources/application.properties` :

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/apstreaming
spring.datasource.username=votre_username
spring.datasource.password=votre_password
```

### 2. Migration de la Base de Données

Si vous avez des données existantes, exécutez le script de migration :

```bash
psql -U postgres -d apstreaming -f src/main/resources/db/migration/V1__add_missing_fields.sql
```

### 3. Ant Media Server

Configurez l'URL de votre serveur Ant Media dans `application.properties` :

```properties
antmedia.server.base-url=http://votre-serveur:5080
antmedia.server.app=LiveApp
```

### 4. Configuration Email

Pour les notifications par email :

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=votre_email@gmail.com
spring.mail.password=votre_app_password
```

## 🔧 Installation et Démarrage

### Prérequis

- Java 17+
- PostgreSQL 14+
- Maven 3.8+

### Compilation

```bash
# Nettoyer et compiler
./mvnw clean compile

# Créer le JAR (sans tests)
./mvnw package -DskipTests

# Créer le JAR (avec tests)
./mvnw package
```

### Démarrage

```bash
# Démarrer l'application
./mvnw spring-boot:run

# Ou exécuter le JAR
java -jar target/appstreaming-0.0.1-SNAPSHOT.jar
```

L'application démarre sur `http://localhost:8080`

## 🧪 Tests

```bash
# Exécuter tous les tests
./mvnw test

# Exécuter les tests avec rapport de couverture
./mvnw test jacoco:report

# Exécuter un test spécifique
./mvnw test -Dtest=AdministrateurServiceTest
```

## 📡 API Endpoints

### Authentification

- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription

### Administration (ADMIN uniquement)

- `GET /api/admin/dashboard` - Statistiques globales
- `GET /api/admin/users` - Liste des utilisateurs
- `PUT /api/admin/users/{id}` - Modifier un utilisateur
- `PATCH /api/admin/users/{id}/toggle-status` - Activer/Désactiver
- `DELETE /api/admin/users/{id}` - Supprimer un utilisateur
- `GET /api/admin/courses` - Liste des cours
- `PATCH /api/admin/courses/{id}/archive` - Archiver un cours
- `GET /api/admin/inscriptions` - Liste des inscriptions

### Cours

- `GET /api/cours` - Liste des cours
- `POST /api/cours` - Créer un cours (ENSEIGNANT)
- `GET /api/cours/{id}` - Détails d'un cours
- `PUT /api/cours/{id}` - Modifier un cours (ENSEIGNANT)

### Sessions de Streaming

- `POST /api/sessions` - Créer une session (ENSEIGNANT)
- `GET /api/sessions/cours/{coursId}` - Sessions d'un cours
- `POST /api/sessions/{sessionId}/start` - Démarrer le stream
- `POST /api/sessions/{sessionId}/stop` - Arrêter le stream

### Interactivité (WebSocket)

- `WS /ws` - Connexion WebSocket
- `SEND /app/chat.send` - Envoyer un message
- `SEND /app/question.ask` - Poser une question
- `SEND /app/hand.raise` - Lever la main
- `SUBSCRIBE /topic/session/{sessionId}/chat` - Recevoir les messages

## 🔐 Sécurité

### Rôles

- **ADMINISTRATEUR**: Accès complet au système
- **ENSEIGNANT**: Gestion de cours et sessions
- **ETUDIANT**: Accès aux cours et interactions

### JWT

Les tokens JWT ont une durée de validité de 24 heures et sont signés avec une clé secrète.

Header d'authentification :

```
Authorization: Bearer <votre_token_jwt>
```

## 📊 Statistiques du Projet

- **150 fichiers Java**
- **~90 endpoints REST**
- **24 entités**
- **20 DTOs**
- **17 repositories**
- **17 services**
- **18 contrôleurs**
- **16 mappers MapStruct**

## 🐛 Dépannage

### Problème: Erreurs de compilation MapStruct

```bash
# Nettoyer et recompiler
./mvnw clean compile
```

### Problème: Erreurs de base de données

```bash
# Vérifier la connexion PostgreSQL
psql -U postgres -d apstreaming -c "SELECT version();"

# Réinitialiser le schéma (ATTENTION: perte de données)
spring.jpa.hibernate.ddl-auto=create-drop
```

### Problème: Port 8080 déjà utilisé

```properties
# Changer le port dans application.properties
server.port=8081
```

## 📝 Prochaines Étapes

- [ ] Implémenter le cache Redis pour améliorer les performances
- [ ] Ajouter la pagination à tous les endpoints de liste
- [ ] Implémenter les filtres de recherche avancés
- [ ] Ajouter Swagger/OpenAPI pour documentation API
- [ ] Implémenter le monitoring avec Spring Boot Actuator
- [ ] Ajouter les tests d'intégration
- [ ] Dockeriser l'application
- [ ] CI/CD avec GitHub Actions

## 👥 Équipe de Développement

FSTM - Université Hassan II de Casablanca

## 📄 Licence

Projet académique - ILISI

---

**Dernière mise à jour**: 1er décembre 2025  
**Version**: 0.0.1-SNAPSHOT
