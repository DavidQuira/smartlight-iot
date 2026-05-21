from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import time
import paho.mqtt.client as mqtt
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS

app = FastAPI(title="SmartLight IoT Cloud Core API", version="5.0")

# CORS abierto para que tus compañeros se conecten desde sus entornos locales de React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CREDENCIALES CLOUD ---
INFLUX_URL = "https://us-east-1-1.aws.cloud2.influxdata.com"
INFLUX_TOKEN = "zzuhWFEb91w0pdkzISUc9B-vdH1y8V7gmXXGbvw-Y0jeOCnWtG7o2_8CjKK_8haxjEtm0pfTfvCY-drpiUTXNw=="
INFLUX_ORG = "Dev team - smartlight"
INFLUX_BUCKET = "log_lights"


MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883
MQTT_TOPIC_AMBIENTE = "usc/smartlightiot/luces"
MQTT_TOPIC_COMANDOS = "usc/smartlightiot/comandos"

# Estado en memoria RAM para que el Frontend consulte el tiempo real al instante
ultimo_estado_sensores = {
    "temp": 0.0, 
    "hum": 0.0, 
    "oscuro": 0, 
    "dist": 0.0, 
    "manA": "0", 
    "manB": "1", 
    "actualizado": "Nunca"
}

# --- INICIALIZAR INFLUXDB CLOUD ---
cliente_influx = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)
api_escritura = cliente_influx.write_api(write_options=SYNCHRONOUS)

def guardar_en_influxdb(datos):
    try:
        punto = Point("maqueta_sensores") \
            .tag("dispositivo", "esp32_wifi") \
            .field("temperatura", float(datos.get("temp", 0.0))) \
            .field("humedad", float(datos.get("hum", 0.0))) \
            .field("oscuridad", int(datos.get("oscuro", 0))) \
            .field("distancia", float(datos.get("dist", 0.0))) \
            .field("modo_manual_A", int(datos.get("manA", 0))) \
            .field("modo_manual_B", int(datos.get("manB", 0))) \
            .time(time.time_ns(), WritePrecision.NS)
        
        api_escritura.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=punto)
        print("[INFLUXDB] Datos históricos guardados exitosamente.")
    except Exception as e:
        print(f"[INFLUXDB ERROR]: {e}")

# --- CLIENTE MQTT SUSCRIPTOR ---
def al_conectar(client, userdata, flags, rc):
    print("[MQTT] Servidor Python en la nube conectado con éxito a HiveMQ.")
    client.subscribe(MQTT_TOPIC_AMBIENTE) # Python se queda escuchando al ESP32

def al_recibir_mensaje(client, userdata, msg):
    global ultimo_estado_sensores
    try:
        payload = msg.payload.decode()
        datos = json.loads(payload)
        
        # Actualizamos la memoria RAM local con lo que mandó el ESP32 por WiFi
        ultimo_estado_sensores = {
            "temp": datos.get("temp", 0.0),
            "hum": datos.get("hum", 0.0),
            "oscuro": datos.get("oscuro", 0),
            "dist": datos.get("dist", 0.0),
            "manA": str(datos.get("manA", "0")),
            "manB": str(datos.get("manB", "0")),
            "actualizado": time.strftime("%H:%M:%S")
        }
        
        # Guardamos en la base de datos
        guardar_en_influxdb(datos)
        
    except Exception as e:
        print(f"[MQTT ERROR Al desempaquetar]: {e}")

cliente_mqtt = mqtt.Client()
cliente_mqtt.on_connect = al_conectar
cliente_mqtt.on_message = al_recibir_mensaje

@app.on_event("startup")
def iniciar_mqtt():
    cliente_mqtt.connect(MQTT_BROKER, MQTT_PORT, 60)
    cliente_mqtt.loop_start() # Inicia el servicio MQTT de fondo sin bloquear a FastAPI

# --- ENDPOINTS API PARA TUS COMPAÑEROS (FRONTEND) ---

@app.get("/api/telemetria")
def obtener_telemetria():
    """El Frontend consulta aquí para ver los datos en tiempo real al instante"""
    return ultimo_estado_sensores

@app.post("/api/hardware/ledA/{comando}")
def controlar_led_A(comando: str):
    """
    Comandos válidos: 'auto', 'on', 'off'
    """
    cmd = comando.upper()
    if cmd in ["AUTO", "ON", "OFF"]:
        mensaje_mqtt = f"A_{cmd}"
        cliente_mqtt.publish(MQTT_TOPIC_COMANDOS, mensaje_mqtt)
        return {"status": "success", "mensaje": f"Comando enviado a la Zona A: {mensaje_mqtt}"}
    return {"status": "error", "mensaje": "Comando inválido para LED A. Usa auto, on u off."}

@app.post("/api/hardware/ledB/{comando}")
def controlar_led_B(comando: str):
    """
    Comandos válidos: 'auto', 'on', 'off'
    """
    cmd = comando.upper()
    if cmd in ["AUTO", "ON", "OFF"]:
        mensaje_mqtt = f"B_{cmd}"
        cliente_mqtt.publish(MQTT_TOPIC_COMANDOS, mensaje_mqtt)
        return {"status": "success", "mensaje": f"Comando enviado a la Zona B: {mensaje_mqtt}"}
    return {"status": "error", "mensaje": "Comando inválido para LED B. Usa auto, on u off."}