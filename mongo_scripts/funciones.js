db.system.js.save({
	_id: "cUsuario",
	value: function (idUsuario,nick,det) 
	{ 
		try{
			db.Usuarios.insertOne({
			_id:idUsuario, 
			nickname:nick, 
			detalles:det,
			partidas:[],
			chats:{}});
			return true;
		}
		catch(e){
			return false;
		}
	}
});  

db.system.js.save({
	_id: "uDetalles",
	value: function (idUsuario,det) 
	{ 
		try{
			db.Usuarios.updateOne(
		   { _id: idUsuario },
		   {
		     $set: { detalles: det }
		   }
		);
			return true;
		}
		catch(e){

			return false;
		}
	}
});  

db.system.js.save({
	_id: "uNickname",
	value: function (idUsuario,nick) 
	{ 
		try{
			db.Usuarios.updateOne(
		   { _id: idUsuario },
		   {
		     $set: { nickname: nick }
		   }
		);
			return true;
		}
		catch(e){

			return false;
		}
	}
});  

db.system.js.save({
	_id: "linkUsuarioPartida",
	value: function (idUsuario,idPartida,color) 
	{ 
		try{
			if (db.Partidas.find({_id:idPartida}).toArray()[0].usuarios[0][0] == idUsuario || db.Partidas.find({_id:idPartida}).toArray()[0].usuarios[0][0] == idUsuario)
				return false;
			ok = false;
			if (db.Partidas.find({_id:idPartida}).toArray()[0].usuarios[0][0] ==0 && db.Partidas.find({_id:idPartida}).toArray()[0].usuarios[1][1]!=color){
				db.Partidas.update({_id:1},{$set : {'usuarios.0.0' : idUsuario}});
				db.Partidas.update({_id:1},{$set : {'usuarios.0.1' : color}});
				ok=true;
			}
			else if (db.Partidas.find({_id:idPartida}).toArray()[0].usuarios[1][0] == 0  && db.Partidas.find({_id:idPartida}).toArray()[0].usuarios[0][1]!=color){
				db.Partidas.update({_id:1},{$set : {'usuarios.1.0' : idUsuario}});
				db.Partidas.update({_id:1},{$set : {'usuarios.1.1' : color}});
				ok=true;
			}
			if (ok){
			db.Usuarios.update(
			   { _id: idUsuario },
			   { $push: { partidas: idPartida } });
				return true;
			}
		else
			return false;
		}
		catch(e){

			return false;
		}
	}
}); 

db.system.js.save({
	_id: "chat", 
	value : function (idEmisor,idReceptor,msg) 
	{ 
            if (db.Usuarios.find({_id:idEmisor}).toArray()[0]!=null && db.Usuarios.find({_id:idReceptor}).toArray()[0]!=null){
        		idReceptor='chats.'+idReceptor;
				db.Usuarios.update(
		   			{ _id: idEmisor },
		   			{ $push: { [idReceptor]:  [Date(),msg]} });
				return true;
			}
            else{
            	return false
            }
        }
    });

db.system.js.save({
	_id: "getChatLog", 
	value : function (idOne,idTwo) 
	{ 
                var R1=db.Usuarios.find({_id:idOne},{['chats.'+idTwo]:1,_id:0}).toArray()[0].chats[idTwo];
                var R2=db.Usuarios.find({_id:idTwo},{['chats.'+idOne]:1,_id:0}).toArray()[0].chats[idOne];
                lista=[];
                while(R1.length>0 || R2.length>0){
	                if(R1.length>0 && R2.length>0){
	                    fechaOne = Date.parse(R1[0][0]);
	                    fechaTwo = Date.parse(R2[0][0]);
	                    if(fechaOne<fechaTwo)
	                        lista.unshift([0,R1.shift()[1]]);
	                    else
	                        lista.unshift([1,R2.shift()[1]]);
	                }
	                else if(R1.length>0){
	                    while(R1.length>0)
	                        lista.unshift([0,R1.shift()[1]]);
	                }
	                else{
	                    while(R2.length>0)
	                        lista.unshift([1,R2.shift()[1]]);
	                }
            }
                return lista.reverse();
		}
    });

