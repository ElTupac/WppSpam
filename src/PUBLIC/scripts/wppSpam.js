let socket;
window.onload = () => {
    let URL = window.location.href;//"https://wpp-spam.herokuapp.com/";
    console.log(URL);
    URL = URL.replace(/https?/, "wss");
    console.log(URL);
    socket = new WebSocket(URL);
    socket.onopen = e => {
        console.log("Conectado");
    };
    let qrcode;
    let once = false;
    socket.onmessage = e => {
        const { connected, qr } = JSON.parse(e.data);
        if(connected){
            document.getElementById("connect").style.display = "none";
            document.getElementById("auto-mess").style.display = "block";
            document.getElementById("send-mess").addEventListener('submit', checkAndSend);
        }else{
            if(once) qrcode.makeCode(e.data);
            else {
                once = true;
                qrcode = new QRCode("qrcode", {
                    text: qr,
                    width: 256,
                    height: 256,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });
            }
        }
    };
}

function checkAndSend(event){
    event.preventDefault();
    const phoneNumber = document.getElementById("celphone1").value +
        document.getElementById("celphone2").value +
        document.getElementById("celphone3").value;
    const howMany = document.getElementById("quant-mess").value;
    const interval = document.getElementById("time-mess").value;
    const message = document.getElementById("message").value;
    socket.send(JSON.stringify({
        message:{
            phoneNumber,
            howMany,
            interval,
            text: message
        }
    }));
    document.getElementById("auto-mess").style.display = "none";
    document.write("Listo! Se fue spameado! Espera a que se manden los mensajes para enviar otro spam");
}
