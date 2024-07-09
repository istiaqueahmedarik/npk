import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const CameraFeed = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Connect to the Socket.IO server
    const socket = io('http://localhost:5000');

    // Listen for image data from the server
    socket.on('image_data', (data) => {
      setImage(data.image);
      setLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const captureImage = () => {
    setLoading(true);
    const socket = io('http://localhost:5000');
    socket.emit('capture_image');
  };

  return (
    <div style={styles.container}>
      <button onClick={captureImage} style={styles.button}>
        {loading ? 'Capturing...' : 'Capture Image'}
      </button>
      {image && <img src={`data:image/png;base64,${image}`} alt="Captured" style={styles.image} />}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '20px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  image: {
    marginTop: '20px',
    maxWidth: '100%',
    borderRadius: '10px',
    boxShadow: '0px 0px 10px rgba(0,0,0,0.5)',
  },
};

export default CameraFeed;
