mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL light-v10
    center: houseMap.geometry.coordinates,
    zoom: 8 // starting zoom
});


map.addControl(new mapboxgl.NavigationControl());


new mapboxgl.Marker()
    .setLngLat(houseMap.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
        .setHTML(
            `<h5>${houseMap.roomType}</h5><p>${houseMap.location}</p>`
        )
    )
    .addTo(map)