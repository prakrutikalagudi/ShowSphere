# ShowSphere 🎬

ShowSphere is a premium, real-time movie ticket booking and management platform designed with modern design aesthetics, performance optimization, and transactional safety in mind. 

The system features a **Pessimistic Locking Simulation** dashboard to test and visualize concurrency stress testing on seats, ensuring robust double-booking prevention in high-traffic environments.

---

## 🚀 Key Features

* **Real-time Seat Selection**: Interactive grid visualizer for seat reservations (Available, Selected, Booked, and Reserved states).
* **Pessimistic Locking Concurrency**: Built-in visual simulation executing 100 concurrent mock transactions on a single seat to verify thread safety.
* **Database Cascading Delete**: Highly optimized database cascading constraints to clean up booking dependencies safely during deletions.
* **Full Administration Panel**: Create, update (via beautiful modals), and delete Movies, Theaters, and Shows securely.
* **Swagger API Documentation**: Interactive API documentation for backend services.

---

## 🛠️ Technology Stack

### Backend
* **Language & Framework**: Java 21, Spring Boot 3.5.x
* **Security**: Spring Security 6.x, JWT (JSON Web Tokens)
* **Data Access**: Spring Data JPA, Hibernate ORM
* **Database**: MySQL 8.x
* **Documentation**: Springdoc OpenAPI (Swagger UI)

### Frontend
* **Core**: React 18, Vite, React Router DOM
* **Styling**: Modern Vanilla CSS (curated vintage palette, smooth glassmorphism, responsive grid layouts)
* **Notifications**: React Hot Toast

---

## 🏁 Getting Started

### Prerequisites
* **Java**: SDK 21 or higher
* **Node.js**: LTS version (v18+)
* **MySQL**: Active database instance running on port 3306

---

### 1. Database Setup
Create a schema named `ticket_booking_db` in MySQL:
```sql
CREATE DATABASE ticket_booking_db;
```
Configure your credentials in `ticket-booking-system/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ticket_booking_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

---

### 2. Run the Backend
Navigate to the backend directory and launch the server using the Maven wrapper:
```powershell
cd ticket-booking-system
./mvnw.cmd spring-boot:run
```
The server starts on [http://localhost:8080](http://localhost:8080).
* **Swagger docs**: Available at [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

### 3. Run the Frontend
Navigate to the frontend directory, install dependencies, and start the development server:
```powershell
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) (or the port Vite outputs) in your browser.

---

## 📁 Repository Structure

```
ShowSphere/
├── frontend/                  # React & Vite client code
│   ├── src/
│   │   ├── components/        # Shared widgets (Navbar, protected paths)
│   │   ├── pages/             # Dashboard, Movies, Seat Selection, etc.
│   │   └── services/          # Axios API communication
│   └── package.json
└── ticket-booking-system/     # Spring Boot application
    ├── src/main/java/         # Entity, Service, Controller layers
    └── pom.xml
```

---

## ⚡ Concurrency Testing
Go to the **Admin Dashboard**, click on the **Simulate** tab, select a show, enter a target seat ID, and run the transaction test. The live visualization grid logs the state of 100 concurrent requests, proving that only **1 request succeeds** while 99 roll back cleanly without corruption.
