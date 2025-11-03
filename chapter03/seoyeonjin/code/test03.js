console.log("1️⃣ start");

Promise.resolve().then(() => {
  console.log("2️⃣ first promise");

  Promise.resolve().then(() => console.log("3️⃣ second promise"));

  console.log("5️⃣ first end ");
});

console.log("4️⃣ end");
