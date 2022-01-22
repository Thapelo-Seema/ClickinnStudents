import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class IonicStorageService {

  private _storage: Storage | null = null;

  constructor(private storage: Storage) { 
    this.init();
  }

  async init(){
    const storage = await this.storage.create();
    this._storage = storage; 
  }

  public async setUser(client: Client){
    await this._storage?.set("client_uid", client.uid)
    await this._storage?.set('user_type', "client")
  }

  public async getUID(){
    return await this._storage?.get("client_uid");
  }

  public async getUserType(){
    return await this._storage?.get("user_type");
  }

  public async setUserType(){
    await this._storage?.set('user_type', "client")
  }

}
