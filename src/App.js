import logo from './logo.svg';
import './App.css';
import SensorChart from './Graph';
// import CameraFeed from './Camera';
import GpsData from './GPS'


function App() {
  return (
    <div className="App">
      
      <SensorChart />
      {/* <CameraFeed/> */}
      <GpsData/>
    </div>
  );
}

export default App;
