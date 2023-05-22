.PHONY = all clean

all: dht

dht: main.o lib.o save.o
	clang -o dht -Ofast -W -Wall main.o lib.o save.o -lgpiod

main.o: main.c lib.h save.h
	clang -Ofast -W -Wall -c main.c

lib.o: lib.c lib.h
	clang -Ofast -W -Wall -c lib.c

save.o: save.c save.h
	clang -Ofast -W -Wall -c save.c

clean:
	rm *.o