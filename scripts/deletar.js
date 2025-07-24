import { showPopup } from './popup.js';

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input")
    const searchBtn = document.getElementById("search-btn");
    const searchResults = document.getElementById("search-results");
    const idInput = document.getElementById("id");
    const nameInput = document.getElementById("name");

    const modalBackdrop = document.querySelector(".modal-backdrop");
    const commandListModal = document.getElementById("command-list-modal");
    const closeModalBtn = document.querySelector(".close-btn");

    // Evento de clique no botão de pesquisa
    searchBtn.addEventListener("click", () => {
        fetchCommands()
        
    });
    searchInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            fetchCommands();
        }
    });
    
    function fetchCommands(){
        const busca = searchInput.value.trim();

        if (!busca) {
            showPopup("Informe o nome para realizar a pesquisa.", "alert");
            return;
        }   

            // URL VERCEL                         +                     NOME PREENCHIDO NO INPUT
        fetch(`https://discordbot-vukj.onrender.com/comandos/getName/?name=${encodeURIComponent(busca)}`)
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
                
                // Adiciona os comandos encontrados ao select
                data.comandos.forEach(comando => {
                    const option = document.createElement("option");
                    option.value = comando.id;
                    option.textContent = `${comando.data.name} - ${comando.data.description}`;
                    searchResults.appendChild(option);
                });

                openModal();
            })
            .catch(error => {
                if(error == "TypeError: Failed to fetch"){
                    showPopup(`Verifique se o servidor da API está rodando.`, "alert")
                    console.log("Aparentemente a API está fora, chama o João.")
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
        const selectedId = event.target.value;
        const selectedDescription = event.target.options[event.target.selectedIndex].textContent;
        if (selectedId) {
            idInput.value = selectedId;
            nameInput.value = selectedDescription

            closeModal();
        }
    });

    // Funções para abrir e fechar o modal
    function openModal() {
        commandListModal.classList.add("active");
        modalBackdrop.classList.add("active");
    }

    function closeModal() {
        commandListModal.classList.remove("active");
        modalBackdrop.classList.remove("active");
        searchResults.innerHTML = ""; // Limpa o select para futuras pesquisas
    }
    
    // Botão de fechamento do modal
    closeModalBtn.addEventListener("click", closeModal);
    modalBackdrop.addEventListener("click", closeModal);

    deleteForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const id = document.getElementById("id").value;
        const comando = document.getElementById("name").value

        if (!idInput.value) {
            showPopup("Selecione um comando primeiro...", "alert");
            return;
        } 

        const confirmDelete = confirm(`Você tem certeza que deseja excluir o comando ${comando}?`);
        if (!confirmDelete) {
            showPopup("Exclusão cancelada pelo usuário.", "alert");
            return;
        }

        if (!id) {
            showPopup("Informe o ID para exclusão.", "alert");
            return;
        }

        fetch(`https://discordbot-vukj.onrender.com/comandos/${id}`, { 
            method: "DELETE"
        })
        .then(response => {
            if (!response.ok) {
                console.log(`Erro ${response.status}: ${response.statusText}`); // Log detalhada com o res da API
                throw new Error(`Erro ${response.status}: ${response.statusText}`); // Captura o erro e envia para o catch
            }
            return response.json();
        })
        .then(data => {
            showPopup("Exclusão realizada com sucesso!", "success");
            console.log(`Comando com o ID ${id} foi deletado.`)
            deleteForm.reset(); // Limpa os campos do formulário
        })
        .catch(error => {
            showPopup("Erro interno: " + error.message, "error");
            console.log(`Erro interno: ${error.message}`);
        });
    });
});
