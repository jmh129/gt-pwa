let db;

// This creates the request for a db named budget.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  //    auto increments the object store pending.
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  //   This checks if the app is online
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
  //   Creates txn to pending db with readwrite access.
  const transaction = db.transaction(["pending"], "readwrite");

  //   accessing pending
  const store = transaction.objectStore("pending");

  //   adds record
  store.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction(
            ["pending"],
            "readwrite"
          );

          const store = transaction.objectStore("pending");

          // clears all items in store
          store.clear();
        });
    }
  };
}

window.addEventListener("online", checkDatabase);
