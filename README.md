# FretMaster Studio 4.0

Dit pakket is een Progressive Web App (PWA).

## Belangrijk
Open `index.html` niet rechtstreeks via `file://`. Een PWA heeft een webserver nodig:
- HTTPS op internet, of
- localhost tijdens testen.

## Snel lokaal testen op een pc
Open een terminal/opdrachtprompt in deze map en voer uit:

    python -m http.server 8080

Open daarna:

    http://localhost:8080

## Publiceren
Upload de volledige inhoud van deze map ongewijzigd naar een HTTPS-webhost, bijvoorbeeld:
- GitHub Pages
- Netlify
- Cloudflare Pages
- een eigen webserver

Na het eerste bezoek kan de app worden geïnstalleerd en offline worden gebruikt.

## Projectbestanden
De webapp ondersteunt:
- .fms-projecten
- .json-back-ups
- .txt als mobiele terugvalroute

Op ondersteunde browsers kan een .fms-bestand bovendien rechtstreeks met FretMaster Studio worden geopend.
