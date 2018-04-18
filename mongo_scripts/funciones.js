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
			friends:[],
			chats:{},
			invitaciones:[]});
			return true;
		}
		catch(e){
			return "Error de inserción";
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

			return "Error al actualizar la base de datos";
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

			return "Error al actualizar la base de datos";
		}
	}
});  

db.system.js.save({
	_id: "linkUsuarioPartida",
	value: function (idPartida,idUsuario,color) 
	{ 
		try{
			if (db.Partidas.find({_id:idPartida}).toArray()[0].usuarios[0][0] == idUsuario || db.Partidas.find({_id:idPartida}).toArray()[0].usuarios[0][0] == idUsuario)
				return false;
			ok = false;
			if (db.Partidas.find({_id:idPartida}).toArray()[0].usuarios[0][0] =="" && db.Partidas.find({_id:idPartida}).toArray()[0].usuarios[1][1]!=color){
				db.Partidas.update({_id:idPartida},{$set : {'usuarios.0.0' : idUsuario}});
				db.Partidas.update({_id:idPartida},{$set : {'usuarios.0.1' : color}});
				ok=true;
			}
			else if (db.Partidas.find({_id:idPartida}).toArray()[0].usuarios[1][0] == ""  && db.Partidas.find({_id:idPartida}).toArray()[0].usuarios[0][1]!=color){
				db.Partidas.update({_id:idPartida},{$set : {'usuarios.1.0' : idUsuario}});
				db.Partidas.update({_id:idPartida},{$set : {'usuarios.1.1' : color}});
				ok=true;
			}
			if (ok){
			db.Usuarios.update(
			   { _id: idUsuario },
			   { $push: { partidas: idPartida } });
				return true;
			}
			else
				return "Error: los usuarios o colores no son distintos";
		}
		catch(e){
			return "Fallo al completar";
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
            	return "Error, uno de los usuarios no existe"
            }
        }
    });

db.system.js.save({
	_id: "getChatLog", 
	value : function (idOne,idTwo) 
	{
		try{
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
		catch(e)
			{
			return "Error: probablemente alguno de los usuarios no existen"
			}
		}
    });

db.system.js.save({
	_id: "nuevaSesion",
	value: function (idJ1,color1,idJ2,color2,size,lineSize,nRondas) 
	{ 
		try{
			if ((db.Usuarios.find({_id:idJ1}).toArray()[0]==null && (idJ1!="e" && idJ1!="m" &&idJ1!="h")) || 
				(db.Usuarios.find({_id:idJ2}).toArray()[0]==null && (idJ2!="e" && idJ2!="m" &&idJ2!="h" && idJ2!="")) || 
				color1==color2 || idJ1==idJ2 ||
				db.Partidas.findOne({"usuarios.0.0":idJ1,"usuarios.1.0":idJ2,estado:true})!=null)
				return "Error: Existe una partida activa entre ambos usuarios, los usuarios o colores son los mismos o no se reconocen";
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
            query='{"_id":'+(db.Partidas.find().count()+1)+', "estado":true, "tamano":'+size+',"tamano_linea":'+lineSize+',"usuarios":[["'+idJ1+'","'+color1+'"],["'+idJ2+'","'+color2+'"]],"rondas":'+rondas+',"nRondas":'+nRondas+'}';
            db.Partidas.insertOne(JSON.parse([query]));
            if(idJ1!="e" && idJ1!="m" && idJ1!="h" && idJ1!="")
	            db.Usuarios.update(
	   			{_id: idJ1},
	   			{ $push: { partidas: db.Partidas.find().count() } });
            if(idJ2!="e" && idJ2!="m" && idJ2!="h" && idJ2!="")
	            db.Usuarios.update(
	   			{_id: idJ2},
	   			{ $push: { partidas: db.Partidas.find().count() } });
            return db.Partidas.find().count();
		}
		catch(err){
			return "Error de sistema";
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
			db.Partidas.update({_id: idPartida}, {$set:{lastMove: Date()}})
			return true;
		}
		catch(e){
			return "Fallo del sistema al realizar jugada:" +
			idPartida +","+
			ronda +","+
			fila +","+
			columna +","+
			jugador;
		}
	}
}); 

db.system.js.save({
	_id: "getInfoPartida",
	value: function (idPartida) 
	{ 
		try{
        	return db.Partidas.find({_id:idPartida},{_id:1,estado:1,tamano:1,tamano_linea:1,usuarios:1,lastMove:1,nRondas:1}).toArray()[0];
		}
		catch(e){
			return "Error de getInfoPartida"
		}
	}
});  

db.system.js.save({
	_id: "getInfoRonda",
	value: function (idPartida,ronda) 
	{ 
		try{
        	return db.Partidas.find({_id:idPartida}).toArray()[0].rondas[ronda];
		}
		catch(e){
			return "Error de getInfoRonda"
		}
	}
}); 

db.system.js.save({
	_id: "getTablero",
	value: function (idPartida,ronda) 
	{ 
		try{
        return db.Partidas.find({_id:idPartida}).toArray()[0].rondas[ronda].tablero;
		}
		catch(e){
		}
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
			return "Error setTablero, probablemente la partida o la ronda no corresponden a ningun tablero"
        }
	}
}); 

