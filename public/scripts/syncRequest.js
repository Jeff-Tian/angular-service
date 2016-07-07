self.onmessage = function (event) {
    if (event.data === "POST") {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "./app.js", false);  // synchronous request
        xhr.send(null);
        self.postMessage(xhr.responseText);
    }
};