#include "main.h"
#define SDA_PIN  6   // SS (SDA)
#define RST_PIN  5   // RST
MFRC522 mfrc522(SDA_PIN, RST_PIN);

void SetupRFID() {
    Serial.println("📡 Configuration du lecteur RFID...");
    SPI.begin();
    mfrc522.PCD_Init();
    if (!mfrc522.PCD_PerformSelfTest()) {
        Serial.println("❌ - ERREUR : Le module RFID ne répond pas !");
        while (true);
    }
    Serial.println("✅ - Module RFID détecté !");
    Serial.println("🛰️ - Lecteur RFID initialisé !");
}

void SendBadgeToAPI(String uid) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("❌ - ERREUR : Pas de connexion WiFi !");
        return;
    }

    Serial.println("✉️ - Envoi du badge à l'API...");
    Serial.println("ℹ️ - Adresse IP de l'ESP32 : " + WiFi.localIP().toString());

    HTTPClient http;
    http.begin("http://192.168.5.185:3000/api/badges/pending");
    http.addHeader("Content-Type", "application/json");
    String httpRequestData = "{\"uuid\":\"" + uid + "\"}";

    Serial.println("✉️ - Envoi de la requête POST...");
    int httpResponseCode = http.POST(httpRequestData);

    if (httpResponseCode == 200) {
        String response = http.getString();
        Serial.println("✅ - Requête POST réussie !");
        Serial.println("📧 - Réponse : " + response);
    } else if (httpResponseCode == 201) {
        String response = http.getString();
        Serial.println("✅ - Requête POST réussie !");
        Serial.println("📧 - Réponse : " + response);
        digitalWrite(LED_RED, LOW);
        digitalWrite(LED_GREEN, HIGH);
        delay(2000);
        digitalWrite(LED_GREEN, LOW);
    } else if (httpResponseCode == 403) {
        String response = http.getString();
        Serial.println("❌ - Requête POST refusée !");
        Serial.println("📧 - Réponse : " + response);
        digitalWrite(LED_RED, HIGH);
        digitalWrite(LED_GREEN, LOW);
        delay(2000);
        digitalWrite(LED_RED, LOW);
    } else {
        Serial.println("❌ - Erreur serveur !");
        Serial.println("Code HTTP : " + String(httpResponseCode));
        Serial.println("Erreur : " + http.errorToString(httpResponseCode));
        digitalWrite(LED_RED, HIGH);
        digitalWrite(LED_GREEN, LOW);
        delay(2000);
        digitalWrite(LED_RED, LOW);
    }
}

void ReadBadge() {
    if (!mfrc522.PICC_IsNewCardPresent()) return;
    if (!mfrc522.PICC_ReadCardSerial()) return;

    Serial.println("✅ Lecture badge réussie !");
    String uidString = "";

    Serial.print("Badge détecté : UID ");
    for (byte i = 0; i < mfrc522.uid.size; i++) {
        uidString += (mfrc522.uid.uidByte[i] < 0x10 ? "0" : "") + String(mfrc522.uid.uidByte[i], HEX);
    }
    uidString.toUpperCase();
    Serial.print(uidString);

    Serial.println();
    SendBadgeToAPI(uidString);

    delay(1000);
    if (!mfrc522.PICC_IsNewCardPresent()) {
        Serial.println("📭 Aucun badge détecté.");
        delay(100);
        return;
    }
    if (!mfrc522.PICC_ReadCardSerial()) {
        Serial.println("❌ Erreur de lecture badge.");
        delay(100);
        return ;
    }

    delay(100);
}