db.system.js.save({
	_id: "getGameLog",
	value: function (idPartida,ronda) 
	{ 
		try{
        return db.Partidas.find({_id:idPartida}).toArray()[0].rondas[ronda].jugadas;
		}
        catch(e){
			return "Error getGameLog, probablemente la partida o la ronda no corresponden a ningun tablero"
        }
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
			return "Error al finalizarRonda: partida o ronda invalidas";
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
			return "Error finalizarPartida: probablemente la partida no es valida";
		}
		}
}); 
db.system.js.save({
	_id: "getInfoRonda",
	value: function (idPartida,ronda) 
	{ 
		path="rondas."+[ronda];
        return db.Partidas.find({_id:idPartida}).toArray()[0].rondas[ronda];
		}
}); 
db.system.js.save({
	_id: "checkUsuario",
	value: function (idUsuario) 
	{ 
		try{
		if (idUsuario=="e")
			return({"nickname":"Easy Robot","detalles":"Robot facil"})
		else if (idUsuario=="m")
			return({"nickname":"Medium Robot","detalles":"Robot medio"})
		else if (idUsuario=="h")
			return({"nickname":"Hard Robot","detalles":"Robot dificil"})
        return db.Usuarios.find({_id:idUsuario},{_id:1,nickname:1,detalles:1}).toArray()[0];
    	}
    	catch(e){
    		return "Error checkUsuario: quiza el usuario no existe"
    	}
	}
}); 
db.system.js.save({
	_id: "checkNick",
	value: function (nick) 
	{ 
		try{
        	return db.Usuarios.findOne({nickname:nick},{_id:1,nickname:1,detalles:1});
		}
		catch(e){
			return "Error checkNick: quiza el usuario no existe"
		}
	}
}); 

db.system.js.save({
	_id: "gameListFilter",
	value: function (idUsuario,activo) 
	{ 
		try{
		let result = db.Usuarios.find({_id:idUsuario},{partidas:1}).toArray()[0];
		let retorno = [];
		if (result!=null){
			let listaPartidas = result.partidas;
			listaPartidas.forEach(function(x){
				if(db.Partidas.find({_id:x,estado:activo}).toArray()[0]!=null)
					retorno.push(x);
			});
		}
        return retorno;
		}
		catch(e){
			return "Error gameListFilter: quiza el usuario no existe"
		}
	}
}); 

db.system.js.save({
	_id: "rondaActiva",
	value: function (idPartida) 
	{ 
		try{
		let result = db.Partidas.find({_id:idPartida},{rondas:1,nRondas:1}).toArray()[0];
		if (result!=null){
			let listaRondas = result.rondas;
			for (let x = 0; x < result.nRondas;x++){
				if(listaRondas[x].estado.finalizador=="")
					return x;
			}
		}
        return -1;
		}
		catch(e){
			return "Error rondaActiva: quiza la partida no existe"
		}
	}
}); 

