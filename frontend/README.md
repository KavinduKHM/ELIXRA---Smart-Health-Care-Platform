# ELIXRA Frontend (Doctor Service Focus)

This frontend is a lightweight React app wired to `services/doctor_service` backend endpoints.

## Features implemented

- Doctor profile register/load/update
- Availability create/list/delete + slots by date
- Prescription create/list
- Telemedicine create/join/end endpoint tester
- Placeholder panel for appointment requests (backend endpoint not yet wired)

## Environment

Create `.env` in `frontend/` (optional):

```env
REACT_APP_API_BASE_URL=http://localhost:8083
```

## Run

```powershell
Set-Location "C:\Users\ISURI RANASINGHE\Documents\project\ELIXRA---Smart-Health-Care-Platform\frontend"
npm install
npm start
```

## Backend assumptions

- `doctor_service` is running at `http://localhost:8083`
- API base path: `/api/doctors`

If auth is enabled in backend, store JWT token in browser localStorage key `token`.

