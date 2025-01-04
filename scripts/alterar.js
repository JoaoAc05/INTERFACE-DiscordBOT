import { showPopup } from './popup.js';

document.addEventListener("DOMContentLoaded", () => {
    const commandForm = document.getElementById("commandForm");

    const searchInput = document.getElementById("search-input")
    const searchBtn = document.getElementById("search-btn");
    const searchResults = document.getElementById("search-results");

    const idInput = document.getElementById("id");
    const nameInput = document.getElementById("name");
    const descriptionInput = document.getElementById("description")
    const executeInput = document.getElementById("execute");
    const execute2Input = document.getElementById("execute2");
    const execute3Input = document.getElementById("execute3");

    const modalBackdrop = document.querySelector(".modal-backdrop");
    const commandListModal = document.getElementById("command-list-modal");
    const closeModalBtn = document.querySelector(".close-btn");

    const qtdComands = document.getElementById("qtd-comands");

    searchBtn.addEventListener("click", () => {
        fetchCommands()
    });
    searchInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            fetchCommands();
        }
    });

    function fetchCommands(){
        const busca = document.getElementById("search-input").value.trim();
    
        if (!busca) {
            showPopup("Informe o nome para realizar a pesquisa.", "alert");
            return;
        }
        
        //     URL VERCEL (ROTA GetName)                +                  NOME PREENCHIDO NO INPUT
        fetch(`https://painel-comandos.vercel.app/comandos/getName/?name=${encodeURIComponent(busca)}`)
            .then(response => {
                if (!response.ok) {
                    if(response.status == 404) {
                        throw new Error("404")
                    }
                    throw new Error(`Erro ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                // Limpa os resultados anteriores
                searchResults.innerHTML = '<option value="">Selecione um comando</option>';
    
                // Verifica se existem comandos na estrutura esperada
                if (!data.comandos || !Array.isArray(data.comandos) || data.comandos.length === 0) {
                    showPopup("Nenhum comando encontrado.", "alert");
                    closeModal();
                    return;
                }
                
                qtdComands.innerHTML += `Quantidade de comandos encontrados: ${data.comandos.length}`

                // Adiciona os comandos encontrados ao select
                data.comandos.forEach(comando => {
                    let option = document.createElement("option");
                    option.value = comando.id;
                    option.textContent = comando.data.name;
                    option.descriptionContent = comando.data.description;
                    option.executeContent = comando.execute;
                    if(comando.execute2) {
                        option.execute2Content = comando.execute2;
                    }
                    if(comando.execute3) {
                        option.execute3Content = comando.execute3;
                    }
                    searchResults.appendChild(option);
                });
                openModal();
            })
            .catch(error => {
                if(error == "TypeError: Failed to fetch"){
                    showPopup(`Verifique se o servidor da API está rodando.`, "alert")
                    console.log("Aparentemente a API está fora, chama o João ou o Luan...")
                    return;
                }
                if(error.message == 404 || error.message == "404") {
                    showPopup(`Não foi encontrado resultados para: ${busca}`, "alert")
                } else {
                    showPopup("Erro ao buscar comandos: " + error.message, "error");
                    console.error("Erro ao buscar comandos:", error);
                }
            });
    
    }

    // Evento de mudança na seleção do select
    searchResults.addEventListener("change", (event) => {
        // Ao selecionar um comando, o seguinte código ira ser executado
        commandForm.style.display = "block"
        const selectedId = event.target.value;
        const selectedName = event.target.options[event.target.selectedIndex].textContent;
        const selectedDescription = event.target.options[event.target.selectedIndex].descriptionContent;
        const selectedExecute = event.target.options[event.target.selectedIndex].executeContent;
        const selectedExecute2 = event.target.options[event.target.selectedIndex].execute2Content;
        const selectedExecute3 = event.target.options[event.target.selectedIndex].execute3Content;

        commandForm.reset(); // Limpar o forms

        if (selectedId) { // Preencher os campos de acordo com o comando selecionado
            idInput.value = selectedId;
            nameInput.value = selectedName;
            descriptionInput.value = selectedDescription;
            executeInput.value = selectedExecute;
            if(selectedExecute2) {
                execute2Input.value = selectedExecute2
            }
            if(selectedExecute3){
                execute3Input.value = selectedExecute3
            }
            closeModal();
        }
    });
teste
    // Funções para abrir e fechar o modal
    function openModal() {
        commandListModal.classList.add("active");
        modalBackdrop.classList.add("active");
    }

    function closeModal() {
        commandListModal.classList.remove("active");
        modalBackdrop.classList.remove("active");
        searchResults.innerHTML = ""; // Limpa o select para futuras pesquisas
        qtdComands.innerHTML = "";
    }
    
    // Botão de fechamento do modal
    closeModalBtn.addEventListener("click", closeModal);
    modalBackdrop.addEventListener("click", closeModal);

    commandForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!idInput.value) {
            showPopup("Selecione um comando primeiro...", "alert");
            return;
        } 

        if(!descriptionInput.value || !executeInput.value) {
            showPopup("Campos de descrição e execute são obrigatórios.", "alert")
            return;
        }

        const comando = nameInput.value

        const confirmAlter = confirm(`Você tem certeza que deseja alterar o comando ${comando}?`);
        if (!confirmAlter) {
            showPopup("Alteração cancelada pelo usuário.", "alert");
            return;
        }

        const commandData = {
            data: {
                name: nameInput.value,
                description: descriptionInput.value,  
            },   
            execute: executeInput.value,
            execute2: execute2Input.value,
            execute3: execute3Input.value
        };

        fetch(`https://painel-comandos.vercel.app/comandos/${idInput.value}`, {
            method: "PUT",
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
            showPopup("Alteração realizada com sucesso!", "success");
            commandForm.reset(); // Limpa os campos do formulário
        })
        .catch(error => {
            showPopup("Erro interno: " + error.message, "error");
            console.log(`Erro interno: ${error.message}`);
        });
    });
});
