# 🌤️ Meteo App

Application météo développée avec React et Vite. Elle utilise l'API gratuite [Open-Meteo](https://open-meteo.com/) (aucune clé API requise).

🔗 **Démo** : _à ajouter après le déploiement_

## Fonctionnalités

- 🔎 Recherche par nom de ville
- 📍 Géolocalisation du navigateur
- 📅 Prévisions sur 5 jours
- 🌡️ Bascule °C / °F
- 🕘 Historique des 5 dernières villes (sauvegardé dans le `localStorage`)
- ⚡ Chargement automatique de la dernière ville à l'ouverture

## Technologies

- React (hooks : `useState`, `useEffect`)
- Vite
- API Open-Meteo (géocodage + prévisions)
- CSS

## Installation

```bash
git clone https://github.com/TON_USER/meteo-app.git
cd meteo-app
npm install
npm run dev
```

L'application est disponible sur `http://localhost:5173`.

## Améliorations prévues

- Déploiement sur Vercel
- Version PWA installable sur téléphone

## Auteur

**Bilali**, développeur basé à Kara, Togo.