db.system.js.save({
	_id: "nuevaSesion",
	value: function (idJ1,color1,idJ2,color2,size,lineSize,nRondas) 
	{ 
		try{
			fila='[-1';
			for(x=1;x<size;x++){
				fila=fila+',-1';
			}
			fila=fila+']';
			tablero='['+fila;
			for(x=1;x<size;x++){
				tablero=tablero+','+fila;
			}
			tablero=tablero+']';
			ronda='{"estado":{"finalizador":"","causa":""},"tablero":'+tablero+',"jugadas":[]}';
			rondas='['+ronda;
			for(x=1;x<nRondas;x++){
				rondas=rondas+','+ronda;
			}
			rondas=rondas+']';
                        query='{"_id":'+(db.Partidas.find().count()+1)+', "estado":true, "tamano":'+size+',"tamano_linea":'+lineSize+',"usuarios":[['+idJ1+',"'+color1+'"],['+idJ2+',"'+color2+'"]],"rondas":'+rondas+'}';
                        db.Partidas.insertOne(JSON.parse([query]));
                        db.Usuarios.update(
   			{_id: idJ1},
   			{ $push: { partidas: [db.Partidas.find().count()] } });
                        db.Usuarios.update(
   			{_id: idJ2},
   			{ $push: { partidas: [db.Partidas.find().count()] } });
            return true;
		}
		catch(err){
			return false;
		}
	}
}); 

db.system.js.save({
	_id: "jugada",
	value: function (idPartida,ronda,fila,columna,jugador) 
	{ 
        try{
            path="rondas."+[ronda]+".jugadas";
			db.Partidas.update(
			   { _id: idPartida },
			   { $push: {[path] : [fila,columna] } });
			db.Partidas.update({_id:idPartida},{$set : {['rondas.'+ronda+'.tablero.'+fila+'.'+columna]:jugador}});
			return true;
		}
		catch(e){
			return false;
		}
	}
}); 

db.system.js.save({
	_id: "getInfoPartida",
	value: function (idPartida) 
	{ 
        return db.Partidas.find({_id:idPartida},{_id:1,estado:1,tamano:1,tamano_linea:1,usuarios:1}).toArray()[0];
		}
});  

db.system.js.save({
	_id: "getInfoRonda",
	value: function (idPartida,ronda) 
	{ 
        return db.Partidas.find({_id:idPartida}).toArray()[0].rondas[ronda];
		}
}); 

db.system.js.save({
	_id: "getTablero",
	value: function (idPartida,ronda) 
	{ 
        return db.Partidas.find({_id:idPartida}).toArray()[0].rondas[ronda].tablero;
		}
}); 

db.system.js.save({
	_id: "setTablero",
	value: function (idPartida,ronda,tablero) 
	{ 
            try{
                db.Partidas.update({_id:idPartida},{$set : {['rondas.'+ronda+'.tablero']:tablero}});
                return true
            }
            catch(e){
                return false
            }
		}
}); 

db.system.js.save({
	_id: "getGameLog",
	value: function (idPartida,ronda) 
	{ 
        return db.Partidas.find({_id:idPartida}).toArray()[0].rondas[ronda].jugadas;
		}
}); 

db.system.js.save({
	_id: "finalizarRonda",
	value: function (idPartida,ronda,idFinalizador,razon) 
	{ 
		try{
		path="rondas."+[ronda];
        db.Partidas.update(
        	{_id:idPartida},
        	{$set:{['rondas.'+ronda+'.estado.causa']:razon,['rondas.'+ronda+'.estado.finalizador']:idFinalizador}});
        	return true
		}
		catch(e){
			return false;
		}
		}
}); 

db.system.js.save({
	_id: "finalizarPartida",
	value: function (idPartida) 
	{ 
		try{
        db.Partidas.update(
        	{_id:idPartida},
        	{$set:{'estado':false}});
        	return true;
		}
		catch(e){
			return false;
		}
		}
}); 
db.system.js.save({
	_id: "getInfoRonda",
	value: function (idPartida,ronda) 
	{ 
		path="rondas."+[ronda];
        return db.Partidas.find({_id:idPartida},{['rondas'+ronda]:1}).toArray()[0].rondas[ronda];
		}
}); 
db.system.js.save({
	_id: "checkUsuario",
	value: function (idUsuario) 
	{ 
        return db.Usuarios.find({_id:idUsuario}).toArray()[0]!=null;
		}
}); 
