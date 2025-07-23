function euclideanDistance(a, b) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

function kMeans(embeddings, k = 5, maxIter = 100) {
  // Inicialização aleatória dos centróides
  let centroids = embeddings.slice(0, k);
  let assignments = new Array(embeddings.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    // Atribuir cada embedding ao centróide mais próximo
    for (let i = 0; i < embeddings.length; i++) {
      let minDist = Infinity;
      let minIdx = 0;
      for (let j = 0; j < k; j++) {
        const dist = euclideanDistance(embeddings[i], centroids[j]);
        if (dist < minDist) {
          minDist = dist;
          minIdx = j;
        }
      }
      assignments[i] = minIdx;
    }
    // Atualizar centróides
    for (let j = 0; j < k; j++) {
      const clusterPoints = embeddings.filter((_, i) => assignments[i] === j);
      if (clusterPoints.length > 0) {
        centroids[j] = clusterPoints[0].map((_, d) =>
          clusterPoints.reduce((sum, point) => sum + point[d], 0) / clusterPoints.length
        );
      }
    }
  }
  return assignments;
}

module.exports = { kMeans }; 