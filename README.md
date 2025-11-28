# FinanzeApp React

React.js web frontend for the [finanzeapp](https://github.com/paolomarr/finanze-django) Django backend.

## Quick start

Requirements:
- backend up and running, say reachable at <http://localhost:8003/api>
- `.env` file with at least a `VITE_BACKEND_API_BASE=http://localhost:8003/api/` line

Local development:
```
npm install # just once
npm run dev
```

then open browser at <http://localhost:3000/>.

With Docker:

```
./deploy_docker.sh
```
