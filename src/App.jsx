// src/App.js
import React, { useEffect, useState, useRef } from "react";
import "./App.css";

const API_URL =
  "https://puos0bfgxc2lno5-implingdb.adb.us-phoenix-1.oraclecloudapps.com/ords/impling/implingdev/dev";

// Bounding box to IGNORE
const IGNORE_BOX = {
  xMin: 2552,
  xMax: 2626,
  yMin: 4285,
  yMax: 4353,
};

// Only alert for these NPC IDs
const ALERT_NPCS = new Set([1644, 1654, 7233]);

const AUDIO_FILE = new Audio("/alert.mp3");

function isInIgnoreBox({ xcoord, ycoord }) {
  return (
    xcoord >= IGNORE_BOX.xMin &&
    xcoord <= IGNORE_BOX.xMax &&
    ycoord >= IGNORE_BOX.yMin &&
    ycoord <= IGNORE_BOX.yMax
  );
}

function App() {
  const [feed, setFeed] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [secondsToInactive, setSecondsToInactive] = useState(3600);
  const [alertItem, setAlertItem] = useState(null);
  const [alertOn, setAlertOn] = useState(false);
  const [xLocation, setXLocation] = useState(false);
  const [yLocation, setYLocation] = useState(false);
  const [luckyImpEnabled, setLuckyImpEnabled] = useState(false);
  const [dragonImpEnabled, setDragonImpEnabled] = useState(false);
  const [ninjaImpEnabled, setNinjaImpEnabled] = useState(false);
  const [magpieImpEnabled, setMagpieImpEnabled] = useState(false);
  const [crystalImpEnabled, setCrystalImpEnabled] = useState(false);
  const [alertHistory, setAlertHistory] = useState([]);
  const seenQueue = useRef([]);
  const seenSet = useRef(new Set());

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(fetchAndCheck, 5000);
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (secondsToInactive <= 0) {
     setIsActive(false); 
      return; // Stop when count reaches 0
    }

    const interval = setInterval(() => {
      setSecondsToInactive((prev) => prev - 1);
    }, 1000);

    // Cleanup the interval when the component unmounts or count changes
    return () => clearInterval(interval);
  }, [secondsToInactive]);

  async function fetchAndCheck() {
    try {
      const res = await fetch(API_URL);
      const { items } = await res.json();

      // Dynamically build alert NPCs set
      const alertNpcs = new Set([]);
      if (luckyImpEnabled) alertNpcs.add(7233);
      if (dragonImpEnabled) alertNpcs.add(1644, 1654);
      if (ninjaImpEnabled) alertNpcs.add(1643, 1653);
      if (magpieImpEnabled) alertNpcs.add(1642, 1652);
      if (crystalImpEnabled) {
        for (let id = 8741; id <= 8757; id++) alertNpcs.add(id);
      }

      // Filter out ignore-box and unwanted NPC IDs
      const candidates = items.filter(
        (item) => !isInIgnoreBox(item) && alertNpcs.has(item.npcid)
      );

      // Find first unseen
      const fresh = candidates.find((item) => {
        const key = `${item.insertedtime}:${item.xcoord},${item.ycoord}`;

        return !seenSet.current.has(key);
      });

      if (fresh) triggerAlert(fresh);
      setFeed(items);
    } catch (err) {
      console.error("Fetch error", err);
    }
  }

  function triggerAlert(item) {
    console.log("New Impling found:", item);
    const key = `${item.insertedtime}:${item.xcoord},${item.ycoord}`;
    AUDIO_FILE.play();
    setAlertOn(true);
    //Detect what type of Impling it is and store it in the item using a switch statement
    switch (item.npcid) {
      case 1644:
      case 1654:
        item.type = "Dragon";
        break;
      case 7233:
        item.type = "Lucky";
        break;
      case 1643:
      case 1653:
        item.type = "Ninja";
        break;
      case 1642:
      case 1652:
        item.type = "Magpie";
        break;
      default:
        if (item.npcid >= 8741 && item.npcid <= 8757) {
          item.type = "Crystal";
        } else {
          item.type = "Unknown";
        }
    }
    setAlertItem(item);
    setYLocation(item.ycoord);
    setXLocation(item.xcoord);
    setAlertHistory((prev) => [...prev, item]);

    if (!seenSet.current.has(key)) {
      seenSet.current.add(key);
      seenQueue.current.unshift(key);
      if (seenQueue.current.length > 100) {
        const old = seenQueue.current.pop();
        seenSet.current.delete(old);
      }
    }
  }

  useEffect(() => {
    if (alertOn) {
      const t = setTimeout(() => setAlertOn(false), 15000);
      return () => clearTimeout(t);
    }
  }, [alertOn]);

  function resetAlert() {
    setAlertOn(false);
    setAlertItem(null);
  }

  function activateApp() {
    setSecondsToInactive(3600);
    setIsActive(true);
    //Run every second
    () => {}, 1000;
  }

  function disableApp() {
    setIsActive(false);
    setSecondsToInactive(0);
  }

  function fancyTimeFormat(duration) {
    // Hours, minutes and seconds
    const hrs = ~~(duration / 3600);
    const mins = ~~((duration % 3600) / 60);
    const secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    let ret = "";

    if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;

    return ret;
  }

  const anyImpEnabled = luckyImpEnabled || dragonImpEnabled || ninjaImpEnabled || magpieImpEnabled || crystalImpEnabled;

  return (
    <div className={`App${alertOn ? " alert" : ""}`} style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "20px 0 10px 0" }}>
        <label style={{ fontWeight: 500, fontSize: 18, margin: "1rem" }}>
          <input
            type="checkbox"
            checked={luckyImpEnabled}
            onChange={e => setLuckyImpEnabled(e.target.checked)}
            style={{ marginRight: 8 }}
            disabled={isActive}
          />
          Lucky Impling
        </label>
        <label style={{ fontWeight: 500, fontSize: 18, margin: "1rem" }}>
          <input
            type="checkbox"
            checked={dragonImpEnabled}
            onChange={e => setDragonImpEnabled(e.target.checked)}
            style={{ marginRight: 8 }}
            disabled={isActive}
          />
          Dragon Impling
        </label>
        <label style={{ fontWeight: 500, fontSize: 18, margin: "1rem" }}>
          <input
            type="checkbox"
            checked={ninjaImpEnabled}
            onChange={e => setNinjaImpEnabled(e.target.checked)}
            style={{ marginRight: 8 }}
            disabled={isActive}
          />
          Ninja Impling
        </label>
        <label style={{ fontWeight: 500, fontSize: 18, margin: "1rem" }}>
          <input
            type="checkbox"
            checked={magpieImpEnabled}
            onChange={e => setMagpieImpEnabled(e.target.checked)}
            style={{ marginRight: 8 }}
            disabled={isActive}
          />
          Magpie Impling
        </label>
        <label style={{ fontWeight: 500, fontSize: 18, margin: "1rem" }}>
          <input
            type="checkbox"
            checked={crystalImpEnabled}
            onChange={e => setCrystalImpEnabled(e.target.checked)}
            style={{ marginRight: 8 }}
            disabled={isActive}
          />
          Crystal Impling
        </label>
      </div>
      <h1 style={{ textAlign: "center" }}>Impling Monitor</h1>
      <div style={{ marginBottom: 10 }}>
      </div>
      {isActive ? (
        <>
          <p>
            Time remaining until next activation required:{" "}
            {fancyTimeFormat(secondsToInactive)}{" "}
          </p>

          <button onClick={resetAlert} className="reset-btn">
            Reset Notification
          </button>

          <div>
            {alertItem && alertOn && (
              <div className="alert-box">
                <h2>🛎️ New {alertItem.type} Impling! 🛎️ </h2>
                <p>
                  World: {alertItem.world}. <a target="_blank" rel="noreferrer" href={`https://jackdallas.github.io/osrs-map/?centreX=${alertItem.xcoord}&centreY=${alertItem.ycoord}&centreZ=0&zoom=9&markerX=${alertItem.xcoord}&markerY=${alertItem.ycoord}`}>Click here for the location!</a>
                </p>
              </div>
            )}
          </div>

          &nbsp;

          <button onClick={disableApp} className="reset-btn">
            Disable
          </button>
        </>
      ) : (
        <>
          <p>Select your implings and press the button below to activate the app for 1 hour.</p>
          <button onClick={activateApp} className="reset-btn" disabled={!anyImpEnabled}>
            Activate
          </button>

          <p>
            The screen will go red and an audio cue will play once a selected Impling is found.
          </p>
          <p>
            This tracker will only track Implings outside of Puro Puro.
          </p>
          <p>Once an alert plays, look at the world, and follow the link to see it's location on a map in a new tab.</p>
        </>
      )}

      {/* Alert History Section */}
      <div style={{
        width: "90%",
        maxWidth: 800,
        margin: "40px auto 0 auto",
        padding: 16,
        background: "#2d2d2d", // medium gray for dark backgrounds
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}>
        <h2 style={{ textAlign: "center", marginBottom: 12 }}>Alert History</h2>
        <div style={{ borderRadius: 6, overflow: "hidden", border: "1px solid #ddd" }}>
          {alertHistory.slice(-50).reverse().map((item, idx) => (
            <div
              key={`${item.insertedtime}:${item.xcoord},${item.ycoord}`}
              style={{
                background: idx % 2 === 0 ? "#757575" : "#626363",
                borderBottom: "1px solid #e0e0e0",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                fontSize: 15,
              }}
            >
              <span style={{ flex: 2 }}>
                {new Date(item.insertedtime).toLocaleString()}
              </span>
              <span style={{ flex: 1, textAlign: "center" }}>World: {item.world}</span>
              <span style={{ flex: 1, textAlign: "center" }}>{item.type}</span>
              <span style={{ flex: 3, textAlign: "right" }}>
                <a
                  href={`https://jackdallas.github.io/osrs-map/?centreX=${item.xcoord}&centreY=${item.ycoord}&centreZ=0&zoom=9&markerX=${item.xcoord}&markerY=${item.ycoord}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#fff", textDecoration: "underline" }}
                >
                  View Map
                </a>
              </span>
            </div>
          ))}
          {alertHistory.length === 0 && (
            <div style={{ padding: 12, textAlign: "center", color: "#888" }}>
              No alerts yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
