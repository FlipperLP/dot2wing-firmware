import rpio from 'rpio';

rpio.open(16, rpio.OUTPUT, rpio.LOW);

function test() {
  for (let i = 0; i < 6000; i++) {
    /* On for 1 second */
    rpio.write(16, 1);
    rpio.msleep(10);
    /* Off for half a second (500ms) */
    rpio.write(16, 0);
    rpio.msleep(10);
  }
}

test();
