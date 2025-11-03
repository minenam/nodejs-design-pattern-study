console.log("start"); // 1

setTimeout(() => console.log("setTimeout"), 0); // 5 or 6
setImmediate(() => console.log("setImmediate")); // 5 or 6
process.nextTick(() => console.log("nextTick")); // 3
Promise.resolve().then(() => console.log("promise")); // 4

console.log("end"); // 2
