# Guide d'exécution des tests

## Prérequis

Avant d'exécuter les tests, **vous devez compiler le projet** pour générer les classes Lombok :

```bash
mvn clean compile test-compile
```

ou avec le wrapper Maven :

```bash
./mvnw clean compile test-compile
```

## Configuration de test

Le fichier `src/test/resources/application.properties` contient la configuration H2 pour les tests.

**Caractéristiques** :

- Base de données H2 en mémoire (MODE=PostgreSQL)
- Flyway désactivé (ddl-auto=create-drop)
- JWT et variables d'environnement pré-configurées
- Logging DEBUG activé

## Types de tests créés

### 1. Tests unitaires (Service Layer)

**Fichiers** :

- `CoursServiceTest.java` - 10 tests pour CoursService
- `InscriptionServiceTest.java` - Tests pour InscriptionService

**Couverture** :

- Tests avec Mockito pour les dépendances
- Tests des cas normaux et d'erreur
- Tests de pagination

### 2. Tests d'intégration (Controller Layer)

**Fichiers** :

- `SessionStreamingControllerIntegrationTest.java` - 20 tests
- `CoursControllerIntegrationTest.java` - 18 tests

**Couverture** :

- Tests avec MockMvc et @SpringBootTest
- Tests d'authentification/autorisation (@WithMockUser)
- Tests de sécurité (roles ENSEIGNANT, ETUDIANT, ADMINISTRATEUR)
- Tests de validation des données
- Tests de pagination
- Tests des codes HTTP (200, 400, 401, 403, 404)

### 3. Tests de repository (Data Layer)

**Fichiers** :

- `SessionStreamingRepositoryTest.java` - 16 tests

**Couverture** :

- Tests avec @DataJpaTest et TestEntityManager
- Tests CRUD complets
- Tests de pagination
- Tests des requêtes personnalisées (findByStatus, findByCours_Id, etc.)

## Exécution des tests

### Tous les tests

```bash
mvn test
```

### Tests d'une classe spécifique

```bash
mvn test -Dtest=CoursServiceTest
mvn test -Dtest=SessionStreamingControllerIntegrationTest
mvn test -Dtest=SessionStreamingRepositoryTest
```

### Tests avec couverture (JaCoCo)

```bash
mvn clean verify
```

Le rapport de couverture sera dans `target/site/jacoco/index.html`.

## Structure des tests

```
src/test/
├── java/
│   └── com/fstm/ma/ilisi/appstreaming/
│       ├── controller/          # Tests d'intégration
│       │   ├── SessionStreamingControllerIntegrationTest.java
│       │   └── CoursControllerIntegrationTest.java
│       ├── repository/          # Tests de repository
│       │   └── SessionStreamingRepositoryTest.java
│       └── service/             # Tests unitaires
│           ├── CoursServiceTest.java
│           └── InscriptionServiceTest.java
└── resources/
    └── application.properties   # Configuration H2 pour tests
```

## Bonnes pratiques appliquées

1. **Isolation** : Chaque test est indépendant (@BeforeEach)
2. **Nommage** : Méthodes descriptives (Given-When-Then)
3. **Mocks** : Mockito pour isoler les dépendances
4. **Assertions** : AssertJ pour des assertions fluides
5. **Sécurité** : Tests avec différents rôles (@WithMockUser)
6. **Base de données** : H2 en mémoire pour rapidité et isolation
7. **DisplayName** : Descriptions claires en français

## Résolution des problèmes

### Erreur : "Unresolved compilation problems"

**Solution** : Compilez le projet avant les tests :

```bash
mvn clean compile test-compile
```

### Erreur : "ApplicationContext failure - DB_URL not found"

**Solution** : Vérifiez que `src/test/resources/application.properties` existe et configure H2.

### Erreur : "No tests found"

**Solution** : Vérifiez que les classes de test se terminent par `Test.java`.

## Statistiques de couverture

**Tests créés** :

- 54 tests au total
- 20 tests d'intégration (controllers)
- 16 tests de repository
- 10+ tests unitaires (services)

**Couverture fonctionnelle** :

- ✅ Authentification et autorisation
- ✅ CRUD complet
- ✅ Pagination
- ✅ Validation des données
- ✅ Gestion des erreurs
- ✅ Sécurité par rôles
