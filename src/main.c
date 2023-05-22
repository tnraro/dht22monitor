#include <stdio.h>
#include <gpiod.h>
#include <errno.h>
#include <stdint.h>

#include "lib.h"
#include "save.h"

int main(void)
{
  char *chipname = "gpiochip1";
  unsigned int line_num = 12; // GPIO 364

  struct gpiod_chip *chip = gpiod_chip_open_by_name(chipname);
  TRY_P(chip)
  {
    perror("Open chip failed");
    goto end;
  }
  struct gpiod_line *line;

  line = gpiod_chip_get_line(chip, line_num);
  TRY_P(line)
  {
    perror("Get line failed");
    goto close_chip;
  }

  uint8_t data[5] = {0};
  int16_t h, t;
  while (get_data(line, data, &h, &t) == 0)
  {
    msleep(10);
  }

  printf("humidity:\t%d.%d%%\n", h / 10, h % 10);
  printf("temperature:\t%d.%d°C\n", t / 10, abs(t) % 10);

  save(h, t);

close_chip:
  gpiod_chip_close(chip);
end:
  return 0;
}