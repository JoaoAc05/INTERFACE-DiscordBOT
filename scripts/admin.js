const btnSync = document.getElementById("btn-sync");
const resultsContainer = document.getElementById("results-container");

import { showPopup } from './popup.js';

btnSync.addEventListener("click", () => {
    btnSync.disabled = true;
    btnSync.style.opacity = 0;
    resultsContainer.innerHTML = "<strong>O botão foi desativado para evitar que a sincronização duplique os comandos no Discord. Aguarde até ele voltar para tentar novamente.</strong>"
    btnSync.style.cursor = "default"
    
        setTimeout(() => {
            btnSync.disabled = false;
            btnSync.style.opacity = 1;
            resultsContainer.innerHTML = ""
            btnSync.style.cursor = "pointe"
        }, 60000);


    //https://painel-comandos.vercel.app/       URL VERCEL
    //http://localhost:3000/                    LOCAL
    fetch("https://painel-comandos.vercel.app/admin/update", {
        method: "PUT",
    })
    .then(response => {
        if (!response.ok) {
            console.log(response.statusText)
            throw new Error(`Erro ao sincronizar comandos: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        showPopup("Sincronização realizada com sucesso!", "success");
    })
    .catch(error => {
        if(error == "TypeError: Failed to fetch"){
            showPopup(`Verifique se o servidor da API está rodando.`, "alert")
            resultsContainer.innerHTML += `<br> <p>Verifique se o servidor da API está rodando e aguarde até o botão de sincronização aparecer para tentar novamente</p>`
            console.log("Aparentemente a API está fora, chama o João.")
            return;
        }
        showPopup("Erro interno: " + error.message, "error");
        resultsContainer.innerHTML += `<br>  <p>Erro:<br>${error.message}</p>`
        console.log(`Erro interno: ${error.message}`);
    });
});