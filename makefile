CC = gcc
CFLAGS = -Werror -Wall -g
LIBS = -lws2_32 -lwsock32 -lwininet

all: http_server run clean

http_server:
	$(CC) http_server.c $(CFLAGS) -o $@ $(LIBS)

run:
	./http_server.exe

clean:
	del /f ./http_server.exe