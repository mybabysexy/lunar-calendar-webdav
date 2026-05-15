# Lunar Calendar API

A lightweight Node.js/Express server that generates a Vietnamese lunar calendar as an iCalendar (`.ics`) feed. Subscribe to it from any calendar app (Google Calendar, Apple Calendar, Outlook, etc.) to see lunar dates alongside your regular calendar — auto-updating every 365 days from today.

## Features

- Converts every Gregorian date to its Vietnamese lunar equivalent
- Marks special days: **Mùng 1** (New Moon) and **Rằm** (Full Moon) with descriptive titles
- Includes **Can Chi** (Heavenly Stems & Earthly Branches) metadata for each day
- Returns a standards-compliant `.ics` file, compatible with all major calendar apps
- Timezone set to `Asia/Ho_Chi_Minh`
- Docker-ready for easy self-hosting

## Quick Start

### Without Docker

**Prerequisites:** Node.js 18+

```bash
npm install
npm start
```

The server starts at `http://localhost:3000`.

### With Docker Compose

```bash
docker compose up -d
```

The container (`lunar_ics`) runs on port `3000` and restarts automatically on failure or reboot.

## Usage

Once running, point your calendar app to the `.ics` feed URL:

```
http://localhost:3000/
```

| Calendar App | How to subscribe |
|---|---|
| Google Calendar | Settings → Add calendar → From URL |
| Apple Calendar | File → New Calendar Subscription |
| Outlook | Add calendar → Subscribe from web |

## Event Format

Each day generates an all-day event with:

- **Title:** `🌙 {lunar day}/{lunar month}` — or `🌙 Mùng 1 tháng X` / `🌙 Rằm tháng X` for days 1 and 15
- **Description:** Full lunar date (`DD/MM/YYYY`) and Can Chi notation for the day, month, and year

Example description:
```
Ngày âm: 1/4/2025
Can Chi: Ngày Giáp Tý, tháng Canh Thìn, năm Ất Tỵ
```

## Configuration

| Environment Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |

## Tech Stack

- [Express](https://expressjs.com/) — HTTP server
- [ical-generator](https://github.com/sebbo2002/ical-generator) — iCalendar file generation
- [lunar-javascript](https://github.com/6tail/lunar-javascript) — Gregorian ↔ Lunar conversion

## License

MIT
