package main

import (
	"fmt"
	"log"

	"github.com/d2r2/go-dht"
)

func main() {
	temperature, humidity, retried, err := dht.ReadDHTxxWithRetry(dht.DHT22, 4, false, 10)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Temp: %v*C, Humi: %v%% (retried %d times)\n", temperature, humidity, retried)
}
