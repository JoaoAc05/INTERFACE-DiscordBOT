import { showPopup } from './popup.js';

document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        fetch("https://painel-comandos.vercel.app/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        })
        .then(response => {
            if (!response.ok) {
                if(response.status == 401) {
                    throw new Error("401")
                } else {
                    console.log(`Erro ${response.status}: ${response.statusText}`); // Log detalhada com o res da API
                    throw new Error(`Erro ${response.status}: ${response.statusText}`); // Captura o erro e envia para o catch
                }
            }
            return response.json();
        })
        .then(data => {
            showPopup("Bem vindo!", "success");
            setTimeout(() => {
                window.location.href = '/home.html';
            }, 3000);
        })
        .catch(error => {
            if(error == "TypeError: Failed to fetch"){
                showPopup(`Verifique se o servidor da API está rodando.`, "alert")
                console.log("Aparentemente a API está fora, chama o João.")
                return;
            }
            if(error.message == 401 || error.message == "401") {
                showPopup(`Usuario ou senha inválidos: ${busca}`, "error")
            } else {
                showPopup("Erro interno: " + error.message, "error");
                console.log(`Erro interno: ${error.message}`);
            }
        });
});