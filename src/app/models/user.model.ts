import { Injectable } from "@angular/core";

@Injectable()
export class UserDetails {
    private userID:number
    private nickName:string
    private details?:string
    private static instance:UserDetails

    setUserID(userID:number){
        this.userID = userID
    }

    get getUserID(){
        return this.userID
    }

    get getUserNickName(){
        return this.nickName
    }

    static get Instance() {
        if (this.instance === null || this.instance === undefined) {
            this.instance = new UserDetails();
        }
        return this.instance;
    }
}