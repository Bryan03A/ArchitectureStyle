from flask import Flask, jsonify, request

app = Flask(__name__)

# Base de datos simulada
users = [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"},
    {"id": 3, "name": "Charlie"}
]

# GET: Obtener lista de usuarios
@app.route('/users', methods=['GET'])
def get_users():
    return jsonify(users)

# POST: Agregar un nuevo usuario
@app.route('/users', methods=['POST'])
def add_user():
    new_user = request.get_json()
    if not new_user or "name" not in new_user:
        return jsonify({"error": "Invalid user data"}), 400

    new_user["id"] = users[-1]["id"] + 1 if users else 1
    users.append(new_user)
    return jsonify(new_user), 201

# PUT: Actualizar un usuario existente
@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        return jsonify({"error": "User not found"}), 404

    updated_data = request.get_json()
    user.update(updated_data)
    return jsonify(user)

# DELETE: Eliminar un usuario
@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    global users
    users = [u for u in users if u["id"] != user_id]
    return jsonify({"message": "User deleted"}), 200

# Punto de entrada principal
if __name__ == '__main__':
    app.run(debug=True)