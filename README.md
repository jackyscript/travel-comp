# Travel-Comp

Open this app at https://jackyscript.github.io/travel-comp/

## Data Source

This app uses the [**v6.vbb.transport.rest**](https://v6.vbb.transport.rest/) API — a free, CORS-enabled REST API for real-time public transit data in the Berlin/Brandenburg (VBB) network.

- **Locations:** Search stations via `GET /locations?query=…`
- **Departures:** Fetch live departures via `GET /stops/:id/departures`
- **No API key required** — just `$fetch` from the client.

See the [full API documentation](https://v6.vbb.transport.rest/) for all available endpoints and parameters.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
