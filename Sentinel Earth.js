//Source code for Sentinel Earth, a Google Earth Engine App

// Main sidebar panel
var mainPanel = ui.Panel({
  layout: ui.Panel.Layout.flow('vertical'),
  style: {
    width: '250px',
    padding: '10px'
  }
});

// Title
var title = ui.Label('Sentinel Earth', {
  fontSize: '24px',
  fontWeight: 'bold',
  fontFamily: 'cursive',
  textAlign: 'center',
  stretch: 'horizontal',
  margin: '10px 0px'
});
mainPanel.add(title);

// Year label and dropdown
var yearLabel = ui.Label('Year:', {
  fontWeight: 'bold',
  margin: '8px 4px 8px 0px'
});
var yearSelector = ui.Select({
  placeholder: 'Select a year',
  style: {stretch: 'horizontal'}
});
var yearPanel = ui.Panel({
  widgets: [yearLabel, yearSelector],
  layout: ui.Panel.Layout.flow('horizontal'),
  style: {stretch: 'horizontal'}
});
mainPanel.add(yearPanel);

// Populate years
var years = ee.List.sequence(2018, 2025);
var yearStrings = years.map(function(year) {
  return ee.Number(year).format('%04d');
});
yearStrings.evaluate(function(yearList) {
  yearSelector.items().reset(yearList);
  yearSelector.setValue('2018');
});

// Manual band selectors
var bandList = [
  {label: 'Blue (B2)', value: 'B2'},
  {label: 'Green (B3)', value: 'B3'},
  {label: 'Red (B4)', value: 'B4'},
  {label: 'NIR (B8)', value: 'B8'},
  {label: 'SWIR1 (B11)', value: 'B11'},
  {label: 'SWIR2 (B12)', value: 'B12'}
];

var redBand = ui.Select({items: bandList, placeholder: 'Red Band'});
var greenBand = ui.Select({items: bandList, placeholder: 'Green Band'});
var blueBand = ui.Select({items: bandList, placeholder: 'Blue Band'});

redBand.setValue('B4');
greenBand.setValue('B3');
blueBand.setValue('B2');

mainPanel.add(ui.Label('RGB Band Combination', {fontWeight: 'bold'}));
mainPanel.add(ui.Label('Choose bands to display in Red, Green, and Blue', {
  color: 'gray',
  fontStyle: 'italic',
  fontSize: '10px'
}));
mainPanel.add(ui.Panel([ui.Label('Red:'), redBand], ui.Panel.Layout.flow('horizontal')));
mainPanel.add(ui.Panel([ui.Label('Green:'), greenBand], ui.Panel.Layout.flow('horizontal')));
mainPanel.add(ui.Panel([ui.Label('Blue:'), blueBand], ui.Panel.Layout.flow('horizontal')));

// Visualization parameter sliders
mainPanel.add(ui.Label('Visualization Settings', {fontWeight: 'bold'}));

var minSlider = ui.Slider({
  min: 0,
  max: 5000,
  value: 0,
  step: 100,
  style: {stretch: 'horizontal'}
});
mainPanel.add(ui.Label('Min Value'));
mainPanel.add(minSlider);
mainPanel.add(ui.Label('Min: "Where black begins"', {
  color: 'gray',
  fontStyle: 'italic',
  fontSize: '10px'
}));

var maxSlider = ui.Slider({
  min: 500,
  max: 10000,
  value: 3000,
  step: 100,
  style: {stretch: 'horizontal'}
});
mainPanel.add(ui.Label('Max Value'));
mainPanel.add(maxSlider);
mainPanel.add(ui.Label('Max: "Where white ends"', {
  color: 'gray',
  fontStyle: 'italic',
  fontSize: '10px'
}));

var gammaSlider = ui.Slider({
  min: 0.1,
  max: 3,
  value: 0.8,
  step: 0.1,
  style: {stretch: 'horizontal'}
});
mainPanel.add(ui.Label('Gamma'));
mainPanel.add(gammaSlider);
mainPanel.add(ui.Label('Gamma: "Shadow booster"', {
  color: 'gray',
  fontStyle: 'italic',
  fontSize: '10px'
}));

