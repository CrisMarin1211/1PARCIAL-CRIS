const socket = io('http://localhost:5050', { path: '/real-time' });

const divLogin = document.getElementById('div-login');
const formLogin = document.getElementById('form-login');
const divStart = document.getElementById('div-start');
const playerListDiv = document.getElementById('playerList');
const startGameBtn = document.getElementById('startGameBtn');
const marcoBtn = document.getElementById('marcoBtn');
const poloBtn = document.getElementById('poloBtn');

formLogin.addEventListener('submit', (event) => {
	event.preventDefault();
	const namePlayer = document.getElementById('name').value;

	// Emitir evento de login
	socket.emit('Client:Login', {
		name: namePlayer,
		role: 'player',
	});

	localStorage.setItem('login', namePlayer);
	divLogin.style.display = 'none';
	divStart.classList.remove('hidden'); // Muestra la pantalla de jugadores
});

socket.on('updatePlayers', (players) => {
	playerListDiv.innerHTML = ''; // Limpiar lista de jugadores

	players.forEach((player) => {
		const playerElement = document.createElement('div');
		playerElement.textContent = player.name;
		playerListDiv.appendChild(playerElement);
	});

	// Mostrar el botón de inicio solo si hay 3 o más jugadores
	startGameBtn.style.display = players.length >= 3 ? 'block' : 'none';
});

startGameBtn.addEventListener('click', () => {
	socket.emit('startGame');
});

socket.on('assignRoles', ({ marco, specialPolo }) => {
	alert(`Marco es ${marco.name} y uno de los Polos es especial.`);
	if (socket.id === marco.id) {
		marcoBtn.style.display = 'block';
	} else {
		poloBtn.style.display = 'block';
	}
});

// Eventos para gritar Marco o Polo
marcoBtn.addEventListener('click', () => {
	socket.emit('marcoYell');
});

poloBtn.addEventListener('click', () => {
	socket.emit('poloYell', socket.id);
});

socket.on('marcoYelled', () => {
	alert('Marco ha gritado');
});

socket.on('poloYelled', (poloPlayer) => {
	alert(`${poloPlayer.name} ha gritado Polo`);
});

socket.on('gameOver', (message) => {
	alert(message);
	location.reload(); // Reinicia el juego
});

socket.on('rolesUpdated', ({ marco, selectedPolo }) => {
	alert(`${selectedPolo.name} es ahora Marco.`);
});

socket.on('errorMessage', (message) => {
	alert(message);
});
