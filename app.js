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

  const accessToken ='BQAH43q_aRQSYaxUXT6U5c1_pR9-1ZxaCmXctQeeyiC89rOsAHD0GQrHlmgBVglOuc6nlg6jcc5xE3rHd8k3ITmvdf2EfjFOzxvXOhDavwLxzZ9FkMrBcN_i4NmcpzvK1s-cjtGlyjY'; // Replace with actual access token

  const moodPlaylists = {
    Happy: '37i9dQZF1EIgG2NEOhqsD7',
    Chill: '6IKQrtMc4c00YzONcUt7QH',
    Energetic: '37i9dQZF1EIeEZPgsd7pko',
    Sad: '5irzXdNeeKc0Dg3UK4Ww6n',
    Angry: '0a4Hr64HWlxekayZ8wnWqx',
    Focus: '3WK8djg4g0XFKkEIRRvOgg',
    Relax: '7JabddFr3Q6JPsND4v9Swf',
    Romantic: '4cJ8qUzt5CSTE9XN5uK2z2',
    Party: '5xS3Gi0fA3Uo6RScucyct6',
    Workout: '2SM6rniZl84fEyMCB5KMQB',
    Uplifting: '5BxqiXdL315dDipxbfKXdr',
    Sleep: '6eHd1vqUfBOVd71SHdR09l',
    Reflective: '3G9rthSd7lmSSQj8YqDEBU',
    Road_trip: '6DHD12EjGiRV9uSgIcnn4M',
    Background: '0qg6KzBLO7rL48c0QfNpLZ',
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

  // Function to get top N genres by count
  const getTopGenres = (genreCounts, topN = 5) => {
    const sortedGenres = Object.entries(genreCounts).sort(
      (a, b) => b[1] - a[1]
    );
    return sortedGenres.slice(0, topN);
  };

  const displayGenreChart = (genreCounts) => {
    if (genreChart) {
      genreChart.destroy();
    }

    // Get the top 5 genres
    const topGenres = getTopGenres(genreCounts, 5);
    const genres = topGenres.map((entry) => entry[0]);
    const counts = topGenres.map((entry) => entry[1]);

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
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
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
      songCard.setAttribute('tabindex', '0'); // Make song card focusable

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

      // Add event listener for keyboard interaction
      songCard.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          // Add logic here to handle what happens when Enter or Space is pressed
          console.log(`Playing ${track.name} by ${track.artists[0].name}`);
        }
      });

      // Optional: Add click event listener for mouse interaction
      songCard.addEventListener('click', () => {
        console.log(`Playing ${track.name} by ${track.artists[0].name}`);
      });
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

  // Event listener for dropdown menu items
  document.querySelectorAll('.dropdown-content a').forEach((item) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      handleMoodSelection(event.target.dataset.value);
    });

    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleMoodSelection(event.target.dataset.value);
      }
    });
  });

  // Toggle dropdown on mood button click
  moodButton.addEventListener('click', () => {
    moodMenu.classList.toggle('show');
    if (moodMenu.classList.contains('show')) {
      moodMenu.querySelector('a').focus(); // Focus on the first item
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (event) => {
    if (
      !moodButton.contains(event.target) &&
      !moodMenu.contains(event.target)
    ) {
      moodMenu.classList.remove('show');
    }
  });

  // Handle keyboard navigation in the dropdown
  moodMenu.addEventListener('keydown', (event) => {
    const items = Array.from(moodMenu.querySelectorAll('a'));
    const currentIndex = items.indexOf(document.activeElement);
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        newIndex = (currentIndex + 1) % items.length;
        event.preventDefault();
        break;
      case 'ArrowUp':
        newIndex = (currentIndex - 1 + items.length) % items.length;
        event.preventDefault();
        break;
      case 'Escape':
        moodMenu.classList.remove('show');
        moodButton.focus();
        break;
    }

    if (newIndex !== currentIndex) {
      items[newIndex].focus();
    }
  });
});
