const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');

const USE_CORS = true;
const USE_ROOM = true;

const PORT = process.env.PORT || 3003;

const server = http.createServer(app)

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

var io;

if (USE_CORS) {

    const cors = require('cors');
    app.use(cors());

    io = new Server(server, {
        cors: {
            origin: '*', //["http://localhost:3000", "http://localhost:3001"],
            credentials: true,
            methods: ["GET", "POST"],
        },
    });

} else {
    io = new Server(server)
}

io.on("connection", function (socket) {
    console.log(`User Connected: ${socket.id}`);

    // data: { room: delivery.tracking_code }
    socket.on("join_room", function (data) {
        socket.join(data.room)
    });

    // data: {room: delivery.tracking_code, delivery: DeliveryType, sender: 'customer' | 'delivery_boy'}
    socket.on("send_delivery_evolution", function (data) {
        socket.to(data.room).emit("receive_delivery_evolution", data)
    });

    // data: {room: delivery.tracking_code, coordinates: {latitude: number, longitude?: number, heading: number | null}}
    socket.on("send_tracking_current_coords", function (data) {
        // console.log({ data });
        socket.to(data.room).emit("receive_tracking_current_coords", data)
    });

    // data: {room: delivery.tracking_code, delivery: DeliveryType, sender: 'customer' | 'delivery_boy'}
    socket.on("send_validation_delivery", function (data) {
        socket.to(data.room).emit("receive_validation_delivery", data)
    });

    // data: {room: delivery.tracking_code, delivery?: DeliveryType, checkout?: DeliveryCheckoutType, sender: 'customer' | 'delivery_boy'}
    socket.on("send_delivery_checkout", function (data) {
        socket.to(data.room).emit("receive_delivery_checkout", data)
    });

    // data: {sender: 'customer'|'seller', order: OrderType}
    socket.on("send_order", function (data) {
        socket.broadcast.emit("receive_order", data)
        console.log({ data });
    });

    // data: {sender: 'customer'|'delivery_boy', delivery: DeliveryType}
    socket.on("send_delivery", function (data) {
        socket.broadcast.emit("receive_delivery", data)
        console.log({ data });
    });

    // data: {advertisement: AdType}
    socket.on('send_advertisement', function (data) {
        socket.broadcast.emit("receive_advertisement", data)
    })

    // data: {advertisement_id: number}
    socket.on('send_delete_advertisement', function (data) {
        socket.broadcast.emit("receive_delete_advertisement", data)
    })

    // data: {sender: 'user' | 'admin', user: UserType}
    socket.on("send_user", function (data) {
        socket.broadcast.emit("receive_user", data)
    });

    if (USE_ROOM) {

    } else {
        socket.on("send_order_check_fare", function (data) {
            socket.broadcast.emit("receive_order_check_fare", data)
        });
        socket.on("send_order_fixed_amount", function (data) {
            socket.broadcast.emit("receive_order_fixed_amount", data)
        });
        socket.on("send_canceled_temporary_order", function (data) {
            socket.broadcast.emit("receive_canceled_temporary_order", data)
        });

        // DELIVERY CASE
        socket.on("send_pending_delivery", function (data) {
            socket.broadcast.emit("receive_pending_delivery", data)
        });
        socket.on("send_delivery_check_fare", function (data) {
            socket.broadcast.emit("receive_delivery_check_fare", data)
        });
        socket.on("send_delivery_fixed_amount", function (data) {
            socket.broadcast.emit("receive_delivery_fixed_amount", data)
        });
        socket.on("send_canceled_temporary_delivery", function (data) {
            socket.broadcast.emit("receive_canceled_temporary_delivery", data)
        });
    }

    socket.on('disconnect', () => {
        console.log(`User ${socket.id} diconnected.`);
    })
});

server.listen(PORT, () => {
    console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
})