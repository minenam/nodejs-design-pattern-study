console.log("1️⃣ start");

setTimeout(() => {
  console.log("2️⃣ first timeout start");

  setTimeout(() => {
    console.log("3️⃣ second timeout");
  }, 0);

  console.log("4️⃣ first timeout end");
}, 0);

console.log("5️⃣ end");
