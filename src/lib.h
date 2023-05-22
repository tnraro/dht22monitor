#include <gpiod.h>
#include <time.h>
#include <stdint.h>

#define CLOCKS_PER_USEC ((__clock_t)1)

int get_data(struct gpiod_line *line, uint8_t data[5], int16_t *h, int16_t *t);

int usleep(long usec);
int msleep(long msec);

#define LOW (0)
#define HIGH (1)

#define WRITE(val) \
  ret = gpiod_line_set_value(line, val)

#define TRY(lhs) \
  if (lhs < 0)
#define TRY_P(lhs) \
  if (lhs == 0)

#define READ() \
  value = gpiod_line_get_value(line)

#ifndef CONSUMER
#define CONSUMER "DHT-22"
#endif

#define INPUT_MODE(line) \
  ret = gpiod_line_request_input(line, CONSUMER)

#define OUTPUT_MODE(line) \
  ret = gpiod_line_request_output(line, CONSUMER, 1)

#define RELEASE_LINE(line) \
  gpiod_line_release(line)

#define MARK_TIME start = clock();
#define MEASURE_TIME ((clock() - start) / CLOCKS_PER_USEC)