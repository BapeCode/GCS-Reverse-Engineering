#ifndef API_H
#define API_H
#include <HTTPClient.h>
#include <WiFi.h>
#include <MFRC522.h>

#define LED_GREEN 21
#define LED_RED   7

bool ConnectToApi();
void SetupWiFi();

void SetupRFID();
void ReadBadge();


#endif 