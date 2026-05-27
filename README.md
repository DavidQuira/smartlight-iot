# SmartLight IOT

Sistema inteligente de iluminación y monitoreo ambiental utilizando tecnologías IoT

# Funciones

- Encender y apagar luces remotamente
- Activar modo automático
- Monitorear temperatura y humedad
- Detectar oscuridad
- Medir distancia
- Visualizar información en tiempo real desde un dashboard web
- Almacenar datos históricos en InfluxDB Cloud
- Visualizar métricas mediante Grafana

# Tecnologías Utilizadas

Frontend
- React
- Vite
- TailwindCSS
- Axios

Backend
- FastAPI
- Python

Comunicación
- MQTT
- HiveMQ

Hardware
- ESP32
- Sensores
- LEDs

Base de Datos
- InfluxDB Cloud

Visualización
- Grafana

# Instalación y Ejecucion
Luego de clonar el repositorio, abrirlo en VS code, y abrir la terminal y hacer lo siguiente:

* Entrar a la carpeta backend

cd backend

# Instalar dependencias

python -m pip install fastapi uvicorn paho-mqtt influxdb-client


# Ejecutar servidor FastAPI

python -m uvicorn main:app --reload


# El backend debe mostrar:

http://127.0.0.1:8000


* Entrar a la carpeta frontend

cd frontend

# Instalar dependencias

npm install

# Ejecutar proyecto React

npm run dev

El frontend debe correr en:

http://localhost:5173


# Hecho por

- David Ramirez
- Esteban Marta
- Erik Dussan
- Angel Ricaurte
