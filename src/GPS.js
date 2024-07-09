import React, { useState, useEffect } from 'react';
import ROSLIB from 'roslib';

const GpsData = () => {
    const [data, setData] = useState({
        relative_heading: 0,
        distance: 0,
    });

    const [targetCoords, setTargetCoords] = useState({
        lat: '',
        lon: '',
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setTargetCoords({
            ...targetCoords,
            [name]: value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://192.168.1.102:5005/gps', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lat: parseFloat(targetCoords.lat),
                    lon: parseFloat(targetCoords.lon),
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json();
            setData(responseData);
        } catch (error) {
            console.error('Error sending GPS data', error);
        }
    };

    useEffect(() => {
        const ros = new ROSLIB.Ros({
            url: 'ws://192.168.68.111:9090'
        });

        ros.on('connection', () => {
            console.log('Connected to websocket server.');
        });

        ros.on('error', (error) => {
            console.error('Error connecting to websocket server: ', error);
        });

        ros.on('close', () => {
            console.log('Connection to websocket server closed.');
        });

        const relativeHeadingListener = new ROSLIB.Topic({
            ros: ros, 
            name: '/relative_heading_topic',
            messageType: 'std_msgs/Float64'
        });

        const distanceListener = new ROSLIB.Topic({
            ros: ros,
            name: '/distance_topic',
            messageType: 'std_msgs/Float64'
        });

        relativeHeadingListener.subscribe((message) => {
            setData((prevData) => ({
                ...prevData,
                relative_heading: message.data,
            }));
        });

        distanceListener.subscribe((message) => {
            setData((prevData) => ({
                ...prevData,
                distance: message.data,
            }));
        });

        return () => {
            relativeHeadingListener.unsubscribe();
            distanceListener.unsubscribe();
            ros.close();
        };
    }, []);

    return (
        <div className="gps-container">
            <h1 className="gps-heading">GPS Data</h1>
            <form className="gps-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="latitude" className="form-label">
                        Latitude:
                    </label>
                    <input
                        id="latitude"
                        type="text"
                        name="lat"
                        className="form-input"
                        value={targetCoords.lat}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="longitude" className="form-label">
                        Longitude:
                    </label>
                    <input
                        id="longitude"
                        type="text"
                        name="lon"
                        className="form-input"
                        value={targetCoords.lon}
                        onChange={handleInputChange}
                    />
                </div>
                <button type="submit" className="submit-btn">Send</button>
            </form>
            <div className="data-output">
                <p className="data-heading">Relative Heading: <span className="data-value">{data.relative_heading}</span></p>
                <p className="data-heading">Distance: <span className="data-value">{data.distance}</span></p>
            </div>
        </div>
    );
};

export default GpsData;
