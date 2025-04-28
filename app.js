// Cargar la librería dotenv para leer las variables de entorno
require('dotenv').config();

// Enlazar con tu cuenta de Cesium ion usando el token desde la variable de entorno
Cesium.Ion.defaultAccessToken = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNTIwZGMxOC1kNTliLTQxNTgtYjYwNi05MDVkYmI4N2YwMjYiLCJpZCI6Mjk3Njk4LCJpYXQiOjE3NDU4MTU1MDN9.Mijr9cAtS579wWJfR3lidsSX25viA9Yk-DvJoxNrP_w;

async function initCesium() {
  try {
    const viewer = new Cesium.Viewer("cesiumContainer", {
      terrainProvider: await Cesium.CesiumTerrainProvider.fromIonAssetId(1),
      animation: false,
      timeline: true,
      baseLayerPicker: false
    });

    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(0, 20, 20000000)
    });

    let allEvents = [];

    // Cargar eventos
    fetch('data/events.json')
      .then(response => response.json())
      .then(events => {
        allEvents = events.map(event => viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(event.longitude, event.latitude),
          point: {
            pixelSize: 10,
            color: Cesium.Color.RED,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2
          },
          label: {
            text: event.title,
            font: '14pt sans-serif',
            fillColor: Cesium.Color.WHITE,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -20)
          },
          description: `
            <h2>${event.title}</h2>
            <p><strong>Fecha:</strong> ${event.date}</p>
            <p><strong>Era:</strong> ${event.era}</p>
            <p><strong>Tipo de Evento:</strong> ${event.category}</p>
            <p>${event.description}</p>
            <p><a href="${event.wikipedia}" target="_blank">🔗 Ver en Wikipedia</a></p>
          `,
          properties: event
        }));
      })
      .catch(error => console.error('Error cargando eventos:', error));

    // Filtrado
    document.getElementById('yearSelect').addEventListener('change', filterEntities);
    document.querySelectorAll('.eraFilter').forEach(cb => cb.addEventListener('change', filterEntities));
    document.querySelectorAll('.categoryFilter').forEach(cb => cb.addEventListener('change', filterEntities));

    function filterEntities() {
      const selectedYearRange = document.getElementById('yearSelect').value;
      const selectedEras = Array.from(document.querySelectorAll('.eraFilter:checked')).map(cb => cb.value);
      const selectedCategories = Array.from(document.querySelectorAll('.categoryFilter:checked')).map(cb => cb.value);

      allEvents.forEach(entity => {
        const props = entity.properties;
        let visible = true;

        // Filtro por rango de años
        if (selectedYearRange !== 'all') {
          const year = parseInt(props.year._value);
          if (selectedYearRange === 'prehistoria') {
            visible = visible && (year < 0);
          } else {
            const [start, end] = selectedYearRange.split('-').map(Number);
            visible = visible && (year >= start && year <= end);
          }
        }

        // Filtro por era
        if (selectedEras.length > 0) {
          visible = visible && selectedEras.includes(props.era._value);
        }

        // Filtro por categoría
        if (selectedCategories.length > 0) {
          visible = visible && selectedCategories.includes(props.category._value);
        }

        entity.show = visible;
      });
    }

  } catch (error) {
    console.error('Error al inicializar Cesium:', error);
  }
}

initCesium();




