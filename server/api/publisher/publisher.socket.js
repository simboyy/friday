/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Publisher = require('./publisher.model');

exports.register = function(socket) {
  Publisher.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Publisher.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('publisher:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('publisher:remove', doc);
}