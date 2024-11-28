#include <stdlib.h>
#include "http_server.h"

int main(void) {
    if (initializeWinsock() == EXIT_FAILURE) return EXIT_FAILURE;

    SOCKET serverSocket;
    if (createServerSocket(&serverSocket) == EXIT_FAILURE) return EXIT_FAILURE;

    struct sockaddr_in serverAddress = {.sin_family = AF_INET, .sin_addr.s_addr = INADDR_ANY, .sin_port = htons(PORT)};
    if (bindSocketToPort(serverSocket, serverAddress) == EXIT_FAILURE) return EXIT_FAILURE;

    if (startListening(serverSocket) == EXIT_FAILURE) return EXIT_FAILURE;

    acceptAndHandleRequest(serverSocket);

    closesocket(serverSocket);
    WSACleanup();
    return EXIT_SUCCESS;
}