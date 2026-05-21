#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// --- CONFIGURACIÓN DE RED WIFI ---
const char* ssid = "LEVIRO";          // Reemplaza con tu red
const char* password = "C@rlos1284";  // Reemplaza con tu clave

// --- CONFIGURACIÓN HIVEMQ PÚBLICO ---
const char* mqtt_broker = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* topic_ambiente = "usc/smartlightiot/luces";
const char* topic_comandos = "usc/smartlightiot/comandos";

// --- PINES DEL HARDWARE ---
#define DHTPIN 14          
#define DHTTYPE DHT11
#define LDRPIN 27          
#define TRIG_PIN 5
#define ECHO_PIN 18

#define LED_ZONA_A 25      // LED 1 (Automático por defecto)
#define LED_ZONA_B 26      // LED 2 (Manual por defecto)

// LED B usa lógica invertida en el hardware de salida.
constexpr bool LED_B_ACTIVO_EN_BAJO = true;

// --- INSTANCIAS ---
DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);

// --- VARIABLES DE ESTADO (Control de Modos) ---
bool modoManualA = false;   // false = Automático (Sensores), true = Manual (Web)
bool estadoLED_A = false;

bool modoManualB = false;    // Ambos LEDs arrancan en automático
bool estadoLED_B = false;

void escribir_led_b(bool encendido) {
  digitalWrite(LED_ZONA_B, LED_B_ACTIVO_EN_BAJO ? (encendido ? LOW : HIGH) : (encendido ? HIGH : LOW));
}

unsigned long ultimoMensaje = 0;

// --- FUNCIÓN DE CONEXIÓN WIFI ---
void configurar_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando a ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("¡WiFi Conectado!");
  Serial.print("Dirección IP: ");
  Serial.println(WiFi.localIP());
}

// --- CALLBACK: RECIBIR ÓRDENES DESDE LA WEB (HIVE MQ) ---
void al_recibir_mensaje(char* topic, byte* payload, unsigned int length) {
  String mensaje = "";
  for (int i = 0; i < length; i++) {
    mensaje += (char)payload[i];
  }
  
  Serial.print("[MQTT Comando Recibido] -> ");
  Serial.println(mensaje);

  // --- CORRECCIÓN PARA LED A (Pin 25) ---
  if (mensaje == "A_AUTO") {
    modoManualA = false;
    digitalWrite(LED_ZONA_A, LOW); // Limpiamos el pin para que los sensores tomen el control desde cero
    Serial.println("LED A regresó a modo AUTOMÁTICO.");
  } 
  else if (mensaje == "A_ON") {
    modoManualA = true;
    estadoLED_A = true;
    digitalWrite(LED_ZONA_A, HIGH); // Forzamos la salida física de inmediato
    Serial.println("LED A en MANUAL: ENCENDIDO.");
  } 
  else if (mensaje == "A_OFF") {
    modoManualA = true;
    estadoLED_A = false;
    digitalWrite(LED_ZONA_A, LOW);  // Forzamos la salida física de inmediato
    Serial.println("LED A en MANUAL: APAGADO.");
  }

  // --- CORRECCIÓN PARA LED B (Pin 26) ---
  else if (mensaje == "B_AUTO") {
    modoManualB = false;
    escribir_led_b(false); // Limpiamos el pin
    Serial.println("LED B regresó a modo AUTOMÁTICO.");
  }
  else if (mensaje == "B_ON") {
    modoManualB = true;
    estadoLED_B = true;
    escribir_led_b(true);
    Serial.println("LED B en MANUAL: ENCENDIDO.");
  }
  else if (mensaje == "B_OFF") {
    modoManualB = true;
    estadoLED_B = false;
    escribir_led_b(false);
    Serial.println("LED B en MANUAL: APAGADO.");
  }
}

// --- RECONEXIÓN A MQTT ---
void reconectar_mqtt() {
  while (!client.connected()) {
    Serial.print("Intentando conexión MQTT a HiveMQ...");
    // Crear un ID de cliente único basado en el chip de la placa
    String clientId = "ESP32Client-SmartLight-";
    clientId += String(random(0, 0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println("¡Conectado al Broker!");
      // Nos suscribimos al tópico de comandos que envía Python
      client.subscribe(topic_comandos);
    } else {
      Serial.print("Fallo, rc=");
      Serial.print(client.state());
      Serial.println(" Reintentando en 5 segundos...");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  pinMode(LED_ZONA_A, OUTPUT);
  pinMode(LED_ZONA_B, OUTPUT);
  escribir_led_b(false);
  pinMode(LDRPIN, INPUT); 
  pinMode(TRIG_PIN, OUTPUT); 
  pinMode(ECHO_PIN, INPUT);  

  configurar_wifi();
  client.setServer(mqtt_broker, mqtt_port);
  client.setCallback(al_recibir_mensaje);
}

void loop() {
  if (!client.connected()) {
    reconectar_mqtt();
  }
  client.loop(); // Mantiene viva la escucha de comandos

  // --- LECTURA PERIÓDICA DE SENSORES Y ENVÍO DE TELEMETRÍA (Cada 2 segundos) ---
  unsigned long ahora = millis();
  if (ahora - ultimoMensaje > 2000) {
    ultimoMensaje = ahora;

    // 1. Medir distancia (Ultrasonido)
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    long duracion = pulseIn(ECHO_PIN, HIGH);
    float distancia = (duracion / 2.0) / 29.1;

    // 2. Medir Temperatura, Humedad y Luz
    float humedad = dht.readHumidity();
    float temperatura = dht.readTemperature();
    int estadoOscuridad = digitalRead(LDRPIN); 

    if (isnan(humedad)) humedad = 0.0;
    if (isnan(temperatura)) temperatura = 0.0;
    if (distancia > 400 || distancia < 2) distancia = 0.0;

    // --- LÓGICA DE CONTROL DINÁMICA ---
    bool deteccionPresencia = (distancia >= 2 && distancia <= 30);

    // CONTROL LED A (Pin 25)
    if (modoManualA) {
      digitalWrite(LED_ZONA_A, estadoLED_A ? HIGH : LOW);
    } else {
      // Modo Automático: Prende solo si está oscuro Y hay alguien cerca
      if (estadoOscuridad == HIGH && deteccionPresencia) {
        digitalWrite(LED_ZONA_A, HIGH);
      } else {
        digitalWrite(LED_ZONA_A, LOW);
      }
    }

    // CONTROL LED B (Pin 26)
if (modoManualB) {
      escribir_led_b(estadoLED_B);
    } else {
      // Modo Automático: Copia exactamente la condición del LED A (Oscuridad + Presencia)
      if (estadoOscuridad == HIGH && deteccionPresencia) {
        escribir_led_b(true);  // Enciende respetando su lógica física baja
      } else {
        escribir_led_b(false); // Apaga respetando su lógica física alta
      }
    }

    // --- ENVIAR DATOS A PYTHON EN FORMATO JSON POR MQTT ---
    String jsonPayload = "{\"temp\":" + String(temperatura, 1) + 
                         ",\"hum\":" + String(humedad, 1) + 
                         ",\"oscuro\":" + String(estadoOscuridad) + 
                         ",\"dist\":" + String(distancia, 1) + 
                         ",\"manA\":" + String(modoManualA ? "1" : "0") + 
                         ",\"manB\":" + String(modoManualB ? "1" : "0") + "}";
    
    client.publish(topic_ambiente, jsonPayload.c_str());
    Serial.print("[MQTT Enviado] -> ");
    Serial.println(jsonPayload);
  }
}