import rpio from 'rpio';

rpio.open(16, rpio.OUTPUT, rpio.LOW);

for (let i = 0; i < 5; i++) {
  /* On for 1 second */
  rpio.write(16, rpio.HIGH);
  rpio.msleep(10);

  /* Off for half a second (500ms) */
  rpio.write(16, rpio.LOW);
  rpio.msleep(10);
}
