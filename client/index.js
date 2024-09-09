let socket = io('http://localhost:5050', { path: '/real-time' });

const divLogin = document.getElementById('div-login');
const formGame = document.getElementById('form-login');
const divStar = document.getElementById('div-start');

formGame.addEventListener('submit', (event) => {
	event.preventDefault();
	const namePlayer = document.getElementById('name');
	socket.emit('Client:Login', {
		name: namePlayer.value,
		role: 'player',
	});
	localStorage.setItem('login', namePlayer.value);
	('Login successful');
	divLogin.style.display = 'none';
	namePlayer.value = '';
	divStar.style.display = 'block';
});

divStar.innerHTML = 'Waiting for the game to start';
socket.on('waiting-to-start', (message) => {
	divInitGame.innerHTML = message;
});

const playerListDiv = document.getElementById('playerList');
const startGameBtn = document.getElementById('startGameBtn');
const marcoBtn = document.getElementById('marcoBtn');
const poloBtn = document.getElementById('poloBtn');

socket.on('updatePlayers', (players) => {
	playerListDiv.innerHTML = '';
	players.forEach((player) => {
		const playerElement = document.createElement('div');
		playerElement.textContent = player.name;
		playerListDiv.appendChild(playerElement);
	});

	if (players.length >= 3) {
		startGameBtn.style.display = 'block';
	} else {
		startGameBtn.style.display = 'none';
	}
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
	location.reload(); // Recargar la página para reiniciar el juego
});

socket.on('rolesUpdated', ({ marco, selectedPolo }) => {
	alert(`${selectedPolo.name} es ahora Marco.`);
});

socket.on('errorMessage', (message) => {
	alert(message);
});
