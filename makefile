CC = gcc
CFLAGS = -Werror -Wall -g
LIBS = -lws2_32 -lwsock32 -lwininet

SRCDIR = ./src/httpserver/

SOURCE = 	$(wildcard ${SRCDIR}*.c)

all: http_server run clean

http_server:
	$(CC) $(SOURCE) $(CFLAGS) -o $@ $(LIBS)

run:
	./http_server.exe

clean:
	del /f ./http_server.exe