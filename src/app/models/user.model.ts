import { Injectable } from "@angular/core";

@Injectable()
export class UserDetails {
    private userID:any
    private nickName:string
    private details?:string
    private currentGameID:any
    private botGame:boolean
    private static instance:UserDetails
    private router :Router;

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

    static get Instance() {
        if (this.instance === null || this.instance === undefined) {
            this.instance = new UserDetails();
        }
        return this.instance;
    }
}