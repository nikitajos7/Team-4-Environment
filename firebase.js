import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    updateDoc,
    serverTimestamp,
    getDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDNJVYoZZMMiL3khlCVDCIPU_3shq6Sl0w",
    authDomain: "env-web-ec36d.firebaseapp.com",
    projectId: "env-web-ec36d",
    storageBucket: "env-web-ec36d.appspot.com",
    messagingSenderId: "594340739099",
    appId: "1:594340739099:web:1eb969713576bd12d820be"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
    auth,
    db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    doc,
    setDoc,
    updateDoc,
    serverTimestamp,
    getDoc,
};

const plantImages = [
    { minPoints: 0, maxPoints: 10, url: 'plantimage/seed.png' },
    { minPoints: 11, maxPoints: 20, url: 'plantimage/growing.png' },
    { minPoints: 21, maxPoints: 30, url: 'plantimage/budding.png' },
    { minPoints: 31, maxPoints: 40, url: 'plantimage/flower.png' },
];

export function getPlantImage(points) {
    for (let i = 0; i < plantImages.length; i++) {
        if (points >= plantImages[i].minPoints && points <= plantImages[i].maxPoints) {
            return plantImages[i].url;
        }
    }
    return 'plantimage/seed.png';
}

export function updatePlantImage(points) {
    const imageUrl = getPlantImage(points);
    const plantImageElement = document.getElementById('plantImage');
    if (plantImageElement) {
        plantImageElement.src = imageUrl;
    }
}

export function displayUserPoints() {
    const user = auth.currentUser;

    if (user) {
        const userId = user.uid;
        const userRef = doc(db, "users", userId);

        getDoc(userRef).then((doc) => {
            if (doc.exists()) {
                let points = doc.data().points || 0;
                const plantCount = Math.floor(points / 40);
                const currentPoints = points % 40;

                const plantCountElement = document.getElementById("plant-count");
                if (plantCountElement) {
                    plantCountElement.textContent = plantCount;
                }

                const pointsDisplayElement = document.getElementById("pointsDisplay");
                if (pointsDisplayElement) {
                    pointsDisplayElement.textContent = currentPoints;
                }

                updatePlantImage(currentPoints);
            } else {
                console.log("User document does not exist.");
            }
        }).catch((error) => {
            console.error("Error getting user document:", error);
        });
    } else {
        console.log("User is not signed in. Points will not be displayed.");
    }
}

export function updateUserPoints(effortName) {
    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        const userRef = doc(db, "users", userId);

        getDoc(userRef).then((document) => {
            if (document.exists()) {
                const currentPoints = document.data().points || 0;
                const newPoints = currentPoints + 10;
                const oldPlantCount = Math.floor(currentPoints / 40);
                const newPlantCount = Math.floor(newPoints / 40);
                const plantCompleted = newPlantCount > oldPlantCount;

                updateDoc(userRef, {
                    points: newPoints
                }).then(() => {
                    console.log("Points updated successfully!");

                    if (plantCompleted) {
                        alert(`Congratulations! You've grown a complete plant! You now have ${newPlantCount} plants.`);
                    } else {
                        alert(`You earned 10 points for clicking on ${effortName}!`);
                    }

                    displayUserPoints();
                }).catch((error) => {
                    console.error("Error updating points:", error);
                });
            } else {
                setDoc(userRef, {
                    points: 10
                }).then(() => {
                    console.log("User points initialized!");
                    alert(`You earned 10 points for clicking on ${effortName}!`);
                    displayUserPoints();
                }).catch((error) => {
                    console.error("Error initializing user points:", error);
                });
            }
        }).catch((error) => {
            console.error("Error fetching user document:", error);
        });
    } else {
        console.log("User is not signed in. Points will not be updated.");
        alert("Please sign in to earn points!");
    }
}

//calc
export function calculateEmissions() {
    const EMISSION_FACTORS = {
        Electricity: 0.225,
        Diet: {
            omnivore: 2.5,
            pescatarian: 2.0,
            vegetarian: 1.5,
            vegan: 1.0
        },
        Waste: 0.275,
        Transportation: {
            car: 0.251,
            plane: 0.285,
            other: 0.3
        }
    };

    const CO2_PER_TREE_PER_YEAR = 58;
    const car_distance = parseFloat(document.getElementById("car_distance").value) || 0;
    const plane_distance = parseFloat(document.getElementById("plane_distance").value) || 0;
    const other_distance = parseFloat(document.getElementById("other_distance").value) || 0;
    const electricity = parseFloat(document.getElementById("electricity").value) || 0;
    const waste = parseFloat(document.getElementById("waste").value) || 0;
    const meals = parseFloat(document.getElementById("meals").value) || 2;
    const diet = document.getElementById("diet").value;

    const yearly_car_distance = car_distance * 12;
    const yearly_plane_distance = plane_distance * 12;
    const yearly_other_distance = other_distance * 12;
    const yearly_meals = meals * 365;
    const yearly_waste = waste * 52;

    const electricity_emissions = (EMISSION_FACTORS.Electricity * electricity * 12).toFixed(2);
    const diet_emissions = (EMISSION_FACTORS.Diet[diet] * yearly_meals).toFixed(2);
    const waste_emissions = (EMISSION_FACTORS.Waste * yearly_waste).toFixed(2);
    const car_emissions = (EMISSION_FACTORS.Transportation.car * yearly_car_distance).toFixed(2);
    const plane_emissions = (EMISSION_FACTORS.Transportation.plane * yearly_plane_distance).toFixed(2);
    const other_emissions = (EMISSION_FACTORS.Transportation.other * yearly_other_distance).toFixed(2);

    const total_transportation_emissions = (parseFloat(car_emissions) + parseFloat(plane_emissions) + parseFloat(other_emissions)).toFixed(2);
    const total_emissions = (parseFloat(electricity_emissions) + parseFloat(diet_emissions) + parseFloat(waste_emissions) + parseFloat(total_transportation_emissions)).toFixed(2);
    const trees_needed = Math.round(total_emissions / CO2_PER_TREE_PER_YEAR);

    // Display results
    document.getElementById("results").innerHTML = `
    <strong>Results:</strong><br>
    Car: ${car_emissions} kg CO₂ per year<br>
    Plane: ${plane_emissions} kg CO₂ per year<br>
    Other transport: ${other_emissions} kg CO₂ per year<br>
    <strong>Total Transportation: ${total_transportation_emissions} kg CO₂ per year</strong><br>
    Electricity: ${electricity_emissions} kg CO₂ per year<br>
    Diet: ${diet_emissions} kg CO₂ per year<br>
    Waste: ${waste_emissions} kg CO₂ per year<br>
    <strong>Total: ${total_emissions} kg CO₂ per year</strong><br>
    Trees needed to offset🌳: ${trees_needed}
  `;

    // Save carbon footprint data to Firestore
    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        const userRef = doc(db, "users", userId);
        updateDoc(userRef, {
            carbonFootprint: {
                car: car_emissions,
                plane: plane_emissions,
                otherTransport: other_emissions,
                electricity: electricity_emissions,
                diet: diet_emissions,
                waste: waste_emissions,
                totalTransportation: total_transportation_emissions,
                totalEmissions: total_emissions,
                treesNeeded: trees_needed,
                lastUpdated: serverTimestamp()
            }
        })
            .then(() => {
                console.log("Carbon footprint data saved to Firestore");
            })
            .catch((error) => {
                console.error("Error saving carbon footprint data:", error);
            });
    } else {
        console.log("User is not signed in. Carbon footprint data will not be saved.");
    }
}