function toggleTousTrajets() {
    var tousTrajetsDiv = document.getElementById("tousTrajets");
    var trajetsUtilisateurDiv = document.getElementById("trajetsUtilisateur");
    
    if (tousTrajetsDiv.style.display === "none") {
        tousTrajetsDiv.style.display = "block";
        trajetsUtilisateurDiv.style.display = "none";
    } else {
        tousTrajetsDiv.style.display = "none";
    }
}

function toggleTrajetsUtilisateur() {
    var tousTrajetsDiv = document.getElementById("tousTrajets");
    var trajetsUtilisateurDiv = document.getElementById("trajetsUtilisateur");
    
    if (trajetsUtilisateurDiv.style.display === "none") {
        trajetsUtilisateurDiv.style.display = "block";
        tousTrajetsDiv.style.display = "none";
    } else {
        trajetsUtilisateurDiv.style.display = "none";
    }
}
