document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.getElementById("search-btn");
    const searchInput = document.getElementById("search");
    const resultsContainer = document.getElementById("results-container");
    const detailsModal = document.getElementById("details-modal");
    const modalBackdrop = document.querySelector(".modal-backdrop");

    let currentPage = 1; // Página atual
    const itemsPerPage = 10; // Número de comandos por página
    let totalPages = 1; // Total de páginas
    
    const alertSrc = "../Images/Yellow Alert.png"
    const errorSrc = "../Images/Red Alert.png"
    const succesSrc = "../Images/Green Alert.png"
    
    // Função para exibir o popup
    function showPopup(message, type = "") {
        const popupMessage = document.getElementById("popup-message");
        const popupText = document.getElementById("popup-text");
        const popupImage = document.getElementById("img-popup");

        popupMessage.className = `popup-message ${type}`; // Adiciona a classe (erro ou sucesso)
        popupText.textContent = message;
        popupMessage.style.display = "flex";
        popupMessage.style.opacity = "1";
        if(type == "alert") {
            popupImage.src = "../Images/Yellow Alert.png" 
        } else if(type == "error") {
            popupImage.src = "../Images/Red Alert.png"
        } else if(type == "success") {
            popupImage.src = "../Images/Green Alert.png"
        }

        setTimeout(() => {
            popupMessage.style.opacity = "0";
            setTimeout(() => (popupMessage.style.display = "none"), 300);
        }, 3000);
    }

    //Realizar o ge na rota Get All
    async function fetchCommands() {
        const query = searchInput.value.trim(); // Obtém o valor do campo, removendo espaços extras

        //https://painel-comandos.vercel.app/       URL VERCEL
        //http://localhost:3000/                    LOCAL
        let url = query 
            ? `https://painel-comandos.vercel.app/comandos/getName/?name=${encodeURIComponent(query)}` // Pesquisa por nome
            : `https://painel-comandos.vercel.app/comandos?page=${currentPage}&limit=${itemsPerPage}`; // Pesquisa geral


        try {
            const response = await fetch(url);
            if (!response.ok) {
                if(response.status == 404) {
                    showPopup(`Não foi encontrado resultados para: ${query}`, "alert")
                    console.error(`Erro ao buscar comando ${query}: ${error}`);
                } else {
                    throw new Error(`Erro ao buscar comandos: ${response.status}`);
                }
            }

            const data = await response.json();
            displayCommands(data); // Função para exibir os comandos no DOM
        } catch (error) {
            if(error == "TypeError: Failed to fetch"){
                showPopup(`Verifique se o servidor da API está rodando.`, "alert")
                console.log("Aparentemente a API está fora, chama o João ou o Luan...")
                return;
            } else {
                const response = await fetch(url);
            }
            if(query){
                if(response.status == 404) {
                    showPopup(`Não foi encontrado resultados para: ${query}`, "alert")
                } else {
                    showPopup(`Erro ao buscar comando ${query}: ${error.message}`, "error"); 
                    console.error(`Erro ao buscar comando ${query}: ${error}`);
                }
            } else {
                showPopup(`Erro ao buscar comandos: ${error.message}`, "error"); 
                console.error(`Erro ao buscar comandos: ${error}`);
            }

            
        }
    }
    
    searchButton.addEventListener("click", () => {
        searchButton.disabled = true;
    
        setTimeout(() => {
            searchButton.disabled = false;
        }, 3000);
    
        fetchCommands();
    });

    searchInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            fetchCommands();
        }
    });

    //Exibir os comandos na tela
    function displayCommands(response) {
        resultsContainer.innerHTML = ""; // Limpa os resultados anteriores
        
        const commands = response.comandos; // Array de comandos
        totalPages = response.totalPages; // Total de páginas da API
    
        if (!commands || commands.length === 0) {
            resultsContainer.innerHTML = "<p class='no-results'>Nenhum comando encontrado.</p>";
            showPopup("Nenhum comando foi encontrado.", "alert")
            return;
        }
    
        const table = document.createElement("table");
        table.className = "results-table";
    
        const thead = document.createElement("thead");
        thead.innerHTML = `
            <tr>
                <th class="coluna-detalhe">Detalhar</th>
                <th>Nome do Comando</th>
            </tr>
        `;
        table.appendChild(thead);
    
        const tbody = document.createElement("tbody");
    
        commands.forEach(command => {
            const row = document.createElement("tr");
    
            const actionCell = document.createElement("td");
            actionCell.classList.add("coluna-detalhe");
    
            const detailsButton = document.createElement("button");
            detailsButton.className = "details-btn";
            const img = document.createElement("img");
            img.src = "../Images/Detail - white.png";
            img.alt = "Detalhar";
            detailsButton.appendChild(img);
            detailsButton.addEventListener("click", () => {
                showDetails(command);
            });
            actionCell.appendChild(detailsButton);
    
            const nameCell = document.createElement("td");
            nameCell.textContent = `/${command.data.name}`;
    
            row.appendChild(actionCell);
            row.appendChild(nameCell);
    
            tbody.appendChild(row);
        });
    
        table.appendChild(tbody);
        resultsContainer.appendChild(table);
        
        const query = searchInput.value.trim();   

        if (totalPages > 1 || query) {
            displayPaginationButtons();
        }
    }
    
    //Botões para alterar a paginação
    function displayPaginationButtons() {
        const paginationContainer = document.getElementById("pagination-container");
        paginationContainer.innerHTML = ""; // Limpa os botões anteriores
    
        // console.log("Total de Páginas:", totalPages);
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            button.textContent = i;
            button.className = "pagination-btn";
    
            
    
            button.addEventListener("click", () => {
                currentPage = i;
                fetchCommands(); // Chama a API para buscar a nova página
            });

            
            if (i === currentPage) {
                button.classList.add("active");
            }
            
              paginationContainer.appendChild(button);  
        }
           
    }

    //Abrir modal ao clicar nos detalhes do comando
    function showDetails(command) {
        const detailsContainer = document.getElementById("command-details");
    
        let executeDetails = command.execute;
        
        if (command.execute2) {
            executeDetails += `<br><br><strong>Executar 2:</strong> ${command.execute2}`;
        }
        
        if (command.execute3) {
            executeDetails += `<br><br><strong>Executar 3:</strong> ${command.execute3}`;
        }
    
        // Exibe os detalhes no container
        detailsContainer.innerHTML = `
            <h2>Detalhes do Comando</h2>
            <p><strong>ID:</strong> ${command.id}</p>
            <p><strong>Nome:</strong> ${command.data.name}</p>
            <p><strong>Descrição:</strong> ${command.data.description}</p>
            <p><strong>Executar:</strong> ${executeDetails}</p>
        `;
        
        // Abre o modal
        detailsModal.classList.add("active");
        modalBackdrop.classList.add("active");
    }

    // Função para fechar o modal
    detailsModal.querySelector(".close-btn").addEventListener("click", () => {
        detailsModal.classList.remove("active");
        modalBackdrop.classList.remove("active");
    });
});