// Load button
var loadButton = ui.Button({
  label: 'Load Image',
  style: {stretch: 'horizontal'},
  onClick: function() {
    var year = yearSelector.getValue();
    var startDate = ee.Date.fromYMD(ee.Number.parse(year), 1, 1);
    var endDate = startDate.advance(1, 'year');

    var bands = [redBand.getValue(), greenBand.getValue(), blueBand.getValue()];

    var image = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      .filterDate(startDate, endDate)
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
      .median()
      .select(bands);

    var visParams = {
      bands: bands,
      min: minSlider.getValue(),
      max: maxSlider.getValue(),
      gamma: gammaSlider.getValue()
    };

    Map.layers().reset();
    Map.addLayer(image, visParams, 'Sentinel-2 ' + year);
  }
});
mainPanel.add(loadButton);

// Spacer
var spacer = ui.Panel(null, null, {stretch: 'vertical'});
mainPanel.add(spacer);

// App description
mainPanel.add(ui.Label({
  value: 'Explore our planet through the eyes of Sentinel satellites. View stunning Sentinel imagery from any year (from 2018 onwards), with customizable visual styles. Inspired by a love for Earth’s natural beauty.',
  style: {
    fontSize: '10px',
    fontStyle: 'italic',
    color: 'gray',
    margin: '8px 0px'
  }
}));

mainPanel.add(ui.Label({
  value: 'Suggested Sentinel-2 Band Combinations:',
  style: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: 'gray',
    margin: '6px 0px'
  }
}));

// Natural Color
mainPanel.add(ui.Label({
  value: 'Natural Color (B4, B3, B2)',
  style: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: 'gray',
    margin: '6px 0px 0px 0px'
  }
}));
mainPanel.add(ui.Label({
  value: 'Displays Earth as the human eye sees. Vegetation is green, urban areas are gray, and water is dark blue.',
  style: {
    fontSize: '10px',
    color: 'gray',
    margin: '2px 0px'
  }
}));

// Color Infrared
mainPanel.add(ui.Label({
  value: 'Color Infrared (B8, B4, B3)',
  style: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: 'gray',
    margin: '6px 0px 0px 0px'
  }
}));
mainPanel.add(ui.Label({
  value: 'Highlights vegetation in red. Useful for analyzing plant health and detecting stress.',
  style: {
    fontSize: '10px',
    color: 'gray',
    margin: '2px 0px'
  }
}));

// Short-Wave Infrared
mainPanel.add(ui.Label({
  value: 'Short-Wave Infrared (B12, B8A, B4)',
  style: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: 'gray',
    margin: '6px 0px 0px 0px'
  }
}));
mainPanel.add(ui.Label({
  value: 'Useful for vegetation and soil moisture. Dense vegetation is green; soil and built-up areas appear brown.',
  style: {
    fontSize: '10px',
    color: 'gray',
    margin: '2px 0px'
  }
}));

// Agriculture
mainPanel.add(ui.Label({
  value: 'Agriculture (B11, B8, B2)',
  style: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: 'gray',
    margin: '6px 0px 0px 0px'
  }
}));
mainPanel.add(ui.Label({
  value: 'Designed for crop monitoring. Healthy crops appear dark green due to strong NIR and SWIR response.',
  style: {
    fontSize: '10px',
    color: 'gray',
    margin: '2px 0px'
  }
}));

// Geology
mainPanel.add(ui.Label({
  value: 'Geology (B12, B11, B2)',
  style: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: 'gray',
    margin: '6px 0px 0px 0px'
  }
}));
mainPanel.add(ui.Label({
  value: 'Used to study rock and soil types. Good for identifying faults and geologic formations.',
  style: {
    fontSize: '10px',
    color: 'gray',
    margin: '2px 0px 10px 0px'
  }
}));

// Author label
var authorLabel = ui.Label({
  value: 'by Anandhu SJ',
  style: {
    fontSize: '10px',
    fontWeight: 'bold',
    fontFamily: 'cursive',
    textAlign: 'right',
    stretch: 'horizontal',
    margin: '0px 0px 0px 0px'
  }
});
mainPanel.add(authorLabel);

// Add to UI
ui.root.insert(0, mainPanel);