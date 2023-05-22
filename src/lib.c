#include <errno.h>

#include "lib.h"

int get_data(struct gpiod_line *line, uint8_t data[5], int16_t *h, int16_t *t)
{
  int ret = 0;
  OUTPUT_MODE(line);
  TRY(ret)
  {
    perror("Request line as output failed");
    RELEASE_LINE(line);
    return ret;
  }

  WRITE(LOW);
  TRY(ret)
  {
    perror("Err");
    return ret;
  }
  msleep(18);

  RELEASE_LINE(line);
  INPUT_MODE(line);
  TRY(ret)
  {
    perror("Request line as input failed");
    RELEASE_LINE(line);
    return ret;
  }

  int value, high_time;
  int last_value = -1;
  int state = -1;
  int low_irq_count = 0;
  int irq_count = 0;
  int count = 0;
  clock_t start = clock();
  data[0] = data[1] = data[2] = data[3] = data[4] = 0;

  for (int i = 0; i < 1000; i++)
  {
    READ();
    if (last_value != value)
    {
      state = value;
      last_value = value;

      if (state == GPIOD_LINE_EVENT_RISING_EDGE)
      {
        MARK_TIME
      }
      else
      {
        high_time = MEASURE_TIME;
        if (high_time > 10)
        {
          if (low_irq_count >= 2 && low_irq_count <= 42)
          {
            data[count >> 3] <<= 1;
            data[count >> 3] |= high_time > 50;
            count++;
          }
          low_irq_count++;
        }
      }
      if (++irq_count >= 86)
      {
        break;
      }
    }
  }
  RELEASE_LINE(line);

  if (count != 40)
  {
    return 0;
  }
  ret = data[4] == ((data[0] + data[1] + data[2] + data[3]) & 0xff);
  if (ret < 0)
  {
    return 0;
  }
  int16_t raw_humidity = (data[0] << 8 | data[1]);
  int16_t raw_temperature = (data[2] << 8 | data[3]);
  if (0b1000000 == (data[2] & 0b1000000))
    raw_temperature = -(raw_temperature & 0x7ffff);

  *h = raw_humidity;
  *t = raw_temperature;
  return ret;
}

int usleep(long usec)
{
  struct timespec ts;
  if (usec < 0)
  {
    errno = EINVAL;
    return -1;
  }

  ts.tv_sec = usec / 1000000;
  ts.tv_nsec = (usec % 1000000) * 1000;

  int res;
  do
  {
    res = nanosleep(&ts, &ts);
  } while (res && errno == EINTR);

  return res;
}

int msleep(long msec)
{
  return usleep(msec * 1000l);
}