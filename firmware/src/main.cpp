#include <Arduino.h>
#include <DHT.h>

#define DHTPIN 14          
#define DHTTYPE DHT11
#define LDRPIN 27          
#define LED_PIN 25         
#define TRIG_PIN 5
#define ECHO_PIN 18

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(LED_PIN, OUTPUT);
  pinMode(LDRPIN, INPUT); 
  pinMode(TRIG_PIN, OUTPUT); 
  pinMode(ECHO_PIN, INPUT);  
}

void loop() {
  // 1. Medir Distancia
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duracion = pulseIn(ECHO_PIN, HIGH);
  float distancia = (duracion / 2.0) / 29.1;

  // 2. Leer ambiente
  float humedad = dht.readHumidity();
  float temperatura = dht.readTemperature();
  int estadoOscuridad = digitalRead(LDRPIN); 

  // Reemplazo de valores erróneos por 0 para no romper el JSON en Python
  if (isnan(humedad)) humedad = 0.0;
  if (isnan(temperatura)) temperatura = 0.0;
  if (distancia > 400 || distancia < 2) distancia = 0.0;

  // 3. Automatización local (El hardware responde solo)
  bool presencia = (distancia >= 2 && distancia <= 30);
  if (estadoOscuridad == HIGH && presencia) { 
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }

  // 4. PASO CLAVE: Enviar SOLO el JSON por el cable USB
  // Genera una sola línea como: {"temp":24.5,"hum":60.0,"oscuro":1,"dist":15.2}
  String json = "{\"temp\":" + String(temperatura, 1) + 
                ",\"hum\":" + String(humedad, 1) + 
                ",\"oscuro\":" + String(estadoOscuridad) + 
                ",\"dist\":" + String(distancia, 1) + "}";
  
  Serial.println(json); // Python leerá esto

  delay(1000); 
}