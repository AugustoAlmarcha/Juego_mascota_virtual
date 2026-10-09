extends Control

# Nodos de la Interfaz (UI) y de Red
@onready var status_label: Label = $VBoxContainer/StatusLabel
@onready var ping_button: Button = $VBoxContainer/PingButton
@onready var http_request: HTTPRequest = $HTTPRequest

# Dirección del Backend (Loopback TCP en puerto 3000)
const HEALTH_URL = "http://127.0.0.1:3000/api/health"

func _ready() -> void:
	http_request.request_completed.connect(_on_http_request_completed)
	ping_button.pressed.connect(_on_ping_button_pressed)
	enviar_ping()

func enviar_ping() -> void:
	status_label.text = "🟡 Conectando con http://127.0.0.1:3000/api/health..."
	ping_button.disabled = true
	
	var error = http_request.request(HEALTH_URL)
	if error != OK:
		status_label.text = "❌ Error al iniciar petición HTTP. Código: " + str(error)
		ping_button.disabled = false

func _on_http_request_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray) -> void:
	ping_button.disabled = false
	
	if response_code == 200:
		var json_string = body.get_string_from_utf8()
		var json = JSON.parse_string(json_string)
		
		if json and json.has("status") and json["status"] == "ok":
			var db_info = json.get("database", {})
			var db_status = "🟢 Conectada" if db_info.get("connected", false) else "🔴 Desconectada"
			var db_version = str(db_info.get("version", ""))
			
			status_label.text = "🟢 SISTEMA 100% ONLINE!\n\n" + \
				"• Backend: Fastify (Node.js)\n" + \
				"• Base de Datos: " + db_status + "\n" + \
				"  (" + db_version + ")\n" + \
				"• Uptime: " + str(json.get("uptimeSeconds", 0)) + " seg"
		else:
			status_label.text = "⚠️ Servidor respondió pero con estado degradado."
	else:
		status_label.text = "❌ Error de conexión (HTTP " + str(response_code) + ")"

func _on_ping_button_pressed() -> void:
	enviar_ping()
