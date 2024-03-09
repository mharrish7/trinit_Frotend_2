import { SimpleMapScreenshoter } from "leaflet-simple-map-screenshoter";

// Define some maps options
var mapOptions = {
  center: { lat: 40.7, lng: 22.8 },
  zoom: 6
};

//Create a map and assign it to the map div
var map = L.map("leafletMapid", mapOptions);

// Create some custom panes
map.createPane("snapshot-pane");
map.createPane("dont-include");

// Add baselayer and geojson to snapshot pane



const baselayer = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3'],
        pane: "snapshot-pane"
}).addTo(map);

// Set up snapshotter
const snapshotOptions = {
  hideElementsWithSelectors: [
    ".leaflet-control-container",
    ".leaflet-dont-include-pane",
    "#snapshot-button"
  ],
  hidden: true
};

// Add screenshotter to map
const screenshotter = new SimpleMapScreenshoter(snapshotOptions);
screenshotter.addTo(map);

// What happens when you clikc the "Snapshot Greek Border" button:
const takeScreenShot = () => {
  // Get bounds of feature, pad ot a but too
  
  // Get the resulting image size that contains the feature
  const imageSize = {x: 1000, y: 500};
  const topLeft = {x: 0, y: 0};

  // Set up screenshot function
  screenshotter
    .takeScreen("image")
    .then((image) => {
      // Create <img> element to render img data
      var img = new Image();

      // once the image loads, do the following:
      img.onload = () => {
        // Create canvas to process image data
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set canvas size to the size of your resultant image
        canvas.width = imageSize.x;
        canvas.height = imageSize.y;

        // Draw just the portion of the whole map image that contains
        // your feature to the canvas
        // from https://stackoverflow.com/questions/26015497/how-to-resize-then-crop-an-image-with-canvas
        ctx.drawImage(
          img,
          topLeft.x,
          topLeft.y,
          imageSize.x,
          imageSize.y,
          0,
          0,
          imageSize.x,
          imageSize.y
        );

        // Create URL for resultant png
        var imageurl = canvas.toDataURL("image/png");
        console.log(imageurl);

        const resultantImage = new Image();
        resultantImage.style = "border: 1px solid black";
        resultantImage.src = imageurl;

        document.body.appendChild(canvas);

        canvas.toBlob(function (blob) {
          // saveAs function installed as part of leaflet snapshot package
          console.log(blob);

          let reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
        let base64String = reader.result;


          fetch('/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "image": base64String })
          })
          .then(response => response.json())
          .then(data => console.log(data))
          .catch((error) => {
            console.error('Error:', error);
          });
        }
        });
      };

      // set the image source to what the snapshotter captured
      // img.onload will fire AFTER this
      img.src = image;
    })
    .catch((e) => {
      alert(e.toString());
    });
};

// Add takescreenshot function to button
const button = document.getElementById("snapshot-button");
button.addEventListener("click", takeScreenShot);
