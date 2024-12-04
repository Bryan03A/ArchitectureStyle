package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/rpc"
)

// Args define los argumentos para la operación
type Args struct {
	A, B int
}

// Arith es la estructura que expone métodos como RPC
type Arith struct{}

// Add es un método que suma dos números
func (a *Arith) Add(args *Args, reply *int) error {
	*reply = args.A + args.B
	return nil
}

func main() {
	// Registrar la estructura Arith como un servicio RPC
	arith := new(Arith)
	err := rpc.Register(arith)
	if err != nil {
		fmt.Println("Error al registrar el servicio RPC:", err)
		return
	}

	http.HandleFunc("/rpc", func(w http.ResponseWriter, r *http.Request) {
		// Asegurarse de que sea un POST
		if r.Method != "POST" {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		// Leer el cuerpo de la solicitud
		var request map[string]interface{}
		decoder := json.NewDecoder(r.Body)
		err := decoder.Decode(&request)
		if err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		// Obtener el nombre del método
		method := request["method"].(string)

		// Obtener los parámetros (deberían ser un array de un único mapa)
		params := request["params"].([]interface{})
		if len(params) < 1 {
			http.Error(w, "Missing parameters", http.StatusBadRequest)
			return
		}

		// Convertir el primer parámetro a un mapa
		paramMap := params[0].(map[string]interface{})
		a, ok := paramMap["A"].(float64)
		if !ok {
			http.Error(w, "Invalid A parameter", http.StatusBadRequest)
			return
		}

		b, ok := paramMap["B"].(float64)
		if !ok {
			http.Error(w, "Invalid B parameter", http.StatusBadRequest)
			return
		}

		// Llamamos al servicio RPC con los parámetros A y B
		args := Args{
			A: int(a),
			B: int(b),
		}

		// Llamamos al servicio RPC
		client, err := rpc.Dial("tcp", "localhost:1234")
		if err != nil {
			http.Error(w, "Failed to connect to RPC server", http.StatusInternalServerError)
			return
		}
		defer client.Close()

		// Definir un resultado para almacenar la respuesta
		var result int
		call := client.Go(method, &args, &result, nil)
		<-call.Done // Esperar la respuesta

		// Enviar la respuesta JSON
		response := map[string]interface{}{
			"id":     request["id"],
			"result": result,
			"error":  nil,
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})

	// Ejecutar el servidor HTTP JSON-RPC en el puerto 8080
	fmt.Println("Servidor HTTP JSON-RPC escuchando en el puerto 8080...")
	err = http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Error al iniciar el servidor HTTP:", err)
		return
	}
}
