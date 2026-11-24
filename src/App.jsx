import { useState, useEffect } from "react";
import "./App.css";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
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
  const [historique, setHistorique] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("historique")) || [];
  } catch {
    return [];
  }
});
  useEffect(() => {
  document.body.style.backgroundImage = data
    ? themeFond(data.current.weather_code, data.current.is_day === 1)
    : "none";
}, [data]);

function themeFond(code, jour) {
  if (!jour) return "linear-gradient(160deg, #0f172a, #312e81)";
  if (code <= 1) return "linear-gradient(160deg, #0284c7, #38bdf8)";
  if (code <= 3) return "linear-gradient(160deg, #475569, #94a3b8)";
  if (code === 45 || code === 48) return "linear-gradient(160deg, #64748b, #cbd5e1)";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
    return "linear-gradient(160deg, #1e3a5f, #475569)";
  if (code >= 71 && code <= 86) return "linear-gradient(160deg, #94a3b8, #e2e8f0)";
  if (code >= 95) return "linear-gradient(160deg, #1e1b4b, #581c87)";
  return "linear-gradient(160deg, #0f172a, #1e293b)";
}
useEffect(() => {
  localStorage.setItem("historique", JSON.stringify(historique));
}, [historique]);

  async function chargerMeteo(latitude, longitude, libelle) {
  const meteo = await fetch(
  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code` +
    `&hourly=temperature_2m,precipitation_probability` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset,uv_index_max&timezone=auto`
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,is_day` +

).then((r) => r.json());

  setNom(libelle);
  setData(meteo);
}

function ajouterHistorique(nomVille) {
  setHistorique((h) =>
    [nomVille, ...h.filter((v) => v !== nomVille)].slice(0, 5)
  );
}

async function chercherVille(nomVille) {
  if (!nomVille.trim()) return;
  setChargement(true);
  setErreur("");
  setData(null);
  try {
    const geo = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nomVille)}&count=1&language=fr`
    ).then((r) => r.json());

    if (!geo.results) throw new Error("Ville introuvable");
    const { latitude, longitude, name, country } = geo.results[0];
    await chargerMeteo(latitude, longitude, `${name}, ${country}`);
    ajouterHistorique(name);
  } catch (err) {
    setErreur(err.message || "Erreur réseau");
  } finally {
    setChargement(false);
  }
}

useEffect(() => {
  if (historique[0]) {
    setVille(historique[0]);
    chercherVille(historique[0]);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

function rechercher(e) {
  e.preventDefault();
  chercherVille(ville);
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

  const niveauUV = (uv) => {
  if (uv < 3) return "Faible";
  if (uv < 6) return "Modéré";
  if (uv < 8) return "Élevé";
  return "Très élevé";
};

    const donneesHoraires = data
  ? data.hourly.time.slice(0, 24).map((h, i) => ({
      heure: h.slice(11, 16),
      temp: convertir(data.hourly.temperature_2m[i]),
      pluie: data.hourly.precipitation_probability[i],
    }))
  : [];
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

      {historique.length > 0 && (
  <div className="historique">
    {historique.map((v) => (
      <button
        type="button"
        key={v}
        onClick={() => {
          setVille(v);
          chercherVille(v);
        }}D
      >
        {v}
      </button>
    ))}
    <button type="button" className="vider" onClick={() => setHistorique([])}>
      ✕ Vider
    </button>
  </div>
)}

  
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
            
          </div>

          <div className="infos">
  <div className="info">
    <span>🌡️ Ressenti</span>
    <strong>{convertir(data.current.apparent_temperature)}°{unite}</strong>
  </div>
  <div className="info">
    <span>💧 Humidité</span>
    <strong>{data.current.relative_humidity_2m}%</strong>
  </div>
  <div className="info">
    <span>💨 Vent</span>
    <strong>{Math.round(data.current.wind_speed_10m)} km/h</strong>
  </div>
  <div className="info">
    <span>☀️ Indice UV</span>
    <strong>
      {Math.round(data.daily.uv_index_max[0])} · {niveauUV(data.daily.uv_index_max[0])}
    </strong>
  </div>
  <div className="info">
    <span>🌅 Lever</span>
    <strong>{data.daily.sunrise[0].slice(11, 16)}</strong>
  </div>
  <div className="info">
    <span>🌇 Coucher</span>
    <strong>{data.daily.sunset[0].slice(11, 16)}</strong>
  </div>
</div>

            <div className="graphique">
  <h3>Température sur 24 h</h3>
  <ResponsiveContainer width="100%" height={180}>
    <AreaChart data={donneesHoraires}>
      <XAxis dataKey="heure" interval={3} stroke="#94a3b8" fontSize={12} />
      <YAxis stroke="#94a3b8" fontSize={12} width={32} unit="°" />
      <Tooltip contentStyle={{ background: "#0f172a", border: "none" }} />
      <Area
        type="monotone"
        dataKey="temp"
        stroke="#38bdf8"
        fill="#38bdf8"
        fillOpacity={0.3}
      />
    </AreaChart>
  </ResponsiveContainer>
</div>

          <div className="graphique">
  <h3>Probabilité de pluie</h3>
  <ResponsiveContainer width="100%" height={160}>
    <BarChart data={donneesHoraires}>
      <XAxis dataKey="heure" interval={3} stroke="#94a3b8" fontSize={12} />
      <YAxis stroke="#94a3b8" fontSize={12} width={36} unit="%" domain={[0, 100]} />
      <Tooltip
        contentStyle={{ background: "#0f172a", border: "none" }}
        formatter={(v) => [`${v}%`, "Pluie"]}
      />
      <Bar dataKey="pluie" fill="#60a5fa" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
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