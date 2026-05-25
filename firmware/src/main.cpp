#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// --- CONFIGURACIÓN DE RED WIFI ---
const char* ssid = "LEVIRO";          
const char* password = "C@rlos1284";  

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
bool modoManualA = false;   
bool estadoLED_A = false;

bool modoManualB = false;    
bool estadoLED_B = false;

// --- NUEVAS VARIABLES PARA PERSISTENCIA (Temporizador de luces) ---
unsigned long tiempoUltimaPresencia = 0; 
const unsigned long TIEMPO_ESPERA_APAGADO = 5000; // Tiempo de gracia en milisegundos (5 segundos)
bool banderaLucesAutoEncendidas = false;          // Controla si el temporizador está activo

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

// --- CALLBACK: RECIBIR ÓRDENES DESDE LA WEB ---
void al_recibir_mensaje(char* topic, byte* payload, unsigned int length) {
  String mensaje = "";
  for (int i = 0; i < length; i++) {
    mensaje += (char)payload[i];
  }
  
  Serial.print("[MQTT Comando Recibido] -> ");
  Serial.println(mensaje);

  // --- LED A (Pin 25) ---
  if (mensaje == "A_AUTO") {
    modoManualA = false;
    digitalWrite(LED_ZONA_A, LOW); 
    Serial.println("LED A regresó a modo AUTOMÁTICO.");
  } 
  else if (mensaje == "A_ON") {
    modoManualA = true;
    estadoLED_A = true;
    digitalWrite(LED_ZONA_A, HIGH); 
    Serial.println("LED A en MANUAL: ENCENDIDO.");
  } 
  else if (mensaje == "A_OFF") {
    modoManualA = true;
    estadoLED_A = false;
    digitalWrite(LED_ZONA_A, LOW);  
    Serial.println("LED A en MANUAL: APAGADO.");
  }

  // --- LED B (Pin 26) ---
  else if (mensaje == "B_AUTO") {
    modoManualB = false;
    escribir_led_b(false); 
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
    String clientId = "ESP32Client-SmartLight-";
    clientId += String(random(0, 0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println("¡Conectado al Broker!");
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
  client.loop(); 

  unsigned long ahora = millis();

  // --- 1. LECTURA DE SENSORES CRÍTICOS (Constantemente para no perder presencia) ---
  // Lanzar pulso de ultrasonido
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duracion = pulseIn(ECHO_PIN, HIGH);
  float distancia = (duracion / 2.0) / 29.1;
  
  int estadoOscuridad = digitalRead(LDRPIN);
  if (distancia > 400 || distancia < 2) distancia = 0.0;

  bool deteccionPresencia = (distancia >= 2 && distancia <= 30);

  // --- 2. MAQUINA DE ESTADOS / LOGICA DE TEMPORIZACIÓN ---
  bool mantenerLucesPrendidas = false;

  if (estadoOscuridad == HIGH && deteccionPresencia) {
    // Si hay presencia y está oscuro, encendemos de inmediato y renovamos la marca de tiempo
    mantenerLucesPrendidas = true;
    tiempoUltimaPresencia = ahora; 
    banderaLucesAutoEncendidas = true;
  } 
  else if (banderaLucesAutoEncendidas) {
    // Si ya no se detecta presencia pero las luces estaban encendidas, verificamos el tiempo de gracia
    if (ahora - tiempoUltimaPresencia < TIEMPO_ESPERA_APAGADO) {
      mantenerLucesPrendidas = true; // Sigue dentro de los 5 segundos de gracia
    } else {
      banderaLucesAutoEncendidas = false; // Se acabó el tiempo
    }
  }

  // --- 3. APLICAR ESTADOS DE HARDWARE A LOS LEDS ---

  // CONTROL LED A (Pin 25)
  if (modoManualA) {
    digitalWrite(LED_ZONA_A, estadoLED_A ? HIGH : LOW);
  } else {
    digitalWrite(LED_ZONA_A, mantenerLucesPrendidas ? HIGH : LOW);
  }

  // CONTROL LED B (Pin 26)
  if (modoManualB) {
    escribir_led_b(estadoLED_B);
  } else {
    escribir_led_b(mantenerLucesPrendidas);
  }

  // --- 4. ENVÍO PERIÓDICO DE TELEMETRÍA (Cada 2 segundos) ---
  if (ahora - ultimoMensaje > 2000) {
    ultimoMensaje = ahora;

    float humedad = dht.readHumidity();
    float temperatura = dht.readTemperature();

    if (isnan(humedad)) humedad = 0.0;
    if (isnan(temperatura)) temperatura = 0.0;

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