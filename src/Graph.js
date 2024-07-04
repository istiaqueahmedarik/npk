import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import NavBar from './NavBar';

const ros = new ROSLIB.Ros({
    url: 'ws://192.168.68.103:9090' // Replace with your ROSBridge WebSocket server URL
});

const SensorChart = () => {
    const [data, setData] = useState({
        humidity: [],
        temperature: [],
        conductivity: [],
        ph: [],
        nitrogen: [],
        phosphorus: [],
        potassium: [],
    });
    const [labels, setLabels] = useState([]);

    useEffect(() => {
        ros.on('connection', () => {
            console.log('Connected to ROSBridge server');
        });

        ros.on('error', (error) => {
            console.error('Error connecting to ROSBridge server:', error);
        });

        ros.on('close', () => {
            console.log('Disconnected from ROSBridge server');
        });

        // Create a ROS topic object
        const sensorTopic = new ROSLIB.Topic({
            ros: ros,
            name: '/sensor_data',
            messageType: 'std_msgs/String'
        });

        // Subscribe to the sensor data topic
        sensorTopic.subscribe((message) => {
            const sensorData = message.data;
            console.log('Received sensor data:', sensorData);
            const parsedData = sensorData.split(',').map(Number);
            if (parsedData.length === 7) {
                const [humidity, temperature, conductivity, ph, nitrogen, phosphorus, potassium] = parsedData;

                setData(prevData => ({
                    humidity: updateDataArray(prevData.humidity, humidity),
                    temperature: updateDataArray(prevData.temperature, temperature),
                    conductivity: updateDataArray(prevData.conductivity, conductivity),
                    ph: updateDataArray(prevData.ph, ph),
                    nitrogen: updateDataArray(prevData.nitrogen, nitrogen),
                    phosphorus: updateDataArray(prevData.phosphorus, phosphorus),
                    potassium: updateDataArray(prevData.potassium, potassium),
                }));
                setLabels(prevLabels => updateDataArray(prevLabels, new Date().toLocaleTimeString()));
            } else {
                console.error('Received invalid sensor data:', sensorData);
            }
        });

        // Clean up the ROS connection on component unmount
        return () => {
            console.log('Disconnecting ROS');
            // ros.close();
        };
    }, []);

    const updateDataArray = (arr, newValue) => {
        return [...arr.slice(-9), newValue];
    };

    const generateChart = (label, color, dataKey) => {
        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: label,
                    data: data[dataKey],
                    borderColor: color,
                    borderWidth: 1,
                    fill: false,
                },
            ],
        };

        const options = {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time',
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Value',
                    },
                    beginAtZero: true,
                },
            },
        };

        return (
            <div className="chart-container" key={dataKey}>
                <h2>{`${label}`}</h2>
                <div className='level'>{`( ${data[dataKey][data[dataKey].length - 1]?.toFixed(2)} ) ${dataKey === 'temperature' ? '°C' : dataKey === 'humidity' ? '%' : dataKey === 'ph' ? 'pH' : dataKey === 'conductivity' ? 'µS/cm' : dataKey === 'nitrogen' ? 'mg/kg' : dataKey === 'phosphorus' ? 'mg/kg' : dataKey === 'potassium' ? 'mg/kg' : ''}
                `}</div>
                <Line data={chartData} options={options} />
            </div>
        );
    };

    return (
        <div className='home'>
            <NavBar/>
            <div className="sensor-charts">
                {generateChart('Humidity', 'blue', 'humidity')}
                {generateChart('Temperature', 'red', 'temperature')}
                {/* {generateChart('Conductivity', 'green', 'conductivity')} */}
                {generateChart('pH', 'purple', 'ph')}
                {generateChart('Nitrogen', 'orange', 'nitrogen')}
                {generateChart('Phosphorus', 'brown', 'phosphorus')}
                {generateChart('Potassium', 'cyan', 'potassium')}
            </div>
            </div>
    );
};

export default SensorChart;
