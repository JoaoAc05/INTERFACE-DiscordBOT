import { showPopup } from './popup.js';

document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.getElementById("search-btn");
    const searchInput = document.getElementById("search");
    const resultsContainer = document.getElementById("results-container");
    const detailsModal = document.getElementById("details-modal");
    const modalBackdrop = document.querySelector(".modal-backdrop");
    const loader = document.getElementById('loader');

    let currentPage = 1; // Página atual
    const itemsPerPage = 10; // Número de comandos por página
    let totalPages = 1; // Total de páginas

    // Realizar o get na rota All ou Name
    async function fetchCommands() {
        const query = searchInput.value.trim(); // Obtém o valor do campo, removendo espaços extras
        loader.style.display = 'block';
        modalBackdrop.classList.add("active");

        let url = query 
        ? `https://discordbot-vukj.onrender.com/comandos/getName/?name=${encodeURIComponent(query)}` // Pesquisa por nome
        : `https://discordbot-vukj.onrender.com/comandos?page=${currentPage}&limit=${itemsPerPage}`; // Pesquisa geral

        let response;

        try {
            response = await fetch(url);
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
                console.log("Aparentemente a API está fora, chama o João...")
                return;
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

            
        } finally {
        loader.style.display = 'none';
        modalBackdrop.classList.remove("active");
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

    // Exibir os comandos na tela
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
    
    // Botões para alterar a paginação
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

    function formatDiscordMarkdown(text) {
    if (!text) return "";

    // Bloco de código (``` linguagem\n código ```)
    text = text.replace(/```(\w+)?\s*([\s\S]*?)```/g, (match, lang, code) => {
        const languageClass = lang ? ` class="language-${lang}"` : "";
        return `<pre><code${languageClass}>${code.trim()}</code></pre>`;
    });

    // Negrito
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Sublinhado
    text = text.replace(/__(.*?)__/g, "<u>$1</u>");

    // Itálico com * ou _
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
    text = text.replace(/_(.*?)_/g, "<em>$1</em>");

    // Quebra de linha
    text = text.replace(/\n/g, "<br>");

    return text;
    }

    // Abrir modal ao clicar nos detalhes do comando
    function showDetails(command) {
        const detailsContainer = document.getElementById("command-details");
    
        let executeDetails = formatDiscordMarkdown(command.execute);
        
        if (command.execute2) {
            executeDetails += `<br><hr><br><strong>Executar 2:</strong> ${formatDiscordMarkdown(command.execute2)}`;
        }
        
        if (command.execute3) {
            executeDetails += `<br><hr><br><strong>Executar 3:</strong> ${formatDiscordMarkdown(command.execute3)}`;
        }
    
        // Exibe os detalhes no container
        detailsContainer.innerHTML = `
            <h2>Detalhes do Comando</h2>
            <div class="detalhes-comando">
            <p><strong>ID:</strong> ${command.id}</p>
            <p><strong>Nome:</strong> ${command.data.name}</p>
            <p><strong>Descrição:</strong> ${command.data.description}</p>
            </div>
            <hr>
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
