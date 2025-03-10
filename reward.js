const plantImages = [
  { minPoints: 0, maxPoints: 10, url: 'plantimage/seed.png' },
  { minPoints: 11, maxPoints: 20, url: 'plantimage/growing.png' },
  { minPoints: 21, maxPoints: 30, url: 'plantimage/budding.png' },
  { minPoints: 31, maxPoints: 40, url: 'plantimage/flower.png' },
];

function checkPointsThreshold() {
  const points = getUserPoints();
  if (points >= 40) {
    setUserPoints(0);
    alert('Congratulations! You grew an entire plant! You can start growing a new plant now.');
  }
}

checkPointsThreshold();

function getUserPoints() {
  return parseInt(localStorage.getItem('userPoints')) || 0;
}

function setUserPoints(points) {
  localStorage.setItem('userPoints', points);
}

function incrementUserPoints() {
  let points = getUserPoints();
  points += 40; 
  setUserPoints(points);
}

function getPlantImage(points) {
  for (let i = 0; i < plantImages.length; i++) {
    if (points >= plantImages[i].minPoints && points <= plantImages[i].maxPoints) {
      return plantImages[i].url;
    }
  }
  return 'defaultPlant.jpg';
}

function updatePlantImage() {
  const points = getUserPoints();
  const imageUrl = getPlantImage(points);
  const plantImageElement = document.getElementById('plantImage');
  plantImageElement.src = imageUrl;
}

function updatePointsDisplay() {
  const points = getUserPoints();
  const pointsDisplayElement = document.getElementById('pointsDisplay');
  pointsDisplayElement.textContent = points;
}

if (localStorage.getItem('userPoints') === null) {
  setUserPoints(0);
}

if (!sessionStorage.getItem('pageVisited')) {
  incrementUserPoints();
  sessionStorage.setItem('pageVisited', 'true');
}

window.onload = function() {
  updatePlantImage();
  updatePointsDisplay();
};