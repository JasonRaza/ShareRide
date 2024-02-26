function validerFormulaireInscription() {
    const erreurMessage = document.querySelector('.mssg-erreur');
    const nom = document.getElementById('nom').value.trim();
    const prenom = document.getElementById('prenom').value.trim();
    const numeroTelephone = document.getElementById('numeroTelephone').value.trim();
    const motDePasse = document.getElementById('motDePasse').value.trim();
    const confirmerMotDePasse = document.getElementById('confirmerMotDePasse').value.trim();

    erreurMessage.innerHTML = '';

    if (nom === '' || prenom === '' || numeroTelephone === '' || motDePasse === '' || confirmerMotDePasse === '') {
        afficherMsgErreur('Remplir tous les champs!')
        return false;
    }

    if (!verifieNomPrenom(nom)){ 
        afficherMsgErreur("Le nom n'est pas valide!")
        return false;
    }

    if (!verifieNomPrenom(prenom)){ 
        afficherMsgErreur("Le prénom n'est pas valide!")
        return false;
    }

    //if (!/^\d+$/.numeroTelephone){ 
    //    afficherMsgErreur("Le numéro de téléphone n'est pas valide!")
     //   return false;
    //}
    
    if (motDePasse.length < 8) {
        afficherMsgErreur('Mote de passe doit contenir au moins 8 charactères!')
        return false;
    }

    if (!/\d/.test(motDePasse)) {
        afficherMsgErreur('Mote de passe doit contenir au moin un chiffre!')
        return false;
    }


    if (motDePasse !== confirmerMotDePasse) {
        afficherMsgErreur('Les mots de passe correspondent pas!')
        return false;
    }
 
    return true;
}

function verifieNomPrenom(chaine){
    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s\-']+$/;
    return regex.test(chaine);
}

function afficherMsgErreur(message){
    var msgBox = document.getElementById('mssg-erreur')
    msgBox.textContent = message;
    msgBox.style.display = 'block';

    setTimeout(function(){
        msgBox.style.display = 'none';
    }, 4000);
}