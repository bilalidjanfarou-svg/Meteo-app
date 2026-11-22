import { useState } from "react";
import "./App.css";

const CODES = {
  0: "☀️ Ciel dégagé", 1: "🌤️ Plutôt dégagé", 2: "⛅ Nuageux",
  3: "☁️ Couvert", 45: "🌫️ Brouillard", 51: "🌦️ Bruine",
  61: "🌧️ Pluie", 63: "🌧️ Pluie modérée", 65: "🌧️ Forte pluie",
  80: "🌦️ Averses", 95: "⛈️ Orage",
};
const decrire = (c) => CODES[c] || "🌡️ Météo variable";

export default function App() {
  const [ville, setVille] = useState("");
  const [data, setData] = useState(null);
  const [nom, setNom] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const [unite, setUnite] = useState("C");

  async function chargerMeteo(latitude, longitude, libelle) {
  const meteo = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
      `&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
  ).then((r) => r.json());

  setNom(libelle);
  setData(meteo);
}

async function rechercher(e) {
  e.preventDefault();
  if (!ville.trim()) return;
  setChargement(true);
  setErreur("");
  setData(null);
  try {
    const geo = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ville)}&count=1&language=fr`
    ).then((r) => r.json());

    if (!geo.results) throw new Error("Ville introuvable");
    const { latitude, longitude, name, country } = geo.results[0];
    await chargerMeteo(latitude, longitude, `${name}, ${country}`);
  } catch (err) {
    setErreur(err.message || "Erreur réseau");
  } finally {
    setChargement(false);
  }
}

function geolocaliser() {
  if (!navigator.geolocation) {
    setErreur("Géolocalisation non supportée par ce navigateur");
    return;
  }
  setChargement(true);
  setErreur("");
  setData(null);
  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        await chargerMeteo(coords.latitude, coords.longitude, "📍 Ma position");
      } catch {
        setErreur("Erreur réseau");
      } finally {
        setChargement(false);
      }
    },
    () => {
      setErreur("Position refusée ou indisponible");
      setChargement(false);
    }
  );
}

  const convertir = (t) =>
  unite === "C" ? Math.round(t) : Math.round((t * 9) / 5 + 32);

  return (
    <div className="app">
      <h1>Météo</h1>

      <button
        type="button"
        className="unite"
        onClick={() => setUnite(unite === "C" ? "F" : "C")}
>
         Passer en °{unite === "C" ? "F" : "C"}
      </button>

      <form onSubmit={rechercher}>
        <button type="button" className="geo" onClick={geolocaliser}>
  📍       Utiliser ma position
        </button>
        <input
          value={ville}
          onChange={(e) => setVille(e.target.value)}
          placeholder="Ex : Kara, Lomé..."
        />
        <button>Chercher</button>
      </form>

      {chargement && <p>Chargement...</p>}
      {erreur && <p className="erreur">{erreur}</p>}

      {data && (
        <>
          <div className="carte">
            <h2>{nom}</h2>
            <p className="temp">{convertir(data.current.temperature_2m)}°{unite}</p>
            <p>{decrire(data.current.weather_code)}</p>
            <p>💧 {data.current.relative_humidity_2m}% · 💨 {data.current.wind_speed_10m} km/h</p>
          </div>

          <div className="jours">
            {data.daily.time.slice(1, 6).map((jour, i) => (
              <div className="jour" key={jour}>
                <strong>
                  {new Date(jour).toLocaleDateString("fr-FR", { weekday: "short" })}
                </strong>
                <span>{decrire(data.daily.weather_code[i + 1]).split(" ")[0]}</span>
                <small>
                  {convertir(data.daily.temperature_2m_min[i + 1])}° /{" "}
                  {convertir(data.daily.temperature_2m_max[i + 1])}°
                </small>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}