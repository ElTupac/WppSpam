window.onload = () => {
    let URL = window.location.href//.split(window.location.pathname)[0];
    console.log(URL);
    URL = URL.replace(/https?/, "wss");
    console.log(URL);
    let socket = new WebSocket(URL);
    socket.onopen = e => {
        console.log("Conectado");
    };
    socket.onmessage = e => {
        console.log(e.data);
    };
}