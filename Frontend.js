// App.js
import React, { useEffect, useState } from 'react';
import './App.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function App() {
  const [robots, setRobots] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    ws.onmessage = (event) => {
      setRobots(JSON.parse(event.data));
    };
    return () => ws.close();
  }, []);

  const filteredRobots = robots.filter((robot) => {
    if (filter === 'all') return true;
    if (filter === 'online') return robot.online;
    if (filter === 'offline') return !robot.online;
    if (filter === 'lowBattery') return robot.battery < 20;
    return true;
  });

  return (
    <div className="App">
      <header>
        <h1>Robot Fleet Dashboard</h1>
        <select onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Robots</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="lowBattery">Low Battery</option>
        </select>
      </header>
      <div className="dashboard">
        <div className="robot-list">
          {filteredRobots.map((robot) => (
            <div
              className={`robot ${
                !robot.online ? 'offline' : robot.battery < 20 ? 'low-battery' : ''
              }`}
              key={robot.robot_id}
            >
              <h3>{robot.name}</h3>
              <p>Type: {robot.type}</p>
              <p>ID: {robot.robot_id}</p>
              <p>Status: {robot.online ? 'Online' : 'Offline'}</p>
              <p>Battery: {robot.battery}%</p>
              <p>CPU Usage: {robot.cpu}%</p>
              <p>RAM: {robot.ram}MB</p>
              <p>Disk Space: {robot.disk_space}GB</p>
              <p>Temperature: {robot.temperature}°C</p>
              <p>Last Updated: {new Date(robot.last_updated).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <MapContainer center={[0, 0]} zoom={2} className="map">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {robots.map(
            (robot) =>
              robot.online && (
                <Marker position={robot.location} key={robot.robot_id}>
                  <Popup>
                    <p>Name: {robot.name}</p>
                    <p>Type: {robot.type}</p>
                    <p>Battery: {robot.battery}%</p>
                  </Popup>
                </Marker>
              )
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;

// App.css
.App {
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
  height: 100vh;
  background-color: #f5f5f5;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #4caf50;
  color: white;
}
header h1 {
  margin: 0;
}
header select {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
}
.dashboard {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  flex-grow: 1;
}
.robot-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  width: 40%;
  overflow-y: auto;
  padding: 1rem;
}
.robot {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.robot.low-battery {
  background-color: #ffcccc;
}
.robot.offline {
  background-color: #f0f0f0;
}
.map {
  flex-grow: 1;
  height: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
}
