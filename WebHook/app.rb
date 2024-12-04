require 'sinatra'
require 'json'

# Token secreto para validar solicitudes
SECRET_TOKEN = "my_secret_token"

# Lista en memoria para almacenar usuarios
$users = []

# Ruta para recibir datos del WebHook
post '/webhook' do
  # Validar el token secreto
  token = request.env['HTTP_X_SECRET_TOKEN']
  halt 401, { message: 'Unauthorized' }.to_json unless token == SECRET_TOKEN

  # Parsear el cuerpo de la solicitud como JSON
  payload = JSON.parse(request.body.read)

  # Verificar el tipo de evento y manejarlo
  case payload["event"]
  when "user.created"
    handle_user_created(payload)
  when "user.updated"
    handle_user_updated(payload)
  when "user.deleted"
    handle_user_deleted(payload)
  else
    halt 400, { message: 'Unsupported event type' }.to_json
  end

  # Respuesta al cliente
  content_type :json
  { message: 'Webhook recibido con éxito', data: payload }.to_json
end

# Ruta de prueba
get '/' do
  'Servidor WebHook está funcionando'
end

# Ruta para obtener todos los usuarios
get '/users' do
  content_type :json
  $users.to_json
end

# Métodos para manejar eventos
def handle_user_created(payload)
  user = payload["user"]
  $users << user unless $users.any? { |u| u["id"] == user["id"] }
  log_event("Usuario creado: #{user}")
end

def handle_user_updated(payload)
  user = $users.find { |u| u["id"] == payload["user"]["id"] }
  if user
    user["name"] = payload["user"]["name"] if payload["user"]["name"]
    log_event("Usuario actualizado: #{user}")
  else
    log_event("Usuario no encontrado para actualizar: #{payload["user"]}")
  end
end

def handle_user_deleted(payload)
  user = $users.find { |u| u["id"] == payload["user"]["id"] }
  if user
    $users.reject! { |u| u["id"] == user["id"] }
    log_event("Usuario eliminado: #{user}")
  else
    log_event("Usuario no encontrado para eliminar: #{payload["user"]}")
  end
end

# Método para registrar eventos en un archivo
def log_event(message)
  File.open("events.log", "a") do |file|
    file.puts("#{Time.now}: #{message}")
  end
end