#include "http_server.h"

#include <stdio.h>
#include <string.h>
#include <wininet.h>

int initializeWinsock(void) {
    struct WSAData wsaData;
    WORD DLLVersion = MAKEWORD(2, 2);
    if (WSAStartup(DLLVersion, &wsaData)) {
        int error = WSAGetLastError();
        printf("Error: %d", error);
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}

int createServerSocket(SOCKET* serverSocket) {
    *serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (*serverSocket == INVALID_SOCKET) {
        perror("Creating server socket failed");
        WSACleanup();
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}

int bindSocketToPort(SOCKET serverSocket, struct sockaddr_in serverAddress) {
    if (bind(serverSocket, (struct sockaddr *)&serverAddress, sizeof(serverAddress)) == SOCKET_ERROR) {
        perror("Binding failed");
        closesocket(serverSocket);
        WSACleanup();
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}

int startListening(SOCKET serverSocket) {
    if (listen(serverSocket, BACKLOG) == SOCKET_ERROR) {
        perror("Listening failed");
        closesocket(serverSocket);
        WSACleanup();
        return EXIT_FAILURE;
    }
    printf("Server is working on port %d...\n", PORT);
    return EXIT_SUCCESS;
}

void acceptAndHandleRequest(SOCKET serverSocket) {
    SOCKET clientSocket;
    struct sockaddr_in clientAddress;
    int clientAddressLength = sizeof(clientAddress);
    while (1) {
        clientSocket = accept(serverSocket, (struct sockaddr *)&clientAddress, &clientAddressLength);
        if (clientSocket == INVALID_SOCKET) {
            perror("Accepting failed");
            continue;
        }
        handleRequest(clientSocket);
    }
}

void handleRequest(SOCKET clientSocket) {
    char buffer[1024];
    int bytesRead;

    // Читання запиту від клієнта
    bytesRead = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);
    if (bytesRead <= 0) {
        closesocket(clientSocket);
        return;
    }
    buffer[bytesRead] = '\0';

    // Перевірка, чи запит на головну сторінку
    if (strstr(buffer, "GET /message HTTP/1.1") != NULL) {
        const char *backend_message = getBackendMessage();
        const char *escaped_message = escapeJsonString(backend_message);

        char response[2048];
        snprintf(response, sizeof(response),
                 "HTTP/1.1 200 OK\r\n"
                 "Content-Type: application/json; charset=utf-8\r\n"
                 "Access-Control-Allow-Origin: *\r\n"
                 "\r\n"
                 "{\"message\": \"%s\"}",
                 escaped_message);
        send(clientSocket, response, strlen(response), 0);

        closesocket(clientSocket);
        return;
    }

    closesocket(clientSocket);
}

const char* escapeJsonString(const char* input) {
    static char escaped[2048];
    int j = 0;
    for (int i = 0; input[i] != '\0'; i++) {
        switch (input[i]) {
            case '\"':
                escaped[j++] = '\\';
                escaped[j++] = '\"';
                break;
            case '\\':
                escaped[j++] = '\\';
                escaped[j++] = '\\';
                break;
            case '\b':
                escaped[j++] = '\\';
                escaped[j++] = 'b';
                break;
            case '\f':
                escaped[j++] = '\\';
                escaped[j++] = 'f';
                break;
            case '\n':
                escaped[j++] = '\\';
                escaped[j++] = 'n';
                break;
            case '\r':
                escaped[j++] = '\\';
                escaped[j++] = 'r';
                break;
            case '\t':
                escaped[j++] = '\\';
                escaped[j++] = 't';
                break;
            default:
                escaped[j++] = input[i];
                break;
        }
    }
    escaped[j] = '\0';
    return escaped;
}

const char* sanitizeJsonString(const char* input) {
    static char cleaned_input[MAX_JSON_LENGTH];
    int j = 0;
    for (int i = 0; input[i] != '\0'; i++) {
        if (input[i] < 32 && input[i] != '\n' && input[i] != '\r' && input[i] != '\t') {
            cleaned_input[j++] = ' ';
        } else {
            cleaned_input[j++] = input[i];
        }
    }
    cleaned_input[j] = '\0';
    return cleaned_input;
}

const char* getBackendMessage(void) {
    HINTERNET hInternet, hConnect;
    DWORD bytesRead;
    static char buffer[1024];

    hInternet = InternetOpen("HTTP Client", INTERNET_OPEN_TYPE_DIRECT, NULL, NULL, 0);
    if (hInternet == NULL) {
        return "{\"message\": \"Не вдалося підключитися до інтернету.\"}";
    }

    hConnect = InternetOpenUrl(hInternet, BACKEND_URL, NULL, 0, INTERNET_FLAG_RELOAD, 0);
    if (hConnect == NULL) {
        InternetCloseHandle(hInternet);
        return "{\"message\": \"Не вдалося отримати дані з бекенду.\"}";
    }

    if (InternetReadFile(hConnect, buffer, sizeof(buffer) - 1, &bytesRead) == FALSE) {
        InternetCloseHandle(hConnect);
        InternetCloseHandle(hInternet);
        return "{\"message\": \"Помилка при зчитуванні відповіді.\"}";
    }

    buffer[bytesRead] = '\0'; // Null terminate the buffer

    // Sanitize the message before returning it
    return sanitizeJsonString(buffer);
}