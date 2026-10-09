extends Control

# Nodos de la Interfaz (UI) y de Red
@onready var status_label: Label = $VBoxContainer/StatusLabel
@onready var ping_button: Button = $VBoxContainer/PingButton
@onready var http_request: HTTPRequest = $HTTPRequest

# Dirección del Backend (Loopback TCP en puerto 3000)
# En Android físico se reemplazará por la IP de tu PC en la red Wi-Fi
const HEALTH_URL = "http://127.0.0.1:3000/api/health"

func _ready() -> void:
	# 1. CONEXIÓN DE SEÑALES (Observer Pattern en Redes/Juegos)
	# Cuando el socket HTTP termine de recibir los paquetes, dispara nuestra función
	http_request.request_completed.connect(_on_http_request_completed)
	
	# 2. Conectamos el botón para reintentar
	ping_button.pressed.connect(_on_ping_button_pressed)
	
	# 3. Disparamos la Bala Trazadora apenas carga el juego
	enviar_ping()

func enviar_ping() -> void:
	status_label.text = "🟡 Conectando con http://127.0.0.1:3000/api/health..."
	ping_button.disabled = true
	
	# HTTPRequest abre el socket TCP, realiza el handshake y envía HTTP GET
	var error = http_request.request(HEALTH_URL)
	if error != OK:
		status_label.text = "❌ Error al iniciar petición HTTP. Código: " + str(error)
		ping_button.disabled = false

func _on_http_request_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray) -> void:
	ping_button.disabled = false
	
	# Verificamos si hubo respuesta a nivel de protocolo HTTP (Capa 7)
	if response_code == 200:
		# Convertimos los bytes crudos recibidos por el socket TCP a texto UTF-8
		var json_string = body.get_string_from_utf8()
		var json = JSON.parse_string(json_string)
		
		if json and json.has("status") and json["status"] == "ok":
			status_label.text = "🟢 CONECTADO AL SERVIDOR!\n\n" + \
				"• Servicio: " + str(json.get("service", "Desconocido")) + "\n" + \
				"• Uptime: " + str(json.get("uptimeSeconds", 0)) + " seg\n" + \
				"• Timestamp: " + str(json.get("timestamp", ""))
		else:
			status_label.text = "⚠️ Servidor respondió pero el JSON no tiene el formato esperado."
	else:
		status_label.text = "❌ Error de conexión (HTTP " + str(response_code) + ")\n¿El servidor de Fastify está encendido?"

func _on_ping_button_pressed() -> void:
	enviar_ping()
