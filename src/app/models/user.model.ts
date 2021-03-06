import { Injectable } from "@angular/core";

@Injectable()
export class UserDetails {
    private userID:any
    private nickName:string
    private details?:string
    private url:string
    private currentGameID:any
    private botGame:boolean
    private active:boolean = false;
    private replayMode = false;
    private static instance:UserDetails;

    setNickNameDetails(nickname: any, details:any){
        this.nickName = nickname
        this.details = details
    }

    setUserID(userID:any){
        this.userID = userID
    }

    setCurrentGameID(id:any){
        this.currentGameID = id
    }

    getCurrentGameID(){
        return this.currentGameID
    }

    getUserID(){
        return this.userID
    }

    getDetails(){
        return this.details
    }

    getNickName(){
        return this.nickName
    }

    setBotGame(isBot: boolean){
        this.botGame = isBot
    }

    isBotGame(){
        return this.botGame
    }
    setActive(id,nick,det,url){
        this.nickName=nick;
        this.userID=id;
        this.details=det;
        this.url = url;
        this.active = true;
    }
    getActive(){
        return this.active;
    }
    getUrl(){
        return this.url;
    }

    setreplayMode(mode){
        this.replayMode=mode
    }
    getreplayMode(){
        return this.replayMode;
    }
    static get Instance() {
        if (this.instance === null || this.instance === undefined) {
            this.instance = new UserDetails();
        }
        return this.instance;
    }
}