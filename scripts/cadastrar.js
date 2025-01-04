import { showPopup } from './popup.js';

document.addEventListener("DOMContentLoaded", () => {

    const commandForm = document.getElementById("commandForm");

    commandForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const description = document.getElementById("description").value;
        const execute = document.getElementById("execute").value;
        const execute2 = document.getElementById("execute2").value;
        const execute3 = document.getElementById("execute3").value;

        if (!name || !description || !execute) {
            showPopup("Preencha todos os campos obrigatórios!", "alert");
            return;
        }

        if (execute3 && !execute2) {
            showPopup("Preencha 'Execute2' antes de 'Execute3'.", "alert");
            return;
        }

        const commandData = {
            data: {
                name: name,
                description: description,  
            },   
            execute: execute,
            execute2: execute2,
            execute3: execute3
        };

        fetch("https://painel-comandos.vercel.app/comandos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(commandData),
        })
        .then(response => {
            if (!response.ok) {
                console.log(`Erro ${response.status}: ${response.statusText}`); // Log detalhada com o res da API
                throw new Error(`Erro ${response.status}: ${response.statusText}`); // Captura o erro e envia para o catch
            }
            return response.json();
        })
        .then(data => {
            showPopup("Cadastro realizada com sucesso!", "success");
            commandForm.reset(); // Limpa os campos do formulário
            console.log(`Comando cadastrado enviado para API: ${JSON.stringify(commandData)}`);
        })
        .catch(error => {
            if(error == "TypeError: Failed to fetch"){
                showPopup(`Verifique se o servidor da API está rodando.`, "alert")
                console.log("Aparentemente a API está fora, chama o João.")
                return;
            }
            showPopup("Erro interno: " + error.message, "error");
            console.log(`Erro interno: ${error.message}`);
        });
    });
});
