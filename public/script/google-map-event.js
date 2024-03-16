function initAutocomplete(){
    //Autocomplete pour recherche de trajet
    var departInput = document.getElementById('pointDepart');
    var departAutocomplete = new google.maps.places.Autocomplete(departInput, {types: ['geocode']});

    var arriveeInput = document.getElementById('pointArrivee');
    var arriveeAutocomplete = new google.maps.places.Autocomplete(arriveeInput, {types: ['geocode']});

    //Autocomplete pour création de trajet
    var creerDepartInput = document.getElementById('creerPointDepart');
    var creerDepartAutocomplete = new google.maps.places.Autocomplete(creerDepartInput, {types: ['geocode']});

    var creerArriveeInput = document.getElementById('creerPointArrivee');
    var creerArriveeAutocomplete = new google.maps.places.Autocomplete(creerArriveeInput, {types: ['geocode']});
}
google.maps.event.addDomListener(window, 'load', initAutocomplete);