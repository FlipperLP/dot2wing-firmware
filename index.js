const gpio = require("gpio");

const gpio4 = gpio.export(4, {
   direction: gpio.DIRECTION.IN,
   ready: function() { }
});

gpio4.on("change", val => {
    console.log(val)
 });