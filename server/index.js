const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.json());
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
	path: '/real-time',
	cors: {
		origin: '*',
	},
});

let players = [];
let marco = null;
let specialPolo = null;

function assignRoles() {
	marco = players[Math.floor(Math.random() * players.length)];
	specialPolo = players[Math.floor(Math.random() * players.length)];
	while (specialPolo.id === marco.id) {
		specialPolo = players[Math.floor(Math.random() * players.length)];
	}
	io.emit('assignRoles', { marco, specialPolo });
}

io.on('connection', (socket) => {
	console.log('Jugador conectado:', socket.id);

	socket.on('Client:Login', ({ name, role }) => {
		const newPlayer = { id: socket.id, name, role: 'Polo' };
		players.push(newPlayer);
		io.emit('updatePlayers', players);
	});

	socket.on('disconnect', () => {
		players = players.filter((player) => player.id !== socket.id);
		io.emit('updatePlayers', players);
		console.log('Jugador desconectado:', socket.id);
	});

	socket.on('startGame', () => {
		if (players.length >= 3) {
			assignRoles();
			io.emit('gameStarted');
		} else {
			socket.emit('errorMessage', 'Se necesitan al menos 3 jugadores para iniciar el juego.');
		}
	});

	socket.on('marcoYell', () => {
		io.emit('marcoYelled');
	});

	socket.on('poloYell', (playerId) => {
		const poloPlayer = players.find((player) => player.id === playerId);
		io.emit('poloYelled', poloPlayer);
	});

	socket.on('selectPolo', (poloId) => {
		const selectedPolo = players.find((player) => player.id === poloId);
		if (selectedPolo.id === specialPolo.id) {
			io.emit('gameOver', 'Marco ha ganado seleccionando el Polo Especial.');
		} else {
			marco.role = 'Polo';
			selectedPolo.role = 'Marco';
			marco = selectedPolo;
			io.emit('rolesUpdated', { marco, selectedPolo });
		}
	});
});

httpServer.listen(5050, () => {
	console.log('Servidor escuchando en http://localhost:5050');
});
