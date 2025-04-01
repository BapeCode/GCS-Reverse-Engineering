#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include "main.h"


void setup() {
  // Initialisation de la communication série
  Serial.begin(115200);
  delay(3000);
  
  Serial.println("\n\n");
  Serial.println("✅ Démarrage du programme...");

  // Configuration des LEDs
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);

  // Configuration du WiFi
  SetupWiFi();

  // Test de connexion à l'API
  if (!ConnectToApi()) {
    Serial.println("❌ Impossible de se connecter à l'API !");
    digitalWrite(LED_RED, HIGH);
    delay(3000);
    digitalWrite(LED_RED, LOW);
    return;
  } else {
    Serial.println("✅ Connexion à l'API réussie !");
    digitalWrite(LED_GREEN, HIGH);
    delay(3000);
    digitalWrite(LED_GREEN, LOW);
  }

  // Configuration du RFID MFRC522
  SetupRFID();
}

void loop() {
  ReadBadge();
}
