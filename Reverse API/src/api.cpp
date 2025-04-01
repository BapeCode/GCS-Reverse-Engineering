#include "main.h"
#define SSID "Forest Nova"
#define PASSWORD "forestforest1"


void SetupWiFi() {
  Serial.println("📡 Connexion au Wi-Fi...");
  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(100);
    Serial.print(".");
  }
  Serial.println("\n✅ Connexion WiFi établie !");
  Serial.println("Adresse IP : " + WiFi.localIP().toString());
}

bool ConnectToApi() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi déconnecté !");
        return false;
    }

    Serial.println("\n=== Test de connexion API ===");
    Serial.println("ℹ️ - Adresse IP de l'ESP32 : " + WiFi.localIP().toString());
    
    HTTPClient http;
    // Utilisation de l'adresse IP de votre ordinateur
    http.begin("http://192.168.5.185:3000/api/users/roles");
    http.addHeader("Content-Type", "application/json");

    Serial.println("✉️ - Envoi de la requête GET...");
    int httpResponseCode = http.GET();
    
    if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.println("✅ - Réponse reçue ! Code HTTP : " + String(httpResponseCode));
        http.end();
        return true;
    } else {
        Serial.println("❌ - Erreur serveur !");
        Serial.println("Code HTTP : " + String(httpResponseCode));
        Serial.println("Erreur : " + http.errorToString(httpResponseCode));
        http.end();
        return false;
    }
}