# Specyfikacja API dla Backend Developera - TriTrack (react-native-pp)

Dokument zawiera wymagania dotyczące endpointów, struktur danych oraz logiki biznesowej niezbędnej do pełnego wsparcia aplikacji mobilnej.

---

## 1. Moduł Autentykacji (`/auth`)
Aplikacja wykorzystuje tokeny Bearer (JWT) do autoryzacji zapytań.

| Metoda | Endpoint | Opis | Request Body | Response (200 OK) |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/auth/login` | Logowanie | `{"username", "password"}` | `{"token", "user": {id, username, email}}` |
| **POST** | `/auth/register`| Rejestracja | `{"username", "email", "password"}` | `{"token", "user": {id, username, email}}` |
| **GET** | `/auth/me` | Dane sesji | - | `{"id", "username", "email"}` |

---

## 2. Zarządzanie Treningami (`/trainings`)
Główny zasób aplikacji. Wszystkie rekordy muszą być przypisane do konkretnego `userId`.

### Model `TrainingEntry`:
```json
{
  "id": "string",
  "type": "swimming" | "cycling" | "running",
  "title": "string",
  "date": "ISO8601 String",
  "duration": number, // w minutach
  "distance": number, // w kilometrach
  "calories": number,
  "avgHeartRate": number,
  "notes": "string",
  "equipmentId": "string (optional)"
}
```

### Endpointy:
- **GET `/trainings`**: Pobiera listę treningów. Wspiera parametry `?type=` oraz `?limit=`.
- **POST `/trainings`**: Tworzy nowy wpis.
- **PUT `/trainings/{id}`**: Aktualizuje dane istniejącego treningu.
- **DELETE `/trainings/{id}`**: Usuwa wpis.

---

## 3. Zarządzanie Sprzętem (`/Equipment`)
Zasób pozwalający na śledzenie zużycia sprzętu (np. buty, rower).

### Model `Equipment`:
```json
{
  "id": "string",
  "name": "string",
  "category": "Shoes" | "Bike" | "Other",
  "brand": "string",
  "model": "string",
  "purchaseDate": "ISO8601 String",
  "totalDistance": number,
  "notes": "string"
}
```

### Endpointy:
- **GET `/Equipment`**: Pobiera listę sprzętu użytkownika.
- **POST `/Equipment`**: Dodaje nowy sprzęt.
- **GET `/Equipment/{id}`**: Pobiera szczegóły konkretnego sprzętu (w tym aktualny `totalDistance`).
- **GET `/Equipment/{id}/logs`**: Pobiera historię użycia sprzętu.

---

## 4. Analityka i Statystyki (`/stats`)
Dane zagregowane dla ekranu Dashboard oraz Stats.

- **GET `/stats/summary`**: Zwraca sumaryczne wartości (dystans, kalorie, czas) z podziałem na okresy (tydzień/miesiąc).
- **GET `/stats/breakdown`**: Zwraca procentowy lub liczbowy podział na dyscypliny (pływanie/rower/bieg).
- **GET `/stats/heart-rate`**: Zwraca statystyki stref tętna (np. czas spędzony w poszczególnych zakresach).

---

## 4. Wytyczne Techniczne
1. **Bezpieczeństwo**: Każdy endpoint (poza publicznymi `/auth/login` i `/auth/register`) musi sprawdzać token JWT w nagłówku `Authorization`.
2. **Standardy**:
   - Daty: Zawsze ISO 8601 (np. `2023-10-27T10:00:00Z`).
   - Liczby: Dystans jako zmiennoprzecinkowe, tętno i kalorie jako całkowite.
3. **CORS**: Musi dopuszczać żądania z lokalnych środowisk developerskich Expo (localhost/IP sieci lokalnej).
4. **Walidacja**: Backend musi odrzucać nieprawidłowe typy treningów (inne niż zdefiniowane w unii).
