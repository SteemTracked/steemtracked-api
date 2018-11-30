function chooseConnection(connections, start, end){
  for(var i = start; i < end; i++){
    if(!connections[i]._connected && !connections[i]._connected) return i;
  }
  return i;
}

module.exports = chooseConnection