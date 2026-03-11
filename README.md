# MDS Startup Landing page

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Dependencies](#dependencies)
- [Setup and Installation](#setup-and-installation)
- [Running the Project](#running-the-project)

## Project Overview

The Startup landing page is a Next.js-based interface designed for showcasing our features and benefits.

## Architecture

The project is structured as follows:

- **src/**: Contains the main application code
- **Dockerfile.dev**: Dockerfile for development environment.
- **Dockerfile.prod**: Dockerfile for production environment.
- **compose.yml**: Docker Compose file for development.
- **compose.prod.yml**: Docker Compose file for production.

### Globale (Frontend -> Backend)

```mermaid
flowchart TB
    subgraph Frontend ["Frontend (Client)"]
        React["Web App \n(React / Next.js)"]
    end

    subgraph FirebaseServices ["Firebase (BaaS)"]
        Auth["Authentification"]
        Firestore["Cloud Firestore \n(Base de données principale)"]
        Storage["Cloud Storage \n(Images, CNI, Permis)"]
    end

    subgraph BackendLayer ["Backend (Serveur Custom)"]
        NodeAPI["API Node.js / Express \n(Logique Métier Sécurisée)"]
    end

    subgraph ExternalServices ["Services Externes"]
        Stripe["Stripe \n(Paiements)"]
    end

    %% Client communication
    React -- "Auth token / Sessions" --> Auth
    React -- "Lecture/Écriture\n(Sécurisé par Firestore Rules)" --> Firestore
    React -- "Upload de documents" --> Storage
    
    %% Backend APIs
    React -- "Actions complexes\n(Paiement, Vérification KYC, Stats)" --> NodeAPI
    
    %% Backend to Firebase
    NodeAPI -- "Firebase Admin SDK\n(Privilèges de service)" --> Firestore
    NodeAPI -- "Gestion utilisateurs\nen bloc ou accès B2B" --> Auth
    
    %% External integrations
    NodeAPI -- "Création PaymentIntent,\nCapture, Remboursements" --> Stripe
    Stripe -- "Stripe Webhooks\n(Paiement réussi/échoué)" --> NodeAPI
    React -- "Finalisation/Validation Carte\n(Stripe Elements)" --> Stripe
```

### Modèle Conceptuel de Données (MCD)

Le MCD représente les entités du système et leurs relations :

```mermaid
erDiagram
    UTILISATEUR ||--o{ TRAJET : "crée (en tant que conducteur)"
    UTILISATEUR ||--o{ RESERVATION : "effectue (en tant que passager)"
    UTILISATEUR ||--o{ VEHICULE : "possède"
    UTILISATEUR ||--o{ AVIS : "rédige"
    UTILISATEUR ||--o{ AVIS : "reçoit"
    TRAJET ||--o{ RESERVATION : "contient"
    TRAJET ||--o{ AVIS : "concerne"

    UTILISATEUR {
        String uid
        String email
        String nom
        String prenom
        String role
        Boolean estVerifie
    }
    TRAJET {
        String id
        String villeDepart
        String villeArrivee
        Date dateDepart
        Number prix
        String statut
    }
    RESERVATION {
        String orderId
        Number montant
        String statut
    }
    VEHICULE {
        String id
        String marque
        String modele
        String immatriculation
    }
    AVIS {
        String id
        Number note
        String commentaire
    }
```

### Modèle Physique de Données (MPD) Firestore

Le MPD détaille l'implémentation dans Firestore (Firebase) qui est NoSQL orienté document. Remarquez que les réservations (`Bookings`) sont encapsulées (Embedded Array) dans les trajets (`Trips`).

```mermaid
classDiagram
    class Users {
        <<Collection>>
        +String uid
        +String email
        +String firstName
        +String lastName
        +String phoneNumber
        +String role ["passenger" | "driver"]
        +Boolean isUserVerified
        +Boolean isUserDriverVerified
        +String verificationStatus
        +String stripeAccountId
        +Number averageRating
        +Number totalReviews
        +Timestamp createdAt
        +Timestamp updatedAt
    }

    class Vehicles {
        <<Collection>>
        +String id
        +String userId
        +String brand
        +String model
        +String licensePlate
        +Timestamp created_at
        +Timestamp updated_at
    }

    class Trips {
        <<Collection>>
        +String id
        +String driverId
        +String departureCity
        +String arrivalCity
        +String departureDate
        +String departureTime
        +Number totalSeats
        +Number availableSeats
        +Number pricePerSeat
        +String status ["pending" | "ongoing" | "completed" | "finished"]
        +Array~Booking~ bookings
        +Timestamp createdAt
        +Timestamp updatedAt
    }

    class Bookings {
        <<Embedded in Trip>>
        +String oderId
        +String participantId
        +String status ["authorized" | "confirmed" | "captured" | "cancelled" | "disputed"]
        +Number amountCents
        +Timestamp createdAt
    }

    class Reviews {
        <<Collection>>
        +String id
        +String trip_id
        +String reviewer_id
        +String reviewed_id
        +Number rating
        +String comment
        +Timestamp created_at
    }

    Users "1" --> "*" Vehicles : a pour propriétaire
    Users "1" --> "*" Trips : conduit (driverId)
    Trips "1" *-- "*" Bookings : embarque (array)
    Users "1" --> "*" Bookings : réserve (participantId)
    Trips "1" --> "*" Reviews : concerne (trip_id)
    Users "1" --> "*" Reviews : émet/reçoit
```

## Dependencies

To run this project, you need to have the following dependencies installed:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Setup and Installation

1/ **Clone the repository:**

````sh
git clone https://github.com/alexishadjian/rutafem-landing
````

````sh
cd rutafem-landing
````

2/ **Install dependencies:**

````sh
make install
````

3/ **Set up environment variables:**

Copy the .env.sample file to .env.

## Running the Project

### Development

````sh
make up-dev
````

Once the server is running, you can access the application at : `http://localhost:3000`.

### Production

````sh
docker compose -f compose.prod.yml up --build -d
````