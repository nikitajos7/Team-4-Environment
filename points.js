let points = 0; //get points from database

var links = document.querySelectorAll('a');

for (var i = 0; i < links.length; i++) {
    links[i].addEventListener("click", addPoint);
}

function addPoint() {
    points++;
}

//update points to database