
import minimalmodbus
import serial
import time
import rospy
from std_msgs.msg import String
import random

def initialize_instrument():
    instrument = minimalmodbus.Instrument('/dev/np', 1)  # Port name, slave address (in decimal)
    instrument.serial.baudrate = 4800
    instrument.serial.bytesize = 8
    instrument.serial.parity = serial.PARITY_NONE
    instrument.serial.stopbits = 1
    instrument.serial.timeout = 1  # seconds
    return instrument

# Initialize the ROS node
rospy.init_node('sensor_reader', anonymous=True)
pub = rospy.Publisher('/sensor_data', String, queue_size=10)

def read_sensor_data(instrument):
    try:
        # Read and scale humidity (address 0x0000)
        humidity_raw = instrument.read_register(0x0000, 0, 3)
        humidity = humidity_raw * 0.1
        #humidity = random.randint(0, 100)
        # Read and scale temperature (address 0x0001)
        temperature_raw = instrument.read_register(0x0001, 0, 3)
        temperature = temperature_raw * 0.1
        #temperature = random.randint(0, 100)
        # Read conductivity (address 0x0002)
        conductivity_raw = instrument.read_register(0x0002, 0, 3)
        conductivity = conductivity_raw
        #conductivity = random.randint(0, 100)
        # Read and scale pH (address 0x0003)
        ph_raw = instrument.read_register(0x0003, 0, 3)
        ph = ph_raw * 0.1
        #ph = random.randint(0, 100)
        # Read nitrogen (address 0x0014)
        nitrogen_raw = instrument.read_register(0x0014, 0, 3)
        nitrogen = nitrogen_raw
        #nitrogen = random.randint(0, 100)
        # Read phosphorus (address 0x0015)
        phosphorus_raw = instrument.read_register(0x0015, 0, 3)
        phosphorus = phosphorus_raw
        #phosphorus = random.randint(0, 100)
        # Read potassium (address 0x0016)
        potassium_raw = instrument.read_register(0x0016, 0, 3)
        potassium = potassium_raw
        #potassium = random.randint(0,100)
        # Create a comma-separated string of the sensor data
        sensor_data = f"{humidity},{temperature},{conductivity},{ph},{nitrogen},{phosphorus},{potassium}"
        rospy.loginfo(f"Publishing: {sensor_data}")

        # Publish the data
        pub.publish(sensor_data)

    except minimalmodbus.NoResponseError:
        rospy.logerr("Error: No response from the sensor. Check connections and power.")
        return False
    except minimalmodbus.InvalidResponseError:
        rospy.logerr("Error: Received invalid response from the sensor.")
        return False
    except Exception as e:
        rospy.logerr(f"Error: {e}")
        return False
    return True

def main():
    rate = rospy.Rate(250) # Frequency of 0.2 Hz (5 seconds interval)
    instrument = initialize_instrument()
    
    while not rospy.is_shutdown():
        success = read_sensor_data(instrument)
        if not success:
            rospy.logwarn("Reinitializing the instrument due to an error.")
            instrument = initialize_instrument()
        rate.sleep()

if __name__ == '__main__':
    try:
        main()
    except rospy.ROSInterruptException:
        pass
