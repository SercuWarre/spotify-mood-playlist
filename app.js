document.addEventListener('DOMContentLoaded', () => {
  const moodButton = document.getElementById('mood-button');
  const moodMenu = document.getElementById('mood-menu');
  const songsContainer = document.getElementById('songs-container');
  const genreChartCanvas = document
    .getElementById('genreChart')
    .getContext('2d');
  let selectedMood = '';
  let genreChart = null;

  const accessToken =
    'BQDCBSZrHVkERBU_IQa1_ecGXkn6MOg1OdA1O7afYW3EotlI-k3lVfZi5pnVHYi81uN0Wwg4WjDH1-DwUBscuy8NiF4Izbf4X5xIZeIoVCKdEBuHA98'; // Replace with your Spotify access token
  const moodPlaylists = {
    happy: '37i9dQZF1DX4VvY1c2sM2M',
    chill: '6IKQrtMc4c00YzONcUt7QH',
    energetic: '3y11OK67FAULJae0zEd1jD',
    sad: '37i9dQZF1DX7qK8ma5wgG1',
    angry: '37i9dQZF1DX1gRalH1mWrP',
    focus: '37i9dQZF1DWY5nN5A0K6ZV',
    relax: '37i9dQZF1DX2U2f5RilnbB',
    romantic: '37i9dQZF1DWV1D2It0M5t8',
    party: '37i9dQZF1DX4sWSpwq3m1O',
    workout: '37i9dQZF1DWU7p2H8P9wbv',
    uplifting: '37i9dQZF1DXdPec7aLTmlC',
    sleep: '37i9dQZF1DWVgrC4c7YlgW',
    reflective: '37i9dQZF1DWToib6EuAxI1',
    road_trip: '37i9dQZF1DX0n1D8E7Zuq5',
    background: '37i9dQZF1DWXl6sA1CsM6Z',
  };

  const fetchPlaylistTracks = async (playlistId) => {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch playlist tracks');
    }
    const data = await response.json();
    return data.items;
  };

  const fetchArtistGenres = async (artistId) => {
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch artist genres');
    }
    const data = await response.json();
    return data.genres;
  };

  const getRandomElements = (array, count) => {
    const shuffled = array.slice().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const getGenreDistribution = async (tracks) => {
    const genreCounts = {};
    for (const track of tracks) {
      const artistIds = track.track.artists.map((artist) => artist.id);
      for (const artistId of artistIds) {
        const genres = await fetchArtistGenres(artistId);
        genres.forEach((genre) => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    }
    return genreCounts;
  };

  const getTopGenres = (genreCounts, topN = 5) => {
    const sortedGenres = Object.entries(genreCounts).sort(
      (a, b) => b[1] - a[1]
    );
    const topGenres = sortedGenres.slice(0, topN);
    const labels = topGenres.map((genre) => genre[0]);
    const data = topGenres.map((genre) => genre[1]);
    return { labels, data };
  };

  const displayGenreChart = (genreCounts) => {
    const { labels, data } = getTopGenres(genreCounts);

    if (genreChart) {
      genreChart.destroy();
    }

    genreChart = new Chart(genreChartCanvas, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  };

  const displayRandomSongs = (tracks) => {
    songsContainer.innerHTML = '';
    const randomTracks = getRandomElements(tracks, 10);
    randomTracks.forEach((track) => {
      const trackCard = document.createElement('div');
      trackCard.className = 'song-card';
      trackCard.innerHTML = `
                <h2>${track.track.name}</h2>
                <p>Artist: ${track.track.artists
                  .map((artist) => artist.name)
                  .join(', ')}</p>
                <p>Album: ${track.track.album.name}</p>
                <img src="${track.track.album.images[0].url}" alt="${
        track.track.name
      }">
            `;
      songsContainer.appendChild(trackCard);
    });
    return randomTracks;
  };

  const handleMoodSelection = async (mood) => {
    selectedMood = mood;
    moodButton.textContent = moodButton.querySelector(`[data-value="${mood}"]`);
    moodMenu.classList.remove('show');
    moodButton.textContent = mood;

    if (selectedMood) {
      const playlistId = moodPlaylists[selectedMood];
      try {
        const tracks = await fetchPlaylistTracks(playlistId);
        const randomTracks = getRandomElements(tracks, 10);
        const genreCounts = await getGenreDistribution(randomTracks);
        console.log('Genre counts:', genreCounts); // For debugging
        displayGenreChart(genreCounts);
        displayRandomSongs(randomTracks);
      } catch (error) {
        console.error(error);
        alert('Failed to fetch playlist tracks. Please try again.');
      }
    }
  };

  document.querySelectorAll('.dropdown-content a').forEach((item) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      handleMoodSelection(event.target.dataset.value);
    });
  });

  moodButton.addEventListener('click', () => {
    moodMenu.classList.toggle('show');
  });
});
