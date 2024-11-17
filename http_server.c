#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <winsock2.h>
#include <wininet.h>

#define PORT 8080
#define BACKLOG 5
#define INDEX_HTML "index.html"
#define BACKEND_URL "http://localhost:5000/message"  // URL до Flask бекенду

// Function to escape JSON string
const char* escape_json_string(const char* input) {
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

// Function to sanitize the response string
const char* sanitize_json_string(const char* input) {
    static char cleaned_input[1024];
    int j = 0;
    for (int i = 0; input[i] != '\0'; i++) {
        if (input[i] < 32 && input[i] != '\n' && input[i] != '\r' && input[i] != '\t') {
            cleaned_input[j++] = ' ';  // Replace invalid control characters with a space
        } else {
            cleaned_input[j++] = input[i];
        }
    }
    cleaned_input[j] = '\0';
    return cleaned_input;
}

// Use this function in the get_backend_message function
const char* get_backend_message() {
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
    return sanitize_json_string(buffer);
}

void handle_request(SOCKET client_socket) {
    char buffer[1024];
    int bytes_read;

    // Читання запиту від клієнта
    bytes_read = recv(client_socket, buffer, sizeof(buffer) - 1, 0);
    if (bytes_read <= 0) {
        closesocket(client_socket);
        return;
    }
    buffer[bytes_read] = '\0';

    // Перевірка, чи запит на головну сторінку
    if (strstr(buffer, "GET /message HTTP/1.1") != NULL) {
        const char *backend_message = get_backend_message();
        const char *escaped_message = escape_json_string(backend_message);

        char response[2048];
        snprintf(response, sizeof(response),
                 "HTTP/1.1 200 OK\r\n"
                 "Content-Type: application/json; charset=utf-8\r\n"
                 "Access-Control-Allow-Origin: *\r\n"
                 "\r\n"
                 "{\"message\": \"%s\"}",
                 escaped_message);
        send(client_socket, response, strlen(response), 0);

        closesocket(client_socket);
        return;
    }

    closesocket(client_socket);
}

int main() {
    WSADATA wsaData;
    SOCKET server_socket, client_socket;
    struct sockaddr_in server_addr, client_addr;
    int client_len = sizeof(client_addr);

    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        perror("WSAStartup failed");
        return 1;
    }

    server_socket = socket(AF_INET, SOCK_STREAM, 0);
    if (server_socket == INVALID_SOCKET) {
        perror("socket failed");
        WSACleanup();
        return 1;
    }

    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(PORT);

    // Прив'язка сокету до порту
    if (bind(server_socket, (struct sockaddr *)&server_addr, sizeof(server_addr)) == SOCKET_ERROR) {
        perror("bind failed");
        closesocket(server_socket);
        WSACleanup();
        return 1;
    }

    if (listen(server_socket, BACKLOG) == SOCKET_ERROR) {
        perror("listen failed");
        closesocket(server_socket);
        WSACleanup();
        return 1;
    }

    printf("Сервер працює на порту %d...\n", PORT);

    while (1) {
        client_socket = accept(server_socket, (struct sockaddr *)&client_addr, &client_len);
        if (client_socket == INVALID_SOCKET) {
            perror("accept failed");
            continue;
        }

        handle_request(client_socket);
    }

    closesocket(server_socket);
    WSACleanup();
    return 0;
}
