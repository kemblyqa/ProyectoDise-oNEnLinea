import { Injectable } from "@angular/core";

@Injectable()
export class UserDetails {
    private userID:string
    private nickName:string
    private details?:string
    private currentGameID:any
    private static instance:UserDetails

    setNickNameDetails(nickname: any, details:any){
        this.nickName = nickname
        this.details = details
    }

    setUserID(userID:string){
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

    static get Instance() {
        if (this.instance === null || this.instance === undefined) {
            this.instance = new UserDetails();
        }
        return this.instance;
    }
}