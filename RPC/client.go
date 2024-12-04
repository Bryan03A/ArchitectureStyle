package main

import (
	"fmt"
	"net"
	"net/rpc"
)

// Args define los argumentos para la operación
type Args struct {
	A, B int
}

// Arith es el servicio RPC que expone el método Add
type Arith struct{}

// Método para sumar dos números
func (a *Arith) Add(args *Args, reply *int) error {
	*reply = args.A + args.B
	return nil
}

func main() {
	// Registrar el servicio RPC
	arith := new(Arith)
	err := rpc.Register(arith)
	if err != nil {
		fmt.Println("Error al registrar el servicio RPC:", err)
		return
	}

	// Escuchar en el puerto 1234
	listener, err := net.Listen("tcp", ":1234")
	if err != nil {
		fmt.Println("Error al iniciar el servidor RPC:", err)
		return
	}
	fmt.Println("Servidor RPC binario escuchando en el puerto 1234...")
	rpc.Accept(listener)
}
