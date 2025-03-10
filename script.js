if (!sessionStorage.getItem('pageVisited')) {
    incrementUserPoints();
    sessionStorage.setItem('pageVisited', 'true');
}