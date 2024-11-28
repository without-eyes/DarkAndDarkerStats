#ifndef HTTPSERVER_H
#define HTTPSERVER_H

#include <winsock2.h>

#define MAX_JSON_LENGTH 1024

#define PORT 8080
#define BACKLOG 5
#define BACKEND_URL "http://localhost:5000/message"

int initializeWinsock(void);

int createServerSocket(SOCKET* serverSocket);

int bindSocketToPort(SOCKET serverSocket, struct sockaddr_in serverAddress);

int startListening(SOCKET serverSocket);

_Noreturn void acceptAndHandleRequest(SOCKET serverSocket);

void handleRequest(SOCKET clientSocket);

const char* escapeJsonString(const char* input);

const char* sanitizeJsonString(const char* input);

const char* getBackendMessage(void);

#endif