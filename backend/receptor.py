import serial
import json
import time

# Configura el puerto correcto donde está conectado tu ESP32
# Puedes ver cuál es en el Arduino IDE (Herramientas > Puerto)
PUERTO_SERIAL = 'COM5'  # <-- Cambia esto por tu puerto real
BAUDIOS = 115200

try:
    # Abrimos la conexión con el cable USB
    esp32 = serial.Serial(PUERTO_SERIAL, BAUDIOS, timeout=1)
    time.sleep(2) # Esperar a que se estabilice la conexión
    print(f"[SISTEMA] Escuchando con éxito al ESP32 en el {PUERTO_SERIAL}...")
    print("--------------------------------------------------")

    while True:
        if esp32.in_waiting > 0:
            # Leer la línea que mandó el ESP32 y decodificarla
            linea = esp32.readline().decode('utf-8').strip()
            
            try:
                # El "truco magico": Python convierte el texto directo a un objeto/diccionario nativo
                datos = json.loads(linea)
                
                # Ya puedes usar las variables de tus sensores directamente en Python:
                print(f"Lectura Recibida -> Temperatura: {datos['temp']}°C | Humedad: {datos['hum']}%")
                print(f"                  Distancia: {datos['dist']} cm | Oscuro: {bool(datos['oscuro'])}")
                print("--------------------------------------------------")
                
                # AQUÍ es donde más adelante meteremos la lógica para guardar en la base de datos
                
            except json.JSONDecodeError:
                # Ignora líneas incompletas que ocurren al conectar/desconectar el cable
                pass

except serial.SerialException:
    print(f"[ERROR] No se pudo abrir el puerto {PUERTO_SERIAL}. ¿Está el Monitor Serie de Arduino abierto?")
except KeyboardInterrupt:
    print("\n[SISTEMA] Monitoreo detenido por el usuario.")
finally:
    if 'esp32' in locals() and esp32.is_open:
        esp32.close()
        print("[SISTEMA] Puerto Serial cerrado.")