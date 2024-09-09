const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express(); // Creates HTTP server
const server = http.createServer(app);
const io = new Server(httpServer, {
	path: '/real-time',
	cors: {
		origin: '*', // Allow requests from any origin
	},
}); // Creates a WebSocket server, using the same HTTP server as the Express app and listening on the /real-time path

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

	// nuevo jugador
	players.push({ id: socket.id, name: `Jugador ${players.length + 1}`, role: 'Polo' });
	io.emit('updatePlayers', players);

	socket.on('disconnect', () => {
		players = players.filter((player) => player.id !== socket.id);
		io.emit('updatePlayers', players);
		console.log('Jugador desconectado:', socket.id);
	});

	// iniciar juego 3 o mas jugadores
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
			// Cambiar roles entre Marco y el Polo seleccionado
			marco.role = 'Polo';
			selectedPolo.role = 'Marco';
			marco = selectedPolo;
			io.emit('rolesUpdated', { marco, selectedPolo });
		}
	});
});

// server.listen(3000, () => {
//     console.log('Servidor corriendo en el puerto 3000');
// });

httpServer.listen(5050, () => {
	// Starts the server on port 5050, same as before but now we are using the httpServer object
	console.log(`Server is running on http://localhost:${5050}`);
});
