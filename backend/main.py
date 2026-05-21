from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import serial
import json
import threading
import time
import paho.mqtt.client as mqtt
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS

app = FastAPI(title="SmartLight IoT Full-Cloud API", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------------
#  CONFIGURACIÓN DE INFLUXDB CLOUD (Reemplaza con tus datos reales)
# -------------------------------------------------------------------------
INFLUX_URL = "https://us-east-1-1.aws.cloud2.influxdata.com"
INFLUX_TOKEN = "zzuhWFEb91w0pdkzISUc9B-vdH1y8V7gmXXGbvw-Y0jeOCnWtG7o2_8CjKK_8haxjEtm0pfTfvCY-drpiUTXNw=="
INFLUX_ORG = "Dev team - smartlight"
INFLUX_BUCKET = "log_lights"

# Inicializar cliente de InfluxDB
try:
    cliente_influx = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)
    api_escritura = cliente_influx.write_api(write_options=SYNCHRONOUS)
    print("[INFLUXDB] Cliente inicializado correctamente.")
except Exception as e:
    print(f"[INFLUXDB ERROR] No se pudo inicializar el cliente: {e}")

# -------------------------------------------------------------------------
#  CONFIGURACIÓN DE HIVEMQ PÚBLICO
# -------------------------------------------------------------------------
MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883
MQTT_TOPIC = "usc/smartlightiot/luces"  # Asegúrate de usar el tuyo

ultimo_estado_sensores = {"temp": 0.0, "hum": 0.0, "oscuro": 0, "dist": 0.0, "actualizado": "Nunca"}

# Función para guardar datos en InfluxDB
def guardar_en_influxdb(datos):
    try:
        # Estructuramos el punto de serie temporal de InfluxDB
        # "maqueta_sensores" es la tabla (measurement)
        # "dispositivo=esp32_edge" es una etiqueta para filtrar rápido (tag)
        punto = Point("maqueta_sensores") \
            .tag("dispositivo", "esp32_edge") \
            .field("temperatura", float(datos.get("temp", 0.0))) \
            .field("humedad", float(datos.get("hum", 0.0))) \
            .field("oscuridad", int(datos.get("oscuro", 0))) \
            .field("distancia", float(datos.get("dist", 0.0))) \
            .time(time.time_ns(), WritePrecision.NS)
        
        # Escribir en la nube de InfluxDB
        api_escritura.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=punto)
        print(f"[INFLUXDB] Datos almacenados con éxito en la nube.")
    except Exception as e:
        print(f"[INFLUXDB ERROR] Al escribir datos: {e}")

# -------------------------------------------------------------------------
#  CLIENTE MQTT: SUSCRIPTOR
# -------------------------------------------------------------------------
def al_conectar(client, userdata, flags, rc):
    if rc == 0:
        print(f"[HIVEMQ] Conectado al broker de HiveMQ.")
        client.subscribe(MQTT_TOPIC)
    else:
        print(f"[HIVEMQ ERROR] Fallo de conexión: {rc}")

def al_recibir_mensaje(client, userdata, msg):
    global ultimo_estado_sensores
    try:
        payload = msg.payload.decode()
        datos = json.loads(payload)
        
        ultimo_estado_sensores = {
            "temp": datos.get("temp", 0.0),
            "hum": datos.get("hum", 0.0),
            "oscuro": datos.get("oscuro", 0),
            "dist": datos.get("dist", 0.0),
            "actualizado": time.strftime("%H:%M:%S")
        }
        
        print(f"[HIVEMQ NUBE] Mensaje Recibido -> {payload}")
        
        # PASO CRUCIAL: Guardamos la telemetría en InfluxDB Cloud de inmediato
        guardar_en_influxdb(datos)

    except Exception as e:
        print(f"[MQTT ERROR] Al procesar mensaje: {e}")

cliente_mqtt_sub = mqtt.Client()
cliente_mqtt_sub.on_connect = al_conectar
cliente_mqtt_sub.on_message = al_recibir_mensaje

def loop_mqtt_sub():
    try:
        cliente_mqtt_sub.connect(MQTT_BROKER, MQTT_PORT, 60)
        cliente_mqtt_sub.loop_forever()
    except Exception as e:
        print(f"[HIVEMQ ERROR] No se pudo establecer conexión remota: {e}")

threading.Thread(target=loop_mqtt_sub, daemon=True).start()

# -------------------------------------------------------------------------
#  HILO SERIAL: LEER HARDWARE Y PUBLICAR EN HIVEMQ (Gateway)
# -------------------------------------------------------------------------
def escuchar_serial_y_publicar_mqtt():
    PUERTO_SERIAL = 'COM5'
    BAUDIOS = 115200
    cliente_mqtt_pub = mqtt.Client()
    
    while True:
        try:
            print(f"[SERIAL] Conectando al ESP32 en {PUERTO_SERIAL}...")
            esp32 = serial.Serial(PUERTO_SERIAL, BAUDIOS, timeout=1)
            time.sleep(2)
            print("[SERIAL] Hardware conectado por USB.")
            
            cliente_mqtt_pub.connect(MQTT_BROKER, MQTT_PORT, 60)
            
            while True:
                if esp32.in_waiting > 0:
                    linea = esp32.readline().decode('utf-8').strip()
                    try:
                        json_verificado = json.loads(linea)
                        cliente_mqtt_pub.publish(MQTT_TOPIC, json.dumps(json_verificado))
                    except json.JSONDecodeError:
                        pass
                time.sleep(0.1)
        except (serial.SerialException, UnboundLocalError):
            print("[SERIAL] Error en cable USB. Reintentando en 5 segundos...")
            time.sleep(5)
        except Exception as e:
            print(f"[GATEWAY ERROR]: {e}")
            time.sleep(5)

threading.Thread(target=escuchar_serial_y_publicar_mqtt, daemon=True).start()

# --- ENDPOINTS API ---
@app.get("/")
def inicio():
    return {"mensaje": "Ecosistema Edge-Cloud Completo Activo"}

@app.get("/api/telemetria")
def obtener_telemetria():
    return ultimo_estado_sensores