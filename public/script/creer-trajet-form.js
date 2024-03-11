const form = document.querySelector('form');

form.addEventListener('submit', async (event) => {
    event.preventDefault(); 


    try {

        const response = await fetch('/creer-trajet', {
            method: 'POST',
            body: new FormData(form) // Envoyez les données du formulaire
        });

        // Vérifiez si la requête a réussi
        if (response.ok) {
            // Effacez les champs du formulaire après la soumission
            form.reset();


            document.getElementById('message').innerText = 'Le trajet a été créé avec succès.';
        } else {
            console.error('Erreur lors de la création du trajet :', response.statusText);

            document.getElementById('message').innerText = 'Erreur lors de la création du trajet.';
        }
    } catch (error) {
        console.error('Erreur lors de la création du trajet :', error.message);

        document.getElementById('message').innerText = 'Une erreur est survenue lors de la création du trajet.';
    }
});
