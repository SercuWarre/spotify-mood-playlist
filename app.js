document.addEventListener('DOMContentLoaded', () => {
  const moodButton = document.getElementById('mood-button');
  const moodMenu = document.getElementById('mood-menu');
  const songsContainer = document.getElementById('songs-container');
  const genreChartCanvas = document
    .getElementById('genreChart')
    .getContext('2d');
  const confirmationMessage = document.getElementById('confirmation-message');
  const selectedMoodSpan = document.getElementById('selected-mood');
  let selectedMood = '';
  let genreChart = null;

  const accessToken =
    'BQAiHfdnZ6248ykj0nbFEyTROoSh8D0R7Hywioktnp8vMK0S-RMGi1szPiJ1alRCs30jBHDSPpKObNu7tvWWo4b8K6sMd8mvXmilWRnaWpb8lyhCV6M'; // Replace with your Spotify access token
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
    workout: '37i9dQZF1DX70RN3TfWWJh',
    uplifting: '37i9dQZF1DX3rxVfibe1L0',
    sleep: '37i9dQZF1DWZd79rJ6a7lp',
    reflective: '37i9dQZF1DXdPec7aLTmlC',
    road_trip: '37i9dQZF1DWUxHPh2rEj9l',
    background: '37i9dQZF1DWYBF1dYDPlHw',
  };

  const showLoadingIndicator = () => {
    moodButton.textContent = 'Loading...';
    moodButton.disabled = true;
  };

  const hideLoadingIndicator = () => {
    moodButton.textContent = selectedMood ? selectedMood : 'Select Mood';
    moodButton.disabled = false;
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
    const data = await response.json();
    return data.items.map((item) => item.track);
  };

  const getRandomElements = (array, count) => {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const getGenreDistribution = async (tracks) => {
    const artistIds = tracks
      .map((track) => track.artists[0].id)
      .filter((id, index, self) => self.indexOf(id) === index); // Unique artist IDs

    const genreCounts = {};

    for (const artistId of artistIds) {
      const response = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      data.genres.forEach((genre) => {
        if (genreCounts[genre]) {
          genreCounts[genre]++;
        } else {
          genreCounts[genre] = 1;
        }
      });
    }

    return genreCounts;
  };

  const displayGenreChart = (genreCounts) => {
    if (genreChart) {
      genreChart.destroy();
    }

    const genres = Object.keys(genreCounts);
    const counts = Object.values(genreCounts);

    genreChart = new Chart(genreChartCanvas, {
      type: 'pie',
      data: {
        labels: genres,
        datasets: [
          {
            label: 'Genre Distribution',
            data: counts,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
              'rgba(201, 203, 207, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(201, 203, 207, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
      },
    });
  };

  const displayRandomSongs = (tracks) => {
    songsContainer.innerHTML = '';

    tracks.forEach((track) => {
      const songCard = document.createElement('div');
      songCard.className = 'song-card';

      const albumCover = document.createElement('img');
      albumCover.src = track.album.images[0].url;
      albumCover.alt = track.name;

      const songTitle = document.createElement('h2');
      songTitle.textContent = track.name;

      const songArtist = document.createElement('p');
      songArtist.textContent = `by ${track.artists[0].name}`;

      songCard.appendChild(albumCover);
      songCard.appendChild(songTitle);
      songCard.appendChild(songArtist);
      songsContainer.appendChild(songCard);
    });
  };

  const showConfirmationMessage = (mood) => {
    selectedMoodSpan.textContent = mood;
    confirmationMessage.classList.add('show');
    setTimeout(() => {
      confirmationMessage.classList.remove('show');
    }, 2000);
  };

  const handleMoodSelection = async (mood) => {
    selectedMood = mood;
    moodButton.textContent = moodButton.querySelector(`[data-value="${mood}"]`);
    moodMenu.classList.remove('show');
    moodButton.textContent = mood;

    if (selectedMood) {
      showConfirmationMessage(mood); // Show confirmation message

      const playlistId = moodPlaylists[selectedMood];
      try {
        showLoadingIndicator();
        const tracks = await fetchPlaylistTracks(playlistId);
        const randomTracks = getRandomElements(tracks, 10);
        const genreCounts = await getGenreDistribution(randomTracks);
        console.log('Genre counts:', genreCounts); // For debugging
        displayGenreChart(genreCounts);
        displayRandomSongs(randomTracks);
      } catch (error) {
        console.error(error);
        alert('Failed to fetch playlist tracks. Please try again.');
      } finally {
        hideLoadingIndicator();
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
