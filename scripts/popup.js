export function showPopup(message, type = "") {
    const popupMessage = document.getElementById("popup-message");
    const popupText = document.getElementById("popup-text");
    const popupImage = document.getElementById("img-popup");

    popupMessage.className = `popup-message ${type}`; // Adiciona a classe (erro ou sucesso)
    popupText.textContent = message;
    popupMessage.style.display = "flex";
    popupMessage.style.opacity = "1";
    if (type === "alert") {
        popupImage.src = "../Images/Yellow Alert.png";
    } else if (type === "error") {
        popupImage.src = "../Images/Red Alert.png";
    } else if (type === "success") {
        popupImage.src = "../Images/Green Alert.png";
    }

    setTimeout(() => {
        popupMessage.style.opacity = "0";
        setTimeout(() => (popupMessage.style.display = "none"), 300);
    }, 3000);
}