db.system.js.save({
	_id: "friend",
	value: function (id1,id2) 
	{ 
		try{
			if (db.Usuarios.findOne({_id:id2})==null || id1==id2)
				return "No puedes ser tu propio amigo";
			let friendList = db.Usuarios.find({_id:id1}).toArray()[0].friends;
			if (friendList==null)
				return "Error friend: quiza el usuario no existe";
			friendList.forEach(x =>{
				if (x==id2)
					return "ya tienes este amigo";
			})
			db.Usuarios.update(
	   			{_id: id1},
	   			{ $push: { friends: id2 } });
			return true;
		}
		catch(e){
			return "Error friend: quiza el usuario no existe";
		}
}})


db.system.js.save({
	_id: "friendList",
	value: function (id, page) 
	{ 
		try{
			if (db.Usuarios.findOne({_id:id})==null)
				return "Error friendList: el usuario no existe";
			let friendList = db.Usuarios.find({_id:id}).toArray()[0].friends;
			if (friendList==null)
				return "algo malo pasó :c";
			let richList = [];
			for(let x = (page-1)*10; friendList[x]!=null && x < page*10;x++)
				richList.push(db.Usuarios.findOne({_id:friendList[x]},{nickname:1,detalles:1,_id:1}))
			return richList;
		}
		catch(e){
			return "Error friendList"
		}
}})

db.system.js.save({
	_id: "disponibles",
	value: function (page) 
	{ 
		try{
		let result = db.Partidas.find({'usuarios.1.0':"",estado:true}).toArray().slice((page-1)*10,page*10);
		let retorno = [];
        let index = 0;
        while(result[index]!=null){
            let creador = db.Usuarios.findOne({_id:result[index].usuarios[0][0]});
            retorno.push({"creador":creador.nickname,"#Partida":result[index]._id,"color":result[index].usuarios[0][1],"tamaño":result[index].tamano,"victoria":result[index].tamano_linea,"rondas":result[index].nRondas})
            index++
        }
        return retorno;
		}
		catch(e){
			return "Error de consulta: disponibles"
		}
    }
});

db.system.js.save({
	_id: "invitar",
	value: function (idAnfitrion,color,IDinvitado,tamano,tamano_linea,nRondas) 
	{ 
		if(db.Usuarios.findOne({"invitaciones.anfitrion":idAnfitrion,_id:IDinvitado})!=null || 
			db.Partidas.findOne({"usuarios.0.0":idAnfitrion,"usuarios.1.0":IDinvitado,estado:true})!=null ||
			db.Partidas.findOne({"usuarios.1.0":IDinvitado,"usuarios.0.0":idAnfitrion,estado:true})!=null)
			return "Error: la invitacion ya existe o ya existe una partida activa entre ambos jugadores"
		else{
			db.Usuarios.update({_id:IDinvitado},{$push:{invitaciones:{anfitrion:idAnfitrion,color:color,tamano:tamano,tamano_linea:tamano_linea,nRondas:nRondas}}})
            return true;
            }
	}
});

db.system.js.save({
	_id: "aceptar",
	value: function (idAnfitrion, idUsuario) 
	{ 
		let invitacion = db.Usuarios.findOne({_id:idUsuario,"invitaciones.anfitrion":idAnfitrion})
        if (invitacion ==null)
            return "Error: la invitacion no existe"
        invitacion = invitacion.invitaciones[0]
		db.Usuarios.update({_id:idUsuario}, {$pull:{ "invitaciones": {"anfitrion": idAnfitrion}}}, false, false)
		return invitacion;
	}
});

db.system.js.save({
	_id: "rechazar",
	value: function (idAnfitrion, idUsuario) 
	{ 
		let invitacion = db.Usuarios.findOne({_id:idUsuario,"invitaciones.anfitrion":idAnfitrion})
        if (invitacion ==null)
            return "Error: la invitacion no existe"
		db.Usuarios.update({_id:idUsuario}, {$pull:{ "invitaciones": {"anfitrion": idAnfitrion}}}, false, false)
		return true;
	}
});

db.system.js.save({
	_id: "invitaciones",
	value: function (idUsuario,page) 
	{ 
		let user = db.Usuarios.findOne({_id:idUsuario})
        if (user ==null)
            return "Error: el usuario no existe";
		return user.invitaciones.slice((page-1)*10,page*10);
	}
});

