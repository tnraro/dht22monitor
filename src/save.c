#include <stdio.h>
#include <time.h>

#include "save.h"

void save(int16_t h, int16_t t) {
  uint32_t now = time(0);
  FILE *fp = fopen("./dist/dht.dat", "ab");

  fwrite(&now, 1, sizeof(uint32_t), fp);
  fwrite(&h, 1, sizeof(int16_t), fp);
  fwrite(&t, 1, sizeof(int16_t), fp);

  fclose(fp);
}