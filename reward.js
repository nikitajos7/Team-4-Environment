const plantImages = [
  { minPoints: 0, maxPoints: 10, url: 'plantimage/seed.png' },
  { minPoints: 11, maxPoints: 20, url: 'plantimage/growing.png' },
  { minPoints: 21, maxPoints: 30, url: 'plantimage/budding.png' },
  { minPoints: 31, maxPoints: 40, url: 'plantimage/flower.png' },
];

function checkPointsThreshold(points) {
  if (points >= 40) {
    alert('Congratulations! You grew an entire plant! You can start growing a new plant now.');
    updatePlantImage(points);
  }
}

function updatePointsDisplay(points) {
  const pointsDisplayElement = document.getElementById('pointsDisplay');
  if (pointsDisplayElement) {
    pointsDisplayElement.textContent = points;
  }
  updatePlantImage(points); 
}

window.onload = function () {
  displayUserPoints